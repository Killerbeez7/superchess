using Microsoft.AspNetCore.Identity;
using SuperChess.Api.Common;
using SuperChess.Api.Data.Repositories;
using SuperChess.Api.Domain.Enums;
using SuperChess.Api.DTOs.Games;
using SuperChess.Api.Entities;
using SuperChess.Api.Models;
using SuperChess.Api.Realtime;
using SuperChess.Api.Services.Bots;
using SuperChess.Api.Services.Mapping;
using SuperChess.Core.Chess;

namespace SuperChess.Api.Services.Games;

public class GameService : IGameService
{
    private const int LevelOneBotThinkMs = 350;
    private const int LevelTwoBotThinkMs = 650;
    private const int LevelThreeBotThinkMs = 900;

    private readonly IGameRepository _repo;
    private readonly IGameNotifier _notifier;
    private readonly IChessEngine _engine;
    private readonly IBotMoveSelectorProvider _botMoveSelectorProvider;
    private readonly UserManager<ApplicationUser> _userManager;

    public GameService(
        IGameRepository repo,
        IGameNotifier notifier,
        IChessEngine engine,
        IBotMoveSelectorProvider botMoveSelectorProvider,
        UserManager<ApplicationUser> userManager)
    {
        _repo = repo;
        _notifier = notifier;
        _engine = engine;
        _botMoveSelectorProvider = botMoveSelectorProvider;
        _userManager = userManager;
    }

    public async Task<Result<GameSessionResponse>> CreateGameAsync(
        AuthenticatedGameUser player,
        CreateGameRequest request,
        CancellationToken ct = default)
    {
        if (player.UserId == Guid.Empty)
        {
            return Result<GameSessionResponse>.Forbidden("Authentication is required.");
        }

        if (string.IsNullOrWhiteSpace(player.DisplayName))
        {
            return Result<GameSessionResponse>.Validation("Player display name is required.");
        }

        var timeControlResult = CreateTimeControl(request);
        if (!timeControlResult.IsSuccess)
        {
            return Result<GameSessionResponse>.Validation(timeControlResult.Error!);
        }

        var timeControl = timeControlResult.Value!;

        var settingsError = await UpdateLastGameSettingsAsync(player.UserId, request);
        if (settingsError is not null)
        {
            return Result<GameSessionResponse>.Forbidden(settingsError);
        }

        var now = DateTime.UtcNow;
        var white = NewPlayer(player);

        var game = new ChessGame
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = white.Id,
            WhitePlayer = white,
            Status = GameStatus.Waiting,
            Kind = GameKind.Online,
            CurrentFen = _engine.StartingFen,
            WhoseTurn = PieceColor.White,
            InitialClockMs = timeControl.InitialClockMs,
            IncrementMs = timeControl.IncrementMs,
            TimeControlType = timeControl.Type,
            IsRated = timeControl.IsRated,
            WhiteTimeRemainingMs = timeControl.InitialClockMs,
            BlackTimeRemainingMs = timeControl.InitialClockMs,
            TurnStartedAtUtc = null,
            EndReason = null,
            WinnerColor = null,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _repo.AddPlayer(white);
        _repo.AddGame(game);

        await _repo.SaveChangesAsync(ct);
        await BroadcastOpenGamesAsync(ct);

        return Result<GameSessionResponse>.Success(
            GameMapper.ToSessionResponse(game, white, PieceColor.White));
    }

    public async Task<Result<GameSessionResponse>> CreateBotGameAsync(
        AuthenticatedGameUser player,
        CreateBotGameRequest request,
        CancellationToken ct = default)
    {
        if (player.UserId == Guid.Empty)
        {
            return Result<GameSessionResponse>.Forbidden("Authentication is required.");
        }

        if (string.IsNullOrWhiteSpace(player.DisplayName))
        {
            return Result<GameSessionResponse>.Validation("Player display name is required.");
        }

        var timeControlResult = CreateTimeControl(request);
        if (!timeControlResult.IsSuccess)
        {
            return Result<GameSessionResponse>.Validation(timeControlResult.Error!);
        }

        var timeControl = timeControlResult.Value!;

        var botLevelResult = CreateBotLevel(request);
        if (!botLevelResult.IsSuccess)
        {
            return Result<GameSessionResponse>.Validation(botLevelResult.Error!);
        }

        var playerColorResult = CreatePlayerColor(request);
        if (!playerColorResult.IsSuccess)
        {
            return Result<GameSessionResponse>.Validation(playerColorResult.Error!);
        }

        var botLevel = botLevelResult.Value;
        var playerColor = playerColorResult.Value;

        var settingsError = await UpdateLastGameSettingsAsync(player.UserId, request);
        if (settingsError is not null)
        {
            return Result<GameSessionResponse>.Forbidden(settingsError);
        }

        var now = DateTime.UtcNow;
        var human = NewPlayer(player);
        var bot = NewBotPlayer(botLevel);
        var white = playerColor == PieceColor.White ? human : bot;
        var black = playerColor == PieceColor.White ? bot : human;

        var game = new ChessGame
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = white.Id,
            WhitePlayer = white,
            BlackPlayerId = black.Id,
            BlackPlayer = black,
            Status = GameStatus.Active,
            Kind = GameKind.Bot,
            CurrentFen = _engine.StartingFen,
            WhoseTurn = PieceColor.White,
            InitialClockMs = timeControl.InitialClockMs,
            IncrementMs = timeControl.IncrementMs,
            TimeControlType = timeControl.Type,
            IsRated = timeControl.IsRated,
            BotLevel = botLevel,
            WhiteTimeRemainingMs = timeControl.InitialClockMs,
            BlackTimeRemainingMs = timeControl.InitialClockMs,
            TurnStartedAtUtc = now,
            EndReason = null,
            WinnerColor = null,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _repo.AddPlayer(human);
        _repo.AddPlayer(bot);
        _repo.AddGame(game);

        ApplyBotMoveIfNeeded(game, now);

        await _repo.SaveChangesAsync(ct);

        return Result<GameSessionResponse>.Success(
            GameMapper.ToSessionResponse(game, human, playerColor));
    }

    public async Task<Result<GameResponse>> GetGameAsync(
        Guid gameId,
        CancellationToken ct = default)
    {
        var game = await _repo.GetByIdWithDetailsAsync(gameId, ct);
        if (game is null)
        {
            return Result<GameResponse>.NotFound("Game not found.");
        }

        var now = DateTime.UtcNow;
        if (ExpireGameByClockIfNeeded(game, now))
        {
            await _repo.SaveChangesAsync(ct);

            var timeoutResponse = GameMapper.ToResponse(game);
            await _notifier.NotifyMovePlayedAsync(game.Id, timeoutResponse);

            return Result<GameResponse>.Success(timeoutResponse);
        }

        return Result<GameResponse>.Success(GameMapper.ToResponse(game));
    }

    public async Task<List<GameResponse>> GetGamesAsync(CancellationToken ct = default)
    {
        var games = await _repo.GetWaitingGamesAsync(ct);
        return games.Select(GameMapper.ToResponse).ToList();
    }

    public async Task<List<GameHistoryResponse>> GetGameHistoryAsync(
        AuthenticatedGameUser player,
        CancellationToken ct = default)
    {
        var games = await _repo.GetGamesForUserAsync(player.UserId, 30, ct);
        return games
            .Select(game => GameMapper.ToHistoryResponse(game, player.UserId))
            .ToList();
    }

    public async Task<GameStatsResponse> GetGameStatsAsync(
        AuthenticatedGameUser player,
        CancellationToken ct = default)
    {
        var games = await _repo.GetCompletedGamesForUserAsync(player.UserId, ct);
        var stats = new GameStatsResponse
        {
            Games = games.Count
        };

        foreach (var game in games)
        {
            if (game.WinnerColor is null)
            {
                stats.Draws++;
                continue;
            }

            var playerColor = GetPlayerColor(game, player.UserId);
            if (game.WinnerColor == playerColor)
            {
                stats.Wins++;
            }
            else
            {
                stats.Losses++;
            }
        }

        return stats;
    }

    public async Task<Result<GameSessionResponse>> MatchmakeAsync(
        AuthenticatedGameUser player,
        CreateGameRequest request,
        CancellationToken ct = default)
    {
        if (player.UserId == Guid.Empty)
        {
            return Result<GameSessionResponse>.Forbidden("Authentication is required.");
        }

        if (string.IsNullOrWhiteSpace(player.DisplayName))
        {
            return Result<GameSessionResponse>.Validation("Player display name is required.");
        }

        var timeControlResult = CreateTimeControl(request);
        if (!timeControlResult.IsSuccess)
        {
            return Result<GameSessionResponse>.Validation(timeControlResult.Error!);
        }

        var timeControl = timeControlResult.Value!;
        var minCreatedAtUtc = DateTime.UtcNow.AddMinutes(-15);
        var compatibleGame = await _repo.FindCompatibleWaitingGameAsync(
            player.UserId,
            timeControl.InitialClockMs,
            timeControl.IncrementMs,
            timeControl.IsRated,
            minCreatedAtUtc,
            ct);

        if (compatibleGame is null)
        {
            return await CreateGameAsync(player, request, ct);
        }

        var settingsError = await UpdateLastGameSettingsAsync(player.UserId, request);
        if (settingsError is not null)
        {
            return Result<GameSessionResponse>.Forbidden(settingsError);
        }

        return await JoinWaitingGameAsync(compatibleGame, player, ct);
    }

    public async Task<Result<GameSessionResponse>> JoinGameAsync(
        Guid gameId,
        AuthenticatedGameUser player,
        JoinGameRequest request,
        CancellationToken ct = default)
    {
        if (player.UserId == Guid.Empty)
        {
            return Result<GameSessionResponse>.Forbidden("Authentication is required.");
        }

        if (string.IsNullOrWhiteSpace(player.DisplayName))
        {
            return Result<GameSessionResponse>.Validation("Player display name is required.");
        }

        var game = await _repo.GetByIdWithDetailsAsync(gameId, ct);
        if (game is null)
        {
            return Result<GameSessionResponse>.NotFound("Game not found.");
        }

        if (game.BlackPlayerId is not null || game.BlackPlayer is not null)
        {
            return Result<GameSessionResponse>.Conflict("Game already has two players.");
        }

        if (game.WhitePlayer.UserId == player.UserId)
        {
            return Result<GameSessionResponse>.Forbidden("You cannot join your own game.");
        }

        return await JoinWaitingGameAsync(game, player, ct);
    }

    private async Task<Result<GameSessionResponse>> JoinWaitingGameAsync(
        ChessGame game,
        AuthenticatedGameUser player,
        CancellationToken ct)
    {
        if (game.BlackPlayerId is not null || game.BlackPlayer is not null)
        {
            return Result<GameSessionResponse>.Conflict("Game already has two players.");
        }

        if (game.WhitePlayer.UserId == player.UserId)
        {
            return Result<GameSessionResponse>.Forbidden("You cannot join your own game.");
        }

        var black = NewPlayer(player);
        var now = DateTime.UtcNow;

        game.BlackPlayerId = black.Id;
        game.BlackPlayer = black;
        game.Status = GameStatus.Active;
        game.TurnStartedAtUtc = now;
        game.EndReason = null;
        game.WinnerColor = null;
        game.UpdatedAtUtc = now;

        _repo.AddPlayer(black);

        await _repo.SaveChangesAsync(ct);
        await BroadcastOpenGamesAsync(ct);

        var response = GameMapper.ToResponse(game);
        var sessionResponse = GameMapper.ToSessionResponse(game, black, PieceColor.Black);

        await _notifier.NotifyPlayerJoinedAsync(game.Id, response);

        return Result<GameSessionResponse>.Success(sessionResponse);
    }

    public async Task<Result<GameResponse>> MakeMoveAsync(
        Guid gameId,
        AuthenticatedGameUser player,
        MakeMoveRequest request,
        CancellationToken ct = default)
    {
        if (player.UserId == Guid.Empty)
        {
            return Result<GameResponse>.Forbidden("Authentication is required.");
        }

        var game = await _repo.GetByIdWithDetailsAsync(gameId, ct);
        if (game is null)
        {
            return Result<GameResponse>.NotFound("Game not found.");
        }

        var now = DateTime.UtcNow;
        if (ExpireGameByClockIfNeeded(game, now))
        {
            await _repo.SaveChangesAsync(ct);

            var expiredResponse = GameMapper.ToResponse(game);
            await _notifier.NotifyMovePlayedAsync(game.Id, expiredResponse);

            return Result<GameResponse>.Success(expiredResponse);
        }

        if (game.Status == GameStatus.Completed)
        {
            return Result<GameResponse>.Conflict("The game is over.");
        }

        if (game.Status != GameStatus.Active || game.BlackPlayer is null)
        {
            return Result<GameResponse>.Conflict("The game has not started yet.");
        }

        if (string.IsNullOrWhiteSpace(request.From) || string.IsNullOrWhiteSpace(request.To))
        {
            return Result<GameResponse>.Validation("Both from/to squares are required.");
        }

        var expectedPlayer = game.WhoseTurn == PieceColor.White
            ? game.WhitePlayer
            : game.BlackPlayer;

        if (expectedPlayer is null)
        {
            return Result<GameResponse>.Conflict("Player not found.");
        }

        if (expectedPlayer.IsBot)
        {
            return Result<GameResponse>.Forbidden("Bot moves are handled by the server.");
        }

        if (expectedPlayer.UserId != player.UserId)
        {
            return Result<GameResponse>.Forbidden("It's not your turn.");
        }

        if (!ApplyClockSpend(game, now, game.WhoseTurn))
        {
            CompleteGame(
                game,
                GameEndReason.Timeout,
                OppositeColor(game.WhoseTurn),
                now);

            await _repo.SaveChangesAsync(ct);

            var timeoutResponse = GameMapper.ToResponse(game);
            await _notifier.NotifyMovePlayedAsync(game.Id, timeoutResponse);

            return Result<GameResponse>.Success(timeoutResponse);
        }

        var from = request.From.Trim().ToLowerInvariant();
        var to = request.To.Trim().ToLowerInvariant();

        if (from == to)
        {
            return Result<GameResponse>.Validation("Source and target squares must be different.");
        }

        var moveResult = _engine.TryApplyMove(
            game.CurrentFen,
            from,
            to,
            request.Promotion);

        if (!moveResult.IsLegal)
        {
            return Result<GameResponse>.Validation(moveResult.Error ?? "Illegal move.");
        }

        var movingColor = game.WhoseTurn;

        var move = new Move
        {
            Id = Guid.NewGuid(),
            GameId = game.Id,
            MoveNumber = game.Moves.Count + 1,
            Uci = $"{from}{to}",
            San = null,
            PlayedByColor = movingColor,
            CreatedAtUtc = now
        };

        game.Moves.Add(move);
        _repo.AddMove(move);

        game.CurrentFen = moveResult.NewFen!;

        var nextTurn = movingColor == PieceColor.White
            ? PieceColor.Black
            : PieceColor.White;

        game.WhoseTurn = nextTurn;

        if (moveResult.IsCheckmate || moveResult.IsStalemate)
        {
            CompleteGame(
                game,
                moveResult.IsCheckmate ? GameEndReason.Checkmate : GameEndReason.Stalemate,
                moveResult.IsCheckmate ? movingColor : null,
                now);
        }
        else
        {
            ApplyIncrement(game, movingColor);
            game.TurnStartedAtUtc = now;
        }

        game.UpdatedAtUtc = now;

        ApplyBotMoveIfNeeded(game, now);

        await _repo.SaveChangesAsync(ct);

        var response = GameMapper.ToResponse(game);
        await _notifier.NotifyMovePlayedAsync(game.Id, response);

        return Result<GameResponse>.Success(response);
    }

    private static Player NewPlayer(AuthenticatedGameUser player) => new()
    {
        Id = Guid.NewGuid(),
        UserId = player.UserId,
        DisplayName = player.DisplayName.Trim()
    };

    private static Player NewBotPlayer(int botLevel) => new()
    {
        Id = Guid.NewGuid(),
        UserId = null,
        IsBot = true,
        DisplayName = $"SuperChess Bot L{botLevel}"
    };

    private void ApplyBotMoveIfNeeded(ChessGame game, DateTime now)
    {
        if (game.Status != GameStatus.Active)
        {
            return;
        }

        var botPlayer = game.WhoseTurn == PieceColor.White
            ? game.WhitePlayer
            : game.BlackPlayer;

        if (botPlayer?.IsBot != true)
        {
            return;
        }

        var movingColor = game.WhoseTurn;

        if (!ApplyClockSpend(game, now, movingColor))
        {
            CompleteGame(game, GameEndReason.Timeout, OppositeColor(movingColor), now);
            return;
        }

        if (!ApplyBotThinkTime(game, movingColor))
        {
            CompleteGame(game, GameEndReason.Timeout, OppositeColor(movingColor), now);
            return;
        }

        var selected = _botMoveSelectorProvider
            .GetSelector(game.BotLevel)
            .SelectMove(game.CurrentFen);
        if (selected is null)
        {
            CompleteGame(game, GameEndReason.Stalemate, null, now);
            return;
        }

        var move = new Move
        {
            Id = Guid.NewGuid(),
            GameId = game.Id,
            MoveNumber = game.Moves.Count + 1,
            Uci = $"{selected.From}{selected.To}{selected.Promotion ?? string.Empty}",
            San = null,
            PlayedByColor = movingColor,
            CreatedAtUtc = now
        };

        game.Moves.Add(move);
        _repo.AddMove(move);
        game.CurrentFen = selected.Result.NewFen!;
        game.WhoseTurn = OppositeColor(movingColor);

        if (selected.Result.IsCheckmate || selected.Result.IsStalemate)
        {
            CompleteGame(
                game,
                selected.Result.IsCheckmate ? GameEndReason.Checkmate : GameEndReason.Stalemate,
                selected.Result.IsCheckmate ? movingColor : null,
                now);
        }
        else
        {
            ApplyIncrement(game, movingColor);
            game.TurnStartedAtUtc = now;
            game.UpdatedAtUtc = now;
        }
    }

    private sealed record GameTimeControl(
        int InitialClockMs,
        int IncrementMs,
        TimeControlType Type,
        bool IsRated);

    private static Result<GameTimeControl> CreateTimeControl(CreateGameRequest request)
    {
        var gameMode = NormalizeGameMode(request.GameMode);
        if (gameMode != "classical")
        {
            return Result<GameTimeControl>.Validation("Only classical mode is supported.");
        }

        if (request.InitialMinutes is < 1 or > 180)
        {
            return Result<GameTimeControl>.Validation("InitialMinutes must be between 1 and 180.");
        }

        if (request.IncrementSeconds is < 0 or > 60)
        {
            return Result<GameTimeControl>.Validation("IncrementSeconds must be between 0 and 60.");
        }

        var initialClockMs = request.InitialMinutes * 60 * 1000;
        var incrementMs = request.IncrementSeconds * 1000;

        return Result<GameTimeControl>.Success(new GameTimeControl(
            initialClockMs,
            incrementMs,
            DeriveTimeControlType(request.InitialMinutes),
            request.IsRated));
    }

    private static Result<int> CreateBotLevel(CreateBotGameRequest request)
    {
        if (request.BotLevel is < 1 or > 3)
        {
            return Result<int>.Validation("BotLevel must be between 1 and 3.");
        }

        return Result<int>.Success(request.BotLevel);
    }

    private static Result<PieceColor> CreatePlayerColor(CreateBotGameRequest request)
    {
        var color = request.PlayerColor?.Trim().ToLowerInvariant();

        return color switch
        {
            "white" => Result<PieceColor>.Success(PieceColor.White),
            "black" => Result<PieceColor>.Success(PieceColor.Black),
            _ => Result<PieceColor>.Validation("PlayerColor must be white or black.")
        };
    }

    private static TimeControlType DeriveTimeControlType(int initialMinutes)
    {
        if (initialMinutes < 3)
        {
            return TimeControlType.Bullet;
        }

        return initialMinutes < 10
            ? TimeControlType.Blitz
            : TimeControlType.Rapid;
    }

    private async Task<string?> UpdateLastGameSettingsAsync(
        Guid userId,
        CreateGameRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return "Authenticated user no longer exists.";
        }

        user.LastInitialMinutes = request.InitialMinutes;
        user.LastIncrementSeconds = request.IncrementSeconds;
        user.LastIsRated = request.IsRated;
        user.LastGameMode = NormalizeGameMode(request.GameMode);

        var result = await _userManager.UpdateAsync(user);

        return result.Succeeded
            ? null
            : string.Join(" ", result.Errors.Select(error => error.Description));
    }

    private static string NormalizeGameMode(string? gameMode) =>
        string.IsNullOrWhiteSpace(gameMode)
            ? "classical"
            : gameMode.Trim().ToLowerInvariant();

    private async Task BroadcastOpenGamesAsync(CancellationToken ct)
    {
        var games = await _repo.GetWaitingGamesAsync(ct);
        var responses = games.Select(GameMapper.ToResponse).ToList();

        await _notifier.NotifyOpenGamesChangedAsync(responses);
    }

    private static bool ExpireGameByClockIfNeeded(ChessGame game, DateTime now)
    {
        if (
            game.Status != GameStatus.Active ||
            game.BlackPlayer is null ||
            game.TurnStartedAtUtc is null)
        {
            return false;
        }

        var remainingMs = GetRemainingAfterElapsed(
            game.WhoseTurn == PieceColor.White
                ? game.WhiteTimeRemainingMs
                : game.BlackTimeRemainingMs,
            game.TurnStartedAtUtc.Value,
            now);

        if (remainingMs > 0)
        {
            return false;
        }

        SetRemainingTime(game, game.WhoseTurn, 0);

        CompleteGame(
            game,
            GameEndReason.Timeout,
            OppositeColor(game.WhoseTurn),
            now);

        return true;
    }

    private static void CompleteGame(
        ChessGame game,
        GameEndReason reason,
        PieceColor? winnerColor,
        DateTime now)
    {
        game.Status = GameStatus.Completed;
        game.EndReason = reason;
        game.WinnerColor = winnerColor;
        game.TurnStartedAtUtc = null;
        game.UpdatedAtUtc = now;
    }

    private static bool ApplyClockSpend(ChessGame game, DateTime now, PieceColor color)
    {
        if (game.TurnStartedAtUtc is null)
        {
            game.TurnStartedAtUtc = now;
            return true;
        }

        var elapsedMs = Math.Max(
            0,
            (long)Math.Floor((now - game.TurnStartedAtUtc.Value).TotalMilliseconds));

        if (color == PieceColor.White)
        {
            game.WhiteTimeRemainingMs = DeductElapsed(game.WhiteTimeRemainingMs, elapsedMs);
            return game.WhiteTimeRemainingMs > 0;
        }

        game.BlackTimeRemainingMs = DeductElapsed(game.BlackTimeRemainingMs, elapsedMs);
        return game.BlackTimeRemainingMs > 0;
    }

    private static int DeductElapsed(int remainingMs, long elapsedMs) =>
        (int)Math.Max(0, remainingMs - elapsedMs);

    private static int GetRemainingAfterElapsed(
        int remainingMs,
        DateTime turnStartedAtUtc,
        DateTime now)
    {
        var elapsedMs = Math.Max(
            0,
            (long)Math.Floor((now - turnStartedAtUtc).TotalMilliseconds));

        return DeductElapsed(remainingMs, elapsedMs);
    }

    private static void SetRemainingTime(ChessGame game, PieceColor color, int remainingMs)
    {
        if (color == PieceColor.White)
        {
            game.WhiteTimeRemainingMs = remainingMs;
            return;
        }

        game.BlackTimeRemainingMs = remainingMs;
    }

    private static PieceColor OppositeColor(PieceColor color) =>
        color == PieceColor.White ? PieceColor.Black : PieceColor.White;

    private static PieceColor GetPlayerColor(ChessGame game, Guid userId) =>
        game.WhitePlayer.UserId == userId ? PieceColor.White : PieceColor.Black;

    private static void ApplyIncrement(ChessGame game, PieceColor color)
    {
        if (game.IncrementMs <= 0)
        {
            return;
        }

        if (color == PieceColor.White)
        {
            game.WhiteTimeRemainingMs += game.IncrementMs;
            return;
        }

        game.BlackTimeRemainingMs += game.IncrementMs;
    }

    private static bool ApplyBotThinkTime(ChessGame game, PieceColor color)
    {
        var thinkMs = GetBotThinkMs(game.BotLevel);
        if (thinkMs <= 0)
        {
            return true;
        }

        if (color == PieceColor.White)
        {
            game.WhiteTimeRemainingMs = DeductElapsed(game.WhiteTimeRemainingMs, thinkMs);
            return game.WhiteTimeRemainingMs > 0;
        }

        game.BlackTimeRemainingMs = DeductElapsed(game.BlackTimeRemainingMs, thinkMs);
        return game.BlackTimeRemainingMs > 0;
    }

    private static int GetBotThinkMs(int botLevel) =>
        botLevel switch
        {
            1 => LevelOneBotThinkMs,
            2 => LevelTwoBotThinkMs,
            _ => LevelThreeBotThinkMs
        };
}
