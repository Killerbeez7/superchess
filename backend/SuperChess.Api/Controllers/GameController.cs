using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Data;
using SuperChess.Api.Models;
using SuperChess.Api.Dtos;
using SuperChess.Core.Engine.Board;
using SuperChess.Core.Engine;
using SuperChess.Core.Engine.Serialization;
using SuperChess.Core.Models;
using Microsoft.AspNetCore.SignalR;
using SuperChess.Api.Hubs;

namespace SuperChess.Api.Controllers;

[ApiController]
[Route("games")]
public sealed class ChessGameController(ChessGameDbContext context, IHubContext<GameHub> hubContext) : ControllerBase
{
    private readonly ChessGameDbContext _context = context;
    private readonly IHubContext<GameHub> _hubContext = hubContext;

    // List all games
    [HttpGet]
    public async Task<ActionResult<List<ChessGame>>> GetChessGames()
    {
        var games = await _context.ChessGames
            .AsNoTracking()
            .Include(g => g.Player1)
            .Include(g => g.Player2)
            .ToListAsync();
        return Ok(games);
    }

    // Get a game by id
    [HttpGet("{gameId:int}")]
    public async Task<ActionResult<ChessGame>> GetChessGameById(int gameId)
    {
        var game = await _context.ChessGames
            .AsNoTracking()
            .Include(g => g.Player1)
            .Include(g => g.Player2)
            .FirstOrDefaultAsync(g => g.Id == gameId);
        if (game is null)
        {
            return NotFound();
        }

        return Ok(game);
    }

    // Create a new game
    [HttpPost]
    public async Task<ActionResult<ChessGame>> CreateChessGame([FromBody] GameCreateRequestDto request)
    {
        // Create/Lookup Player1 (stub: create new; add auth/DB lookup later)
        var player1 = new Player { DisplayName = request.Player1DisplayName, Color = request.PreferredColor };
        _context.Players.Add(player1);
        await _context.SaveChangesAsync();

        var newGame = new ChessGame
        {
            Player1Id = player1.Id,
            Player1 = player1,
            Player2Id = null,
            Player2 = null,
            Player1Color = request.PreferredColor,
            Player2Color = request.PreferredColor == PlayerColor.Black ? PlayerColor.White : PlayerColor.Black,
            Status = GameStatus.Waiting,
            WhoseTurn = PlayerColor.White,
            TimeControlSeconds = request.BaseTimeSeconds,
            IncrementSeconds = request.IncrementSeconds,
            IsRated = request.IsRated,
            AllowSpectators = request.AllowSpectators
        };
        _context.ChessGames.Add(newGame);
        await _context.SaveChangesAsync();

        // Load initial board (engine integration)
        newGame.Fen = new ChessBoard().ToFen();  // Starting FEN

        return CreatedAtAction(nameof(GetChessGameById), new { gameId = newGame.Id }, newGame);
    }

    [HttpPost("{gameId:int}/join")]
    public async Task<ActionResult<ChessGame>> JoinGame(int gameId, [FromBody] GameJoinRequestDto request)
    {
        var game = await _context.ChessGames
            .Include(g => g.Player1)
            .Include(g => g.Player2)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game is null)
            return NotFound("Game not found");

        if (game.Status != GameStatus.Waiting)
            return BadRequest("Game not waiting for join (already active/full)");

        if (game.Player1Id == request.PlayerId)
            return BadRequest("Cannot join as creator");

        var player2 = new Player { DisplayName = request.PlayerDisplayName, Color = PlayerColor.Black };
        _context.Players.Add(player2);
        await _context.SaveChangesAsync();

        game.Player1Color = PlayerColor.White;
        game.Player2Color = PlayerColor.Black;
        game.Player2Id = player2.Id;
        game.Player2 = player2;
        game.Status = GameStatus.Active;
        game.WhoseTurn = PlayerColor.White;
        game.Fen = new ChessBoard().ToFen();
        game.LastMoveAt = DateTimeOffset.UtcNow;
        game.RemainingSecondsPlayer2 = game.TimeControlSeconds ?? 600;

        await _context.SaveChangesAsync();

        // SignalR: Notify group (players/spectators)
        await _hubContext.Clients.Group($"Game_{gameId}").SendAsync("GameJoined", new
        {
            GameId = gameId,
            Player2 = new { player2.Id, player2.DisplayName },
            game.Fen,
            Status = game.Status.ToString(),
            WhoseTurn = game.WhoseTurn.ToString()
        });

        return Ok(game);
    }



    // Make a move
    [HttpPost("{gameId:int}/move")]
    public async Task<ActionResult<ChessGame>> MakeMove(int gameId, [FromBody] GameMoveRequestDto request)
    {
        var game = await _context.ChessGames
            .Include(g => g.Player1)
            .Include(g => g.Player2)
            .Include(g => g.Moves)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game is null)
            return NotFound();

        if (game.Status != GameStatus.Active)
            return BadRequest("Game not active");

        if (string.IsNullOrWhiteSpace(request.Uci) || request.Uci.Length < 4)
            return BadRequest("Invalid UCI move");

        var board = FENParser.Parse(game.Fen);

        var fromStr = request.Uci.Substring(0, 2);
        var toStr = request.Uci.Substring(2, 2);
        var from = Position.FromUci(fromStr);
        var to = Position.FromUci(toStr);
        var piece = board[from];

        if (piece is null)
            return BadRequest("No piece at from position");

        if (piece.Color != game.WhoseTurn)
            return BadRequest("Not your turn");

        // Apply move (engine)
        board.Move(piece, from, to);
        game.Fen = board.ToFen();
        game.WhoseTurn = board.Turn;
        game.LastMoveAt = DateTimeOffset.UtcNow;

        // Clock
        if (game.WhoseTurn == PlayerColor.White)
        {
            game.RemainingSecondsPlayer1 -= 10;
            if (request.ClientRemainingSeconds.HasValue)
                game.RemainingSecondsPlayer1 = request.ClientRemainingSeconds.Value;
        }
        else
        {
            game.RemainingSecondsPlayer2 -= 10;
            if (request.ClientRemainingSeconds.HasValue)
                game.RemainingSecondsPlayer2 = request.ClientRemainingSeconds.Value;
        }

        // Check game over
        bool isOver = false;
        if (isOver)
        {
            game.Status = GameStatus.Finished;
            game.Result = GameResult.WhiteWin;
            game.EndReason = GameEndReason.Checkmate;
        }

        // Persist move
        var newMove = new Move
        {
            ChessGameId = gameId,
            MoveNumber = game.Moves.Count + 1,
            ByColor = piece.Color,
            From = fromStr,
            To = toStr,
            Promotion = request.Uci.Length == 5 ? request.Uci[4].ToString() : null,
            Uci = request.Uci,
            PlayedAt = DateTimeOffset.UtcNow
        };
        _context.Moves.Add(newMove);

        await _context.SaveChangesAsync();

        // SignalR broadcast
        await _hubContext.Clients.Group($"Game_{gameId}").SendAsync("MoveMade", new
        {
            GameId = gameId,
            NewFen = game.Fen,
            Move = new { newMove.From, newMove.To, newMove.Promotion, newMove.Uci },
            game.WhoseTurn,
            IsGameOver = isOver,
            Result = isOver ? game.Result.ToString() : null,
            EndReason = isOver ? game.EndReason.ToString() : null
        });

        return Ok(game);
    }

    // Get legal moves
    [HttpGet("{gameId:int}/legal")]
    public async Task<ActionResult<IEnumerable<string>>> GetLegalMoves(int gameId, [FromQuery] string? from = null)
    {
        var game = await _context.ChessGames.AsNoTracking().FirstOrDefaultAsync(g => g.Id == gameId);
        if (game is null)
            return NotFound();

        var board = FENParser.Parse(game.Fen);
        var moves = board.GetLegalMoves(game.WhoseTurn, from);
        return Ok(moves);
    }

    private static PlayerColor GetCallerColor(ChessGame game, int playerId)
    {
        if (game.Player1Id == playerId)
            return game.Player1Color;
        if (game.Player2Id.HasValue && game.Player2Id.Value == playerId)
            return game.Player2Color;
        return PlayerColor.None;
    }
}