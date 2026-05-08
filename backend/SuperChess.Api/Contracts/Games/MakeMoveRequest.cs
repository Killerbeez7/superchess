namespace SuperChess.Api.Contracts.Games;

public class MakeMoveRequest
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string? Promotion { get; set; }
}

