namespace SuperChess.Api.Services.Bots;

public sealed class LevelThreeBotMoveSelector(
    IBotMoveGenerator moveGenerator,
    BotMoveEvaluator moveEvaluator) : IBotMoveSelector
{
    private const double OpponentReplyWeight = 1.15;
    private const double PositionWeight = 0.8;

    public int Level => 3;

    public BotMoveSelection? SelectMove(string fen)
    {
        var candidates = moveGenerator.GetLegalMoves(fen).ToList();
        if (candidates.Count == 0)
        {
            return null;
        }

        var botSide = FenBoardView.Parse(fen).SideToMove;

        return candidates
            .Select(move => new ScoredBotMove(move, ScoreMove(fen, move, botSide)))
            .OrderByDescending(move => move.Score)
            .First()
            .Move;
    }

    private int ScoreMove(string fen, BotMoveSelection move, char botSide)
    {
        if (move.Result.IsCheckmate)
        {
            return BotMoveEvaluator.CheckmateScore;
        }

        if (move.Result.IsStalemate)
        {
            return BotMoveEvaluator.StalemateScore;
        }

        var score = moveEvaluator.EvaluateWithBasicSafety(fen, move);
        if (move.Result.NewFen is null)
        {
            return score;
        }

        var opponentReplies = moveGenerator.GetLegalMoves(move.Result.NewFen).ToList();
        var resultingBoard = FenBoardView.Parse(move.Result.NewFen);

        score += Weighted(
            moveEvaluator.EvaluatePositionForSide(resultingBoard, botSide, opponentReplies),
            PositionWeight);

        if (opponentReplies.Count == 0)
        {
            return score;
        }

        var bestOpponentReplyScore = opponentReplies
            .Select(reply => moveEvaluator.EvaluateImmediate(move.Result.NewFen, reply))
            .Max();

        return score - Weighted(bestOpponentReplyScore, OpponentReplyWeight);
    }

    private static int Weighted(int score, double weight) =>
        (int)Math.Round(score * weight);

    private sealed record ScoredBotMove(BotMoveSelection Move, int Score);
}
