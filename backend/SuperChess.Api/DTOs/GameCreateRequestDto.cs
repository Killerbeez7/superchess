using SuperChess.Core.Models;

namespace SuperChess.Api.Dtos;

public class GameCreateRequestDto
{
    public string Player1DisplayName { get; set; } = string.Empty;
    public PlayerColor PreferredColor { get; set; } = PlayerColor.White;
    public int? BaseTimeSeconds { get; set; } = 600;
    public int? IncrementSeconds { get; set; } = 0;
    public bool IsRated { get; set; } = false;
    public bool AllowSpectators { get; set; } = true;
}