using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public class Bishop(PlayerColor color) : Piece(color)
{
    public override PieceType Type => PieceType.Pawn;

    public override Piece Copy() => new Bishop(Color) { HasMoved = HasMoved };
}
