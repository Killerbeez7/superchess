namespace SuperChess.Api.Dtos;

public class GameMoveRequestDto
{
    public int GameId { get; set; }
    public string Uci { get; set; } = string.Empty;
    public int? ClientRemainingSeconds { get; set; }
}