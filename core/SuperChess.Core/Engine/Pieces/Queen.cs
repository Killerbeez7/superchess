using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public class Queen(PlayerColor color) : Piece(color)
{
    public override PieceType Type => PieceType.Pawn;

    public override Piece Copy() => new Queen(Color) { HasMoved = HasMoved };
}
