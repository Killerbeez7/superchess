namespace SuperChess.Api.DTOs.Games;

public class GameStatsResponse
{
    public int Games { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
}
