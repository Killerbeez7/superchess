using SuperChess.Core.Chess;

namespace SuperChess.Api.Contracts.Games;

public sealed class MoveSummaryResponse
{
    public int MoveNumber { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public PieceColor PlayerColor { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}