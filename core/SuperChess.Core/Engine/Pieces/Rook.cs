using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public class Rook(PlayerColor color) : Piece(color)
{
    public override PieceType Type => PieceType.Pawn;

    public override Piece Copy() => new Rook(Color) { HasMoved = HasMoved };
}
