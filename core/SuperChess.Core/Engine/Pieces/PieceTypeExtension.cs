namespace SuperChess.Core.Engine.Pieces;

public static class PieceTypeExtensions
{
    public static char ToFenChar(this PieceType type)
    {
        return type switch
        {
            PieceType.Pawn => 'p',
            PieceType.Knight => 'n',
            PieceType.Bishop => 'b',
            PieceType.Rook => 'r',
            PieceType.Queen => 'q',
            PieceType.King => 'k',
            _ => throw new ArgumentOutOfRangeException(nameof(type), "Unknown piece type")
        };
    }

    public static PieceType FromFenChar(char fenChar)
    {
        return fenChar switch
        {
            'p' => PieceType.Pawn,
            'n' => PieceType.Knight,
            'b' => PieceType.Bishop,
            'r' => PieceType.Rook,
            'q' => PieceType.Queen,
            'k' => PieceType.King,
            _ => throw new ArgumentException($"Invalid FEN char: {fenChar}", nameof(fenChar))
        };
    }
}