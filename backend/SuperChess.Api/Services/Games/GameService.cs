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

    // Games game
    public async Task<GameResponse?> GetGameAsync(Guid gameId)
    {
        var game = await _db.Games
            .Include(x => x.WhitePlayer)
            .Include(x => x.BlackPlayer)
            .FirstOrDefaultAsync(x => x.Id == gameId);

        return game is null ? null : MapGame(game);
    }

    // Get games
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
}