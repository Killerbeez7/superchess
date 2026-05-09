using SuperChess.Api.Domain.Enums;
using SuperChess.Core.Chess;

namespace SuperChess.Api.Models;

public class ChessGame
{
    public Guid Id { get; set; }

    public Guid WhitePlayerId { get; set; }
    public Player WhitePlayer { get; set; } = null!;

    public Guid? BlackPlayerId { get; set; }
    public Player? BlackPlayer { get; set; }

    public GameStatus Status { get; set; }
    public string CurrentFen { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    public PieceColor WhoseTurn { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<Move> Moves { get; set; } = [];
}