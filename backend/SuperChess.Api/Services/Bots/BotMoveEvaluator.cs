namespace SuperChess.Api.Services.Bots;

public sealed class BotMoveEvaluator(IBotMoveGenerator moveGenerator)
{
    public const int CheckmateScore = 1_000_000;
    public const int StalemateScore = -5_000;

    private const int CheckBonus = 35;
    private const int CenterBonus = 12;
    private const int DevelopmentBonus = 10;
    private const int MaterialUnit = 100;

    private static readonly HashSet<string> CenterSquares = ["d4", "e4", "d5", "e5"];

    public int EvaluateImmediate(string fen, BotMoveSelection move)
    {
        if (move.Result.IsCheckmate)
        {
            return CheckmateScore;
        }

        if (move.Result.IsStalemate)
        {
            return StalemateScore;
        }

        var board = FenBoardView.Parse(fen);
        var movingPiece = board.GetPiece(move.From);
        if (movingPiece is null)
        {
            return 0;
        }

        var score = 0;
        var capturedPiece = board.GetPiece(move.To);
        if (capturedPiece is not null && !SameColor(movingPiece.Value, capturedPiece.Value))
        {
            score += PieceValue(capturedPiece.Value) * MaterialUnit;
        }

        if (move.Result.IsCheck)
        {
            score += CheckBonus;
        }

        if (move.Promotion is not null)
        {
            score += PieceValue(move.Promotion[0]) * MaterialUnit;
        }

        if (CenterSquares.Contains(move.To))
        {
            score += CenterBonus;
        }

        if (IsDevelopingMove(movingPiece.Value, move.From))
        {
            score += DevelopmentBonus;
        }

        return score;
    }

    public int EvaluateWithBasicSafety(string fen, BotMoveSelection move)
    {
        var score = EvaluateImmediate(fen, move);

        var board = FenBoardView.Parse(fen);
        var movingPiece = board.GetPiece(move.From);
        if (movingPiece is null)
        {
            return score;
        }

        return score - HangingPiecePenalty(move, movingPiece.Value);
    }

    public int EvaluatePositionForSide(string fen, char side)
    {
        var board = FenBoardView.Parse(fen);
        var legalMoves = moveGenerator.GetLegalMoves(fen);

        return EvaluatePositionForSide(board, side, legalMoves);
    }

    public int EvaluatePositionForSide(
        FenBoardView board,
        char side,
        IEnumerable<BotMoveSelection> legalMovesForSideToMove)
    {
        var score = MaterialScore(board, side);
        score -= LoosePiecePenalty(board, side, legalMovesForSideToMove);

        return score;
    }

    private int HangingPiecePenalty(BotMoveSelection move, char movingPiece)
    {
        if (move.Result.NewFen is null || move.Result.IsCheckmate || move.Result.IsStalemate)
        {
            return 0;
        }

        var movedPieceValue = move.Promotion is null
            ? PieceValue(movingPiece)
            : PieceValue(move.Promotion[0]);

        if (movedPieceValue <= 1)
        {
            return 0;
        }

        return moveGenerator.GetLegalMoves(move.Result.NewFen).Any(reply => reply.To == move.To)
            ? movedPieceValue * 80
            : 0;
    }

    private static int LoosePiecePenalty(
        FenBoardView board,
        char side,
        IEnumerable<BotMoveSelection> legalMovesForSideToMove)
    {
        var opponentCaptures = legalMovesForSideToMove
            .Where(move =>
            {
                var target = board.GetPiece(move.To);
                return target is not null && PieceBelongsToSide(target.Value, side);
            });

        var strongestThreatBySquare = new Dictionary<string, int>();
        foreach (var capture in opponentCaptures)
        {
            var movingPiece = board.GetPiece(capture.From);
            var capturedPiece = board.GetPiece(capture.To);
            if (movingPiece is null || capturedPiece is null)
            {
                continue;
            }

            var capturedValue = PieceValue(capturedPiece.Value);
            if (capturedValue <= 1)
            {
                continue;
            }

            var attackerValue = PieceValue(movingPiece.Value);
            var threatScore = (capturedValue * MaterialUnit) - (attackerValue * 25);

            if (
                !strongestThreatBySquare.TryGetValue(capture.To, out var currentThreat) ||
                threatScore > currentThreat)
            {
                strongestThreatBySquare[capture.To] = threatScore;
            }
        }

        return strongestThreatBySquare.Values.Sum();
    }

    private static int MaterialScore(FenBoardView board, char side)
    {
        var score = 0;

        foreach (var piece in board.Pieces.Select(entry => entry.Value))
        {
            var value = PieceValue(piece) * MaterialUnit;
            score += PieceBelongsToSide(piece, side) ? value : -value;
        }

        return score;
    }

    private static bool IsDevelopingMove(char piece, string from)
    {
        var lowerPiece = char.ToLowerInvariant(piece);
        if (lowerPiece is not ('n' or 'b'))
        {
            return false;
        }

        return from is "b1" or "g1" or "c1" or "f1" or "b8" or "g8" or "c8" or "f8";
    }

    public static int PieceValue(char piece) =>
        char.ToLowerInvariant(piece) switch
        {
            'p' => 1,
            'n' or 'b' => 3,
            'r' => 5,
            'q' => 9,
            _ => 0
        };

    private static bool SameColor(char a, char b) =>
        char.IsUpper(a) == char.IsUpper(b);

    public static bool PieceBelongsToSide(char piece, char side) =>
        FenBoardView.PieceBelongsToSide(piece, side);

    public static char OppositeSide(char side) => side == 'w' ? 'b' : 'w';
}
