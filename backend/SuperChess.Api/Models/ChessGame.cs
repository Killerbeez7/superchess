namespace SuperChess.Api.Models;

public class ChessGame
{
    public Guid Id { get; set; }

    public Guid WhitePlayerId { get; set; }
    public Player WhitePlayer { get; set; } = null!;

    public Guid? BlackPlayerId { get; set; }
    public Player? BlackPlayer { get; set; }

    public string Status { get; set; } = "waiting";
    public string CurrentFen { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    public string WhoseTurn { get; set; } = "white";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<Move> Moves { get; set; } = [];
}