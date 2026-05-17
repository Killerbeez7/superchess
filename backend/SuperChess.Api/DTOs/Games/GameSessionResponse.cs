namespace SuperChess.Api.DTOs.Games;

public sealed class GameSessionResponse
{
    public GameResponse Game { get; set; } = null!;
    public PlayerSessionResponse Session { get; set; } = null!;
}