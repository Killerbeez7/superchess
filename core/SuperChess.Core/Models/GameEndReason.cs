namespace SuperChess.Core.Models;

public enum GameEndReason
{
    None = 0,
    Checkmate = 1,
    Resignation = 2,
    Timeout = 3,
    Stalemate = 4,
    Agreement = 5,
    InsufficientMaterial = 6
}