namespace SuperChess.Core.Chess;

public interface IChessEngine
{
    string StartingFen { get; }
    MoveResult TryApplyMove(string fen, string from, string to, string? promotion = null);
}
