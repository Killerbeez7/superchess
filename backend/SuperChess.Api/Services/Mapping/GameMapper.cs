using SuperChess.Api.DTOs.Games;
using SuperChess.Api.Domain.Enums;
using SuperChess.Api.Models;
using SuperChess.Core.Chess;

namespace SuperChess.Api.Services.Mapping;

public static class GameMapper
{
    public static GameResponse ToResponse(ChessGame game) => new()
    {
        Id = game.Id,
        Status = game.Status.ToString().ToLowerInvariant(),
        Kind = game.Kind.ToString().ToLowerInvariant(),
        CurrentFen = game.CurrentFen,
        WhoseTurn = game.WhoseTurn.ToString().ToLowerInvariant(),
        InitialClockMs = game.InitialClockMs,
        IncrementMs = game.IncrementMs,
        TimeControlType = game.TimeControlType.ToString().ToLowerInvariant(),
        IsRated = game.IsRated,
        WhiteTimeRemainingMs = game.WhiteTimeRemainingMs,
        BlackTimeRemainingMs = game.BlackTimeRemainingMs,
        TurnStartedAtUtc = game.TurnStartedAtUtc,
        EndReason = game.EndReason is null
            ? null
            : game.EndReason.Value.ToString().ToLowerInvariant(),
        WinnerColor = game.WinnerColor is null
            ? null
            : game.WinnerColor.Value.ToString().ToLowerInvariant(),
        CreatedAtUtc = game.CreatedAtUtc,
        UpdatedAtUtc = game.UpdatedAtUtc,
        WhitePlayer = ToSummary(game.WhitePlayer),
        BlackPlayer = game.BlackPlayer is null ? null : ToSummary(game.BlackPlayer),
        Moves = game.Moves
            .OrderBy(m => m.MoveNumber)
            .ThenBy(m => m.CreatedAtUtc)
            .Select(ToMoveSummary)
            .ToList()
    };

    public static GameSessionResponse ToSessionResponse(
        ChessGame game,
        Player player,
        PieceColor color)
    {
        return new GameSessionResponse
        {
            Game = ToResponse(game),
            PlayerId = player.Id,
            Color = color
        };
    }

    public static GameHistoryResponse ToHistoryResponse(ChessGame game, Guid userId)
    {
        var isWhitePlayer = game.WhitePlayer.UserId == userId;
        var playerColor = isWhitePlayer ? PieceColor.White : PieceColor.Black;
        var opponent = isWhitePlayer ? game.BlackPlayer : game.WhitePlayer;

        return new GameHistoryResponse
        {
            Id = game.Id,
            Status = game.Status.ToString().ToLowerInvariant(),
            Kind = game.Kind.ToString().ToLowerInvariant(),
            PlayerColor = playerColor.ToString().ToLowerInvariant(),
            Result = GetHistoryResult(game, playerColor),
            WinnerColor = game.WinnerColor is null
                ? null
                : game.WinnerColor.Value.ToString().ToLowerInvariant(),
            WhitePlayerName = game.WhitePlayer.DisplayName,
            BlackPlayerName = game.BlackPlayer?.DisplayName ?? "Waiting for player 2",
            OpponentUserId = opponent?.UserId,
            OpponentName = opponent?.DisplayName ?? "Waiting for player 2",
            OpponentIsBot = opponent?.IsBot ?? false,
            InitialClockMs = game.InitialClockMs,
            IncrementMs = game.IncrementMs,
            TimeControlType = game.TimeControlType.ToString().ToLowerInvariant(),
            IsRated = game.IsRated,
            MoveCount = GetFullMoveCount(game),
            EndReason = game.EndReason is null
                ? null
                : game.EndReason.Value.ToString().ToLowerInvariant(),
            CreatedAtUtc = game.CreatedAtUtc,
            UpdatedAtUtc = game.UpdatedAtUtc
        };
    }

    private static PlayerSummary ToSummary(Player p) => new()
    {
        Id = p.Id,
        DisplayName = p.DisplayName,
        IsBot = p.IsBot
    };

    private static MoveSummaryResponse ToMoveSummary(Move m) => new()
    {
        MoveNumber = m.MoveNumber,
        From = m.Uci.Length >= 4 ? m.Uci[..2] : "",
        To = m.Uci.Length >= 4 ? m.Uci.Substring(2, 2) : "",
        PlayerColor = m.PlayedByColor,
        CreatedAtUtc = m.CreatedAtUtc
    };

    private static string GetHistoryResult(ChessGame game, PieceColor playerColor)
    {
        if (game.Status is not GameStatus.Completed)
        {
            return game.Status.ToString().ToLowerInvariant();
        }

        if (game.WinnerColor is null)
        {
            return "draw";
        }

        return game.WinnerColor == playerColor ? "win" : "loss";
    }

    private static int GetFullMoveCount(ChessGame game) =>
        (game.Moves.Count + 1) / 2;
}
