namespace SuperChess.Api.DTOs.Games;

public class CreateBotGameRequest : CreateGameRequest
{
    public int BotLevel { get; set; } = 2;
    public string PlayerColor { get; set; } = "white";
}
