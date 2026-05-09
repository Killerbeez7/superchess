namespace SuperChess.Core.Chess;

public sealed record MoveResult(
    bool IsLegal,
    string? NewFen,
    string? Error,
    bool IsCheck = false,
    bool IsCheckmate = false)
{
    public static MoveResult Legal(string newFen, bool isCheck = false, bool isCheckmate = false) =>
        new(true, newFen, null, isCheck, isCheckmate);

    public static MoveResult Illegal(string reason) =>
        new(false, null, reason);
}
 
