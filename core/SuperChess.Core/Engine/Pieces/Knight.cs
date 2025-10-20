using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Pieces;

public class Knight(PlayerColor color) : Piece(color)
{
    public override PieceType Type => PieceType.Pawn;

    public override Piece Copy() => new Knight(Color) { HasMoved = HasMoved };
}
