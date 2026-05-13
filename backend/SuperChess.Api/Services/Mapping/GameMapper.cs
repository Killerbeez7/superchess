using SuperChess.Api.Contracts.Games;
using SuperChess.Api.Models;
using SuperChess.Core.Chess;

namespace SuperChess.Api.Services.Mapping;

public static class GameMapper
{
    public static GameResponse ToResponse(ChessGame game) => new()
    {
        Id = game.Id,
        Status = game.Status.ToString().ToLowerInvariant(),
        CurrentFen = game.CurrentFen,
        WhoseTurn = game.WhoseTurn.ToString().ToLowerInvariant(),
        InitialClockMs = game.InitialClockMs,
        IncrementMs = game.IncrementMs,
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
        PieceColor color) => new()
    {
        Game = ToResponse(game),
        Session = new PlayerSessionResponse
        {
            PlayerId = player.Id,
            SessionToken = player.SessionToken,
            Color = color.ToString().ToLowerInvariant()
        }
    };

    private static PlayerSummary ToSummary(Player p) => new()
    {
        Id = p.Id,
        DisplayName = p.DisplayName
    };

    private static MoveSummaryResponse ToMoveSummary(Move m) => new()
    {
        MoveNumber = m.MoveNumber,
        From = m.Uci.Length >= 4 ? m.Uci[..2] : "",
        To = m.Uci.Length >= 4 ? m.Uci.Substring(2, 2) : "",
        PlayerColor = m.PlayedByColor,
        CreatedAtUtc = m.CreatedAtUtc
    };
}
