namespace SuperChess.Core.Engine;

public class Position
{
    public int Row { get; }
    public int Col { get; }

    // Creates a new position, validation if it's within board limits
    public Position(int row, int col)
    {
        if (row < 0 || row > 7 || col < 0 || col > 7)
            throw new ArgumentOutOfRangeException(nameof(row), "OUT OF BOARD! Position must be within 0-7 for row and col");
        Row = row;
        Col = col;
    }

    /// True for light squares, False for dark squares 
    public bool IsLightSquare()
    {
        return (Row + Col) % 2 == 0;
    }

    // Creates a Position from UCI notation ("e2" -> row=6, col=4)
    public static Position FromUci(string uci)
    {
        if (string.IsNullOrWhiteSpace(uci) || uci.Length != 2)
            throw new ArgumentException("UCI must be 2 chars (e.g., 'e2')", nameof(uci));

        char fileChar = uci[0];
        char rankChar = uci[1];

        if (!char.IsLetter(fileChar) || fileChar < 'a' || fileChar > 'h')
            throw new ArgumentException("Invalid file (a-h expected)", nameof(uci));
        if (!char.IsDigit(rankChar) || rankChar < '1' || rankChar > '8')
            throw new ArgumentException("Invalid rank (1-8 expected)", nameof(uci));

        int col = fileChar - 'a';  // a=0, b=1, ..., h=7
        int row = 7 - (rankChar - '1');  // Rank 1=row 7, Rank 2=row 6, ..., Rank 8=row 0

        return new Position(row, col);
    }

    public override bool Equals(object? obj)
    {
        return obj is Position position && Row == position.Row && Col == position.Col;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Row, Col);
    }

    public static bool operator ==(Position left, Position right)
    {
        return EqualityComparer<Position>.Default.Equals(left, right);
    }

    public static bool operator !=(Position left, Position right)
    {
        return !(left == right);
    }


    /// Adds a direction delta; returns null if off-board (tolerant mode).
    public static Position? operator +(Position pos, Direction dir)
    {
        int newRow = pos.Row + dir.RowDelta;
        int newCol = pos.Col + dir.ColDelta;
        if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7)
            return null;  // Or throw new InvalidOperationException("Move off-board");
        return new Position(newRow, newCol);
    }

    // UCI parser for easy serialization and debugging
    public string ToUci()
    {
        return $"{(char)('a' + Col)}{(char)('1' + (7 - Row))}";
    }

    public override string ToString() => ToUci();
}


