using System.ComponentModel.DataAnnotations;
using SuperChess.Core.Engine.Board;
using SuperChess.Core.Models;

namespace SuperChess.Api.Models;

public class ChessGame
{
    public int Id { get; set; }

    [MaxLength(128)]
    public string? Title { get; set; } = "Untitled Game";

    [Required]
    public int Player1Id { get; set; }
    public Player? Player1 { get; set; }

    public int? Player2Id { get; set; }
    public Player? Player2 { get; set; }

    public PlayerColor Player1Color { get; set; } = PlayerColor.White;
    public PlayerColor Player2Color { get; set; } = PlayerColor.Black;

    public GameStatus Status { get; set; } = GameStatus.Waiting;
    public PlayerColor WhoseTurn { get; set; } = PlayerColor.White;

    [Required, MaxLength(128)]
    public string Fen { get; set; } = new ChessBoard().ToFen();

    [MaxLength(4096)]
    public string? Pgn { get; set; }

    public ICollection<Move> Moves { get; set; } = new List<Move>();

    public GameResult Result { get; set; } = GameResult.None;
    public GameEndReason EndReason { get; set; } = GameEndReason.None;

    public int? TimeControlSeconds { get; set; }
    public int? IncrementSeconds { get; set; }

    public int RemainingSecondsPlayer1 { get; set; }
    public int RemainingSecondsPlayer2 { get; set; }

    public bool IsRated { get; set; } = false;
    public bool AllowSpectators { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastMoveAt { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public ChessGame()
    {
        RemainingSecondsPlayer1 = TimeControlSeconds ?? 600;
        RemainingSecondsPlayer2 = RemainingSecondsPlayer1;
    }
}