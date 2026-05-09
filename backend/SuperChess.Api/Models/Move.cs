using SuperChess.Core.Chess;

namespace SuperChess.Api.Models;

public class Move
{
    public Guid Id { get; set; }

    public Guid GameId { get; set; }
    public ChessGame Game { get; set; } = null!;

    public int MoveNumber { get; set; }
    public string Uci { get; set; } = string.Empty;
    public string? San { get; set; }
    public PieceColor PlayedByColor { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}