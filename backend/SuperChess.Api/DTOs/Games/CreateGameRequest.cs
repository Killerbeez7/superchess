namespace SuperChess.Api.DTOs.Games;

public class CreateGameRequest
{
    public int InitialMinutes { get; set; } = 5;
    public int IncrementSeconds { get; set; }
    public bool IsRated { get; set; }
    public string GameMode { get; set; } = "classical";
}
