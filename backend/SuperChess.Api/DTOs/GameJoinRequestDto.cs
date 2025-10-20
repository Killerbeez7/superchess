namespace SuperChess.Api.Dtos;

public class GameJoinRequestDto
{
    public int PlayerId { get; set; }
    public string PlayerDisplayName { get; set; } = string.Empty;
}