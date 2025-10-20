namespace SuperChess.Core.Engine;

public sealed class Direction(int rowDelta, int colDelta)
{
    // Cardinal directions
    public static readonly Direction North = new(-1, 0);
    public static readonly Direction South = new(1, 0);
    public static readonly Direction East = new(0, 1);
    public static readonly Direction West = new(0, -1);

    // Diagonals
    public static readonly Direction NorthEast = North + East;
    public static readonly Direction NorthWest = North + West;
    public static readonly Direction SouthEast = South + East;
    public static readonly Direction SouthWest = South + West;

    // Knight moves
    public static readonly Direction KnightNorthEast = North + (East * 2);
    public static readonly Direction KnightNorthWest = North + (West * 2);
    public static readonly Direction KnightSouthEast = South + (East * 2);
    public static readonly Direction KnightSouthWest = South + (West * 2);
    public static readonly Direction KnightEastNorth = East + (North * 2);
    public static readonly Direction KnightEastSouth = East + (South * 2);
    public static readonly Direction KnightWestNorth = West + (North * 2);
    public static readonly Direction KnightWestSouth = West + (South * 2);

    public int RowDelta { get; } = rowDelta;
    public int ColDelta { get; } = colDelta;

    public static Direction operator +(Direction a, Direction b)
    {
        return new(a.RowDelta + b.RowDelta, a.ColDelta + b.ColDelta);
    }


    public static Direction operator *(int scalar, Direction d)
    {
        return new(scalar * d.RowDelta, scalar * d.ColDelta);
    }

    public static Direction operator *(Direction d, int scalar)
    {
        return scalar * d;
    }

    // Equality for sets/dicts
    public override bool Equals(object? obj) => obj is Direction other && RowDelta == other.RowDelta && ColDelta == other.ColDelta;
    public override int GetHashCode() => HashCode.Combine(RowDelta, ColDelta);

    // Debugging/serialization
    public override string ToString() => $"{RowDelta},{ColDelta}";
}