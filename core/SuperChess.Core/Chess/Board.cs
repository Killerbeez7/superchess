namespace SuperChess.Core.Chess;

internal sealed class Board
{
    private readonly Dictionary<string, char> _squares;

    public Board(Dictionary<string, char> squares) => _squares = squares;

    public IReadOnlyDictionary<string, char> Squares => _squares;

    public bool TryGet(string square, out char piece) =>
        _squares.TryGetValue(square, out piece);

    public bool IsOccupied(string square) => _squares.ContainsKey(square);

    public void Move(string from, string to)
    {
        var piece = _squares[from];
        _squares.Remove(from);
        _squares[to] = piece;
    }

    public static bool IsWhite(char piece) => char.IsUpper(piece);
    public static bool IsBlack(char piece) => char.IsLower(piece);
}