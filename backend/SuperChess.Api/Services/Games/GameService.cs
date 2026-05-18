using SuperChess.Api.Common;
using SuperChess.Api.DTOs.Games;
using SuperChess.Api.Data.Repositories;
using SuperChess.Api.Domain.Enums;
using SuperChess.Api.Models;
using SuperChess.Api.Realtime;
using SuperChess.Api.Services.Mapping;
using SuperChess.Core.Chess;

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

    public async Task<Result<GameSessionResponse>> CreateGameAsync(
        AuthenticatedGameUser player,
        CancellationToken ct = default)
    {
        var name = player.DisplayName.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<GameSessionResponse>.Validation("Player name is required.");
        }

        var now = DateTime.UtcNow;
        var white = NewPlayer(name);
        var game = new ChessGame
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = white.Id,
            WhitePlayer = white,
            Status = GameStatus.Waiting,
            CurrentFen = _engine.StartingFen,
            WhoseTurn = PieceColor.White,
            InitialClockMs = ChessGame.DefaultInitialClockMs,
            IncrementMs = 0,
            WhiteTimeRemainingMs = ChessGame.DefaultInitialClockMs,
            BlackTimeRemainingMs = ChessGame.DefaultInitialClockMs,
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

    public async Task<Result<GameResponse>> GetGameAsync(Guid gameId, CancellationToken ct = default)
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

    public async Task<Result<GameSessionResponse>> JoinGameAsync(
        Guid gameId,
        AuthenticatedGameUser player,
        JoinGameRequest request,
        CancellationToken ct = default)
    {
        var name = player.DisplayName.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<GameSessionResponse>.Validation("Player name is required.");
        }

        var game = await _repo.GetByIdWithDetailsAsync(gameId, ct);
        if (game is null)
        {
            return Result<GameSessionResponse>.NotFound("Game not found.");
        }

        if (game.BlackPlayerId is not null)
        {
            return Result<GameSessionResponse>.Conflict("Game already has two players.");
        }

        if (!string.IsNullOrWhiteSpace(request.ExistingSessionToken) &&
            request.ExistingSessionToken == game.WhitePlayer.SessionToken)
        {
            return Result<GameSessionResponse>.Forbidden("You cannot join as both players.");
        }

        var black = NewPlayer(name);
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
        MakeMoveRequest request,
        CancellationToken ct = default)
    {
        var game = await _repo.GetByIdWithDetailsAsync(gameId, ct);
        if (game is null)
        {
            return Result<GameResponse>.NotFound("Game not found.");
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

        if (request.PlayerId == Guid.Empty)
        {
            return Result<GameResponse>.Validation("PlayerId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.SessionToken))
        {
            return Result<GameResponse>.Validation("SessionToken is required.");
        }

        var expectedPlayer = game.WhoseTurn == PieceColor.White
            ? game.WhitePlayer
            : game.BlackPlayer;

        if (expectedPlayer is null)
        {
            return Result<GameResponse>.Conflict("Player not found.");
        }

        if (request.PlayerId != expectedPlayer.Id || request.SessionToken != expectedPlayer.SessionToken)
        {
            return Result<GameResponse>.Forbidden("Its not your turn.");
        }

        var now = DateTime.UtcNow;
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
            request.From,
            request.To,
            request.Promotion);

        if (!moveResult.IsLegal)
        {
            return Result<GameResponse>.Validation(moveResult.Error ?? "Illegal move.");
        }

        var move = new Move
        {
            Id = Guid.NewGuid(),
            GameId = game.Id,
            MoveNumber = game.Moves.Count + 1,
            Uci = $"{from}{to}",
            San = null,
            PlayedByColor = game.WhoseTurn,
            CreatedAtUtc = now
        };

        game.Moves.Add(move);
        _repo.AddMove(move);

        game.CurrentFen = moveResult.NewFen!;

        var nextTurn = game.WhoseTurn == PieceColor.White ? PieceColor.Black : PieceColor.White;
        var movingColor = game.WhoseTurn;

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

        await _repo.SaveChangesAsync(ct);

        var response = GameMapper.ToResponse(game);

        await _notifier.NotifyMovePlayedAsync(game.Id, response);

        return Result<GameResponse>.Success(response);
    }

    private static Player NewPlayer(string displayName) => new()
    {
        Id = Guid.NewGuid(),
        DisplayName = displayName,
        SessionToken = Guid.NewGuid().ToString("N")
    };

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
}
