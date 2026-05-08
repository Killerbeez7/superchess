namespace SuperChess.Api.Contracts.Games;

public sealed class MoveSummaryResponse
{
    public int MoveNumber { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string PlayerColor { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}