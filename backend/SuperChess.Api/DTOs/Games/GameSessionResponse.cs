using SuperChess.Core.Chess;

namespace SuperChess.Api.DTOs.Games;

public class GameSessionResponse
{
    public GameResponse Game { get; set; } = new();

    public Guid PlayerId { get; set; }
    public PieceColor Color { get; set; }
}