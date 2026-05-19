using SuperChess.Core.Chess;

namespace SuperChess.Api.Services.Bots;

public sealed class BotMoveGenerator(IChessEngine engine) : IBotMoveGenerator
{
    private static readonly string[] BoardSquares =
    [
        "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
        "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
        "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
        "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
        "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
        "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
        "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
        "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"
    ];

    private static readonly string[] PromotionPieces = ["q", "r", "b", "n"];

    public IEnumerable<BotMoveSelection> GetLegalMoves(string fen)
    {
        var board = FenBoardView.Parse(fen);
        var sourceSquares = board.Pieces
            .Where(piece => FenBoardView.PieceBelongsToSide(piece.Value, board.SideToMove))
            .Select(piece => piece.Key);

        foreach (var from in sourceSquares)
        {
            foreach (var to in BoardSquares)
            {
                var regularMove = engine.TryApplyMove(fen, from, to);
                if (regularMove.IsLegal)
                {
                    yield return new BotMoveSelection(from, to, null, regularMove);
                    continue;
                }

                foreach (var promotion in PromotionPieces)
                {
                    var promotionMove = engine.TryApplyMove(fen, from, to, promotion);
                    if (promotionMove.IsLegal)
                    {
                        yield return new BotMoveSelection(from, to, promotion, promotionMove);
                    }
                }
            }
        }
    }
}
