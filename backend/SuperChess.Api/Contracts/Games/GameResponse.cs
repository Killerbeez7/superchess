namespace SuperChess.Api.Contracts.Games;

public class GameResponse
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CurrentFen { get; set; } = string.Empty;
    public string WhoseTurn { get; set; } = string.Empty;

    public PlayerSummary WhitePlayer { get; set; } = null!;
    public PlayerSummary? BlackPlayer { get; set; }


    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public List<MoveSummaryResponse> Moves { get; set; } = new();
}

public class PlayerSummary
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}
