using SuperChess.Api.Contracts.Games;
using SuperChess.Api.Data.Repositories;
using SuperChess.Api.Domain.Enums;
using SuperChess.Api.Realtime;
using SuperChess.Api.Models;
using SuperChess.Core.Chess;
using SuperChess.Api.Services.Mapping;

namespace SuperChess.Api.Services.Games;

public class GameService : IGameService
{
    private readonly IGameRepository _repo;
    private readonly IGameNotifier _notifier;
    private readonly IChessEngine _engine;


    public GameService(
        IGameRepository repo,
        IGameNotifier notifier,
        IChessEngine engine)
    {
        _repo = repo;
        _notifier = notifier;
        _engine = engine;
    }

    private async Task BroadcastOpenGamesChangedAsync()
    {
        var waitingGames = await _repo.GetWaitingGamesAsync();

        var response = waitingGames.Select(GameMapper.ToResponse).ToList();

        await _notifier.NotifyOpenGamesChangedAsync(response);
    }

    public async Task<GameSessionResponse> CreateGameAsync(CreateGameRequest request)
    {
        var trimmedName = request.PlayerName.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new ArgumentException("Player name is required.");
        }

        var whitePlayer = new Player
        {
            Id = Guid.NewGuid(),
            DisplayName = trimmedName,
            SessionToken = Guid.NewGuid().ToString("N")
        };

        var game = new ChessGame
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = whitePlayer.Id,
            WhitePlayer = whitePlayer,
            Status = GameStatus.Waiting,
            CurrentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            WhoseTurn = PieceColor.White,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _repo.AddPlayer(whitePlayer);
        _repo.AddGame(game);

        await _repo.SaveChangesAsync();
        await BroadcastOpenGamesChangedAsync();

        return GameMapper.ToSessionResponse(game, whitePlayer, PieceColor.White);
    }

    // Get game
    public async Task<GameResponse?> GetGameAsync(Guid gameId)
    {
        var game = await _repo.GetByIdWithDetailsAsync(gameId);
        return game is null ? null : GameMapper.ToResponse(game);
    }

    // Get games list
    public async Task<List<GameResponse>> GetGamesAsync()
    {
        var games = await _repo.GetWaitingGamesAsync();
        return games.Select(GameMapper.ToResponse).ToList();
    }

    // Join game
    public async Task<GameSessionResponse?> JoinGameAsync(Guid gameId, JoinGameRequest request)
    {
        var trimmedName = request.PlayerName.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new ArgumentException("Player name is required.");
        }

        var game = await _repo.GetByIdWithDetailsAsync(gameId);

        if (game is null)
        {
            return null;
        }

        if (game.BlackPlayerId is not null)
        {
            throw new InvalidOperationException("Game already has two players.");
        }

        if (!string.IsNullOrWhiteSpace(request.ExistingSessionToken) &&
            request.ExistingSessionToken == game.WhitePlayer.SessionToken)
        {
            throw new InvalidOperationException("You cannot join as both players.");
        }

        var blackPlayer = new Player
        {
            Id = Guid.NewGuid(),
            DisplayName = trimmedName,
            SessionToken = Guid.NewGuid().ToString("N")
        };

        game.BlackPlayerId = blackPlayer.Id;
        game.BlackPlayer = blackPlayer;
        game.Status = GameStatus.Active;
        game.UpdatedAtUtc = DateTime.UtcNow;

        _repo.AddPlayer(blackPlayer);

        await _repo.SaveChangesAsync();
        await BroadcastOpenGamesChangedAsync();

        var response = GameMapper.ToResponse(game);
        var sessionResponse = GameMapper.ToSessionResponse(game, blackPlayer, PieceColor.Black);

        await _notifier.NotifyPlayerJoinedAsync(game.Id, response);


        return sessionResponse;
    }

    // Make a move
    public async Task<GameResponse?> MakeMoveAsync(Guid gameId, MakeMoveRequest request)
    {
        var game = await _repo.GetByIdWithDetailsAsync(gameId);

        if (game is null)
        {
            return null;
        }

        if (game.Status != GameStatus.Active || game.BlackPlayer is null)
        {
            throw new InvalidOperationException("The game has not started yet.");
        }

        if (string.IsNullOrWhiteSpace(request.From) || string.IsNullOrWhiteSpace(request.To))
        {
            throw new ArgumentException("Both from/to squares are required.");
        }

        if (request.PlayerId == Guid.Empty)
        {
            throw new ArgumentException("PlayerId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.SessionToken))
        {
            throw new ArgumentException("SessionToken is required.");
        }

        var expectedPlayer = game.WhoseTurn == PieceColor.White
            ? game.WhitePlayer
            : game.BlackPlayer;

        if (expectedPlayer is null)
        {
            throw new InvalidOperationException("Player not found.");
        }

        if (request.PlayerId != expectedPlayer.Id || request.SessionToken != expectedPlayer.SessionToken)
        {
            throw new InvalidOperationException("Its not your turn.");
        }

        var from = request.From.Trim().ToLowerInvariant();
        var to = request.To.Trim().ToLowerInvariant();


        if (from == to)
        {
            throw new ArgumentException("Source and target squares must be different.");
        }


        var moveResult = _engine.TryApplyMove(
            game.CurrentFen,
            request.From,
            request.To,
            request.Promotion);

        if (!moveResult.IsLegal)
            throw new InvalidOperationException(moveResult.Error ?? "Illegal move.");

        var move = new Move
        {
            Id = Guid.NewGuid(),
            GameId = game.Id,
            MoveNumber = game.Moves.Count + 1,
            Uci = $"{from}{to}",
            San = null,
            PlayedByColor = game.WhoseTurn,
            CreatedAtUtc = DateTime.UtcNow
        };

        game.Moves.Add(move);
        _repo.AddMove(move);

        game.CurrentFen = moveResult.NewFen!;

        var nextTurn = game.WhoseTurn == PieceColor.White ? PieceColor.Black : PieceColor.White;

        game.WhoseTurn = nextTurn;
        game.UpdatedAtUtc = DateTime.UtcNow;

        await _repo.SaveChangesAsync();

        var response = GameMapper.ToResponse(game);

        await _notifier.NotifyMovePlayedAsync(game.Id, response);

        return response;
    }
}
