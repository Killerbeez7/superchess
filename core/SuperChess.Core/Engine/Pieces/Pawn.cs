using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public class Pawn(PlayerColor color) : Piece(color)
{
    public override PieceType Type => PieceType.Pawn;

    public override Piece Copy() => new Pawn(Color) { HasMoved = HasMoved };
}
