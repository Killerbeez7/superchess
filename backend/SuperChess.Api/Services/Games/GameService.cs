using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Contracts.Games;
using SuperChess.Api.Data;
using SuperChess.Api.Models;
using Microsoft.AspNetCore.SignalR;
using SuperChess.Api.Hubs;

namespace SuperChess.Api.Services.Games;

public class GameService : IGameService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<GameHub> _hubContext;

    private async Task BroadcastOpenGamesChangedAsync()
    {
        var waitingGames = await _db.Games
            .Include(x => x.WhitePlayer)
            .Include(x => x.BlackPlayer)
            .Where(x => x.Status == "waiting")
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        var response = waitingGames.Select(MapGame).ToList();

        await _hubContext.Clients.All.SendAsync("OpenGamesChanged", response);
    }

    public GameService(AppDbContext db, IHubContext<GameHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    // Create game
    public async Task<GameResponse> CreateGameAsync(CreateGameRequest request)
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
            Status = "waiting",
            CurrentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            WhoseTurn = "white",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.Players.Add(whitePlayer);
        _db.Games.Add(game);
        await _db.SaveChangesAsync();
        await BroadcastOpenGamesChangedAsync();

        return MapGame(game);
    }

    // Get game
    public async Task<GameResponse?> GetGameAsync(Guid gameId)
    {
        var game = await _db.Games
            .Include(x => x.WhitePlayer)
            .Include(x => x.BlackPlayer)
            .FirstOrDefaultAsync(x => x.Id == gameId);

        return game is null ? null : MapGame(game);
    }

    // Get games list
    public async Task<List<GameResponse>> GetGamesAsync()
    {
        var games = await _db.Games
            .Include(x => x.WhitePlayer)
            .Include(x => x.BlackPlayer)
            .Where(x => x.Status == "waiting")
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        return games.Select(MapGame).ToList();
    }

    // Join game
    public async Task<GameResponse?> JoinGameAsync(Guid gameId, JoinGameRequest request)
    {
        var trimmedName = request.PlayerName.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new ArgumentException("Player name is required.");
        }

        var game = await _db.Games
            .Include(x => x.WhitePlayer)
            .Include(x => x.BlackPlayer)
            .FirstOrDefaultAsync(x => x.Id == gameId);

        if (game is null)
        {
            return null;
        }

        if (game.BlackPlayerId is not null)
        {
            throw new InvalidOperationException("Game already has two players.");
        }

        var blackPlayer = new Player
        {
            Id = Guid.NewGuid(),
            DisplayName = trimmedName,
            SessionToken = Guid.NewGuid().ToString("N")
        };

        game.BlackPlayerId = blackPlayer.Id;
        game.BlackPlayer = blackPlayer;
        game.Status = "active";
        game.UpdatedAtUtc = DateTime.UtcNow;

        _db.Players.Add(blackPlayer);
        await _db.SaveChangesAsync();
        await BroadcastOpenGamesChangedAsync();


        var response = MapGame(game);

        await _hubContext.Clients
            .Group($"game:{game.Id}")
            .SendAsync("PlayerJoined", response);

        return response;
    }

    // Map game
    private static GameResponse MapGame(ChessGame game)
    {
        return new GameResponse
        {
            Id = game.Id,
            Status = game.Status,
            CurrentFen = game.CurrentFen,
            WhoseTurn = game.WhoseTurn,
            CreatedAtUtc = game.CreatedAtUtc,
            UpdatedAtUtc = game.UpdatedAtUtc,
            WhitePlayer = new PlayerSummary
            {
                Id = game.WhitePlayer.Id,
                DisplayName = game.WhitePlayer.DisplayName
            },
            BlackPlayer = game.BlackPlayer is null
                ? null
                : new PlayerSummary
                {
                    Id = game.BlackPlayer.Id,
                    DisplayName = game.BlackPlayer.DisplayName
                }
        };
    }

    public async Task<GameResponse?> MakeMoveAsync(Guid gameId, MakeMoveRequest request)
    {
        var game = await _db.Games
            .Include(x => x.WhitePlayer)
            .Include(x => x.BlackPlayer)
            .FirstOrDefaultAsync(x => x.Id == gameId);

        if (game is null)
        {
            return null;
        }

        if (game.Status != "active" || game.BlackPlayer is null)
        {
            throw new InvalidOperationException("The game is not ready for moves yet.");
        }

        if (string.IsNullOrWhiteSpace(request.From) || string.IsNullOrWhiteSpace(request.To))
        {
            throw new ArgumentException("Both from and to squares are required.");
        }

        var from = request.From.Trim().ToLowerInvariant();
        var to = request.To.Trim().ToLowerInvariant();

        if (!IsValidSquare(from) || !IsValidSquare(to))
        {
            throw new ArgumentException("Invalid move.");
        }

        if (from == to)
        {
            throw new ArgumentException("Destination cannot be same as starting point.");
        }

        var board = ParseBoardFromFen(game.CurrentFen);

        if (!board.TryGetValue(from, out var piece))
        {
            throw new InvalidOperationException("No piece found on the source square.");
        }

        var isWhiteTurn = game.WhoseTurn == "white";

        if (isWhiteTurn && !IsWhitePiece(piece))
        {
            throw new InvalidOperationException("It is white's turn.");
        }

        if (!isWhiteTurn && !IsBlackPiece(piece))
        {
            throw new InvalidOperationException("It is black's turn.");
        }

        if (board.TryGetValue(to, out var targetPiece))
        {
            if ((IsWhitePiece(piece) && IsWhitePiece(targetPiece)) ||
                (IsBlackPiece(piece) && IsBlackPiece(targetPiece)))
            {
                throw new InvalidOperationException("You cannot capture your own piece.");
            }
        }

        board.Remove(from);
        board[to] = piece;

        var nextTurn = game.WhoseTurn == "white" ? "black" : "white";

        game.CurrentFen = BuildUpdatedFen(game.CurrentFen, board, nextTurn);
        game.WhoseTurn = nextTurn;
        game.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var response = MapGame(game);

        await _hubContext.Clients
            .Group($"game:{game.Id}")
            .SendAsync("MovePlayed", response);

        return response;
    }

    private static bool IsValidSquare(string square)
    {
        if (square.Length != 2)
        {
            return false;
        }


        var file = square[0];
        var rank = square[1];

        return file >= 'a' && file <= 'h' && rank >= '1' && rank <= '8';
    }

    private static Dictionary<string, char> ParseBoardFromFen(string fen)
    {
        var boardPart = fen.Split(' ')[0];
        var ranks = boardPart.Split('/');

        if (ranks.Length != 8)
        {
            throw new InvalidOperationException("Invalid FEN board.");
        }

        var board = new Dictionary<string, char>();

        for (var row = 0; row < 8; row++)
        {
            var fileIndex = 0;

            foreach (var ch in ranks[row])
            {
                if (char.IsDigit(ch))
                {
                    fileIndex += ch - '0';
                    continue;
                }

                if (fileIndex > 7)
                {
                    throw new InvalidOperationException("Invalid FEN board.");
                }

                var square = $"{(char)('a' + fileIndex)}{8 - row}";
                board[square] = ch;
                fileIndex++;
            }

            if (fileIndex != 8)
            {
                throw new InvalidOperationException("Invalid FEN board.");
            }
        }

        return board;
    }

    private static string BuildBoardFen(Dictionary<string, char> board)
    {
        var ranks = new List<string>();

        for (var row = 8; row >= 1; row--)
        {
            var emptyCount = 0;
            var rank = "";

            for (var file = 'a'; file <= 'h'; file++)
            {
                var square = $"{file}{row}";

                if (board.TryGetValue(square, out var piece))
                {
                    if (emptyCount > 0)
                    {
                        rank += emptyCount.ToString();
                        emptyCount = 0;
                    }

                    rank += piece;
                }
                else
                {
                    emptyCount++;
                }
            }

            if (emptyCount > 0)
            {
                rank += emptyCount.ToString();
            }

            ranks.Add(rank);
        }

        return string.Join("/", ranks);
    }

    private static bool IsWhitePiece(char piece) => char.IsUpper(piece);
    private static bool IsBlackPiece(char piece) => char.IsLower(piece);


    private static string BuildUpdatedFen(string currentFen, Dictionary<string, char> board, string nextTurn)
    {
        var parts = currentFen.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var boardPart = BuildBoardFen(board);
        var activeColor = nextTurn == "white" ? "w" : "b";

        var castling = parts.Length > 2 ? parts[2] : "KQkq";
        var enPassant = parts.Length > 3 ? parts[3] : "-";
        var halfmove = parts.Length > 4 ? parts[4] : "0";
        var fullmove = parts.Length > 5 ? parts[5] : "1";

        return $"{boardPart} {activeColor} {castling} {enPassant} {halfmove} {fullmove}";
    }
}