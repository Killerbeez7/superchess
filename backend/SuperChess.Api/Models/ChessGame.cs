using SuperChess.Api.Domain.Enums;
using SuperChess.Core.Chess;

namespace SuperChess.Api.Models;

public class ChessGame
{
    public const int DefaultInitialClockMs = 10 * 60 * 1000;

    public Guid Id { get; set; }

    public Guid WhitePlayerId { get; set; }
    public Player WhitePlayer { get; set; } = null!;

    public Guid? BlackPlayerId { get; set; }
    public Player? BlackPlayer { get; set; }

    public GameStatus Status { get; set; }
    public GameKind Kind { get; set; } = GameKind.Online;
    public string CurrentFen { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    public PieceColor WhoseTurn { get; set; }
    public int InitialClockMs { get; set; } = DefaultInitialClockMs;
    public int IncrementMs { get; set; }
    public TimeControlType TimeControlType { get; set; } = TimeControlType.Blitz;
    public bool IsRated { get; set; }
    public int BotLevel { get; set; }
    public int WhiteTimeRemainingMs { get; set; } = DefaultInitialClockMs;
    public int BlackTimeRemainingMs { get; set; } = DefaultInitialClockMs;
    public DateTime? TurnStartedAtUtc { get; set; }
    public GameEndReason? EndReason { get; set; }
    public PieceColor? WinnerColor { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<Move> Moves { get; set; } = [];
}
