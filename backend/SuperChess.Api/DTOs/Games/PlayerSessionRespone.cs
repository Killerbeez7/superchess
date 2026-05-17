namespace SuperChess.Api.DTOs.Games;

public class PlayerSessionResponse
{
    public Guid PlayerId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}