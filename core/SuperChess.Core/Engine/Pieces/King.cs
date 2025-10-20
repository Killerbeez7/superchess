using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public class King(PlayerColor color) : Piece(color)
{
    public override PieceType Type => PieceType.Pawn;

    public override Piece Copy() => new King(Color) { HasMoved = HasMoved };
}
