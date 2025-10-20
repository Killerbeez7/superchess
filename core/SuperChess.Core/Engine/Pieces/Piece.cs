using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public abstract class Piece(PlayerColor color)
{
    public PlayerColor Color { get; } = ValidateColor(color);

    public abstract PieceType Type { get; }

    public bool HasMoved { get; set; } = false;

    public abstract Piece Copy();

    public char GetFenChar()
    {
        char lower = Type.ToFenChar();
        return Color == PlayerColor.White ? char.ToUpperInvariant(lower) : lower;
    }

    protected static PlayerColor ValidateColor(PlayerColor color)
    {
        if (color == PlayerColor.None)
        {
            throw new ArgumentException("Piece color cannot be 'None'.");
        }
        return color;
    }

    public override bool Equals(object? obj) => obj is Piece other && Type == other.Type && Color == other.Color;
    public override int GetHashCode() => HashCode.Combine(Type, Color);
}