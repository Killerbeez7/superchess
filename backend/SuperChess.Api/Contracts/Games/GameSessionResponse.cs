namespace SuperChess.Api.Contracts.Games;

public class GameSessionResponse
{
    public GameResponse Game { get; set; } = null!;
    public PlayerSessionResponse Session { get; set; } = null!;
}