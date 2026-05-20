namespace SuperChess.Api.DTOs.Games;

public class GameHistoryResponse
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public string PlayerColor { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public string? WinnerColor { get; set; }
    public string WhitePlayerName { get; set; } = string.Empty;
    public string BlackPlayerName { get; set; } = string.Empty;
    public Guid? OpponentUserId { get; set; }
    public string OpponentName { get; set; } = string.Empty;
    public bool OpponentIsBot { get; set; }
    public int InitialClockMs { get; set; }
    public int IncrementMs { get; set; }
    public string TimeControlType { get; set; } = string.Empty;
    public bool IsRated { get; set; }
    public int MoveCount { get; set; }
    public string? EndReason { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
