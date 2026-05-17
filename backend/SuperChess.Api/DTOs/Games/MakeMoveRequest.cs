namespace SuperChess.Api.DTOs.Games;

public class MakeMoveRequest
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string? Promotion { get; set; }
    public Guid PlayerId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
}

