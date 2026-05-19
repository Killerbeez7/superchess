namespace SuperChess.Api.Services.Bots;

public sealed class LevelThreeBotMoveSelector(
    IBotMoveGenerator moveGenerator,
    BotMoveEvaluator moveEvaluator) : IBotMoveSelector
{
    private const double OpponentReplyWeight = 1.05;
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

        score += Weighted(moveEvaluator.EvaluatePositionForSide(move.Result.NewFen, botSide), PositionWeight);

        var opponentReplies = moveGenerator.GetLegalMoves(move.Result.NewFen).ToList();
        if (opponentReplies.Count == 0)
        {
            return score;
        }

        var bestOpponentReplyScore = opponentReplies
            .Select(reply => ScoreOpponentReply(move.Result.NewFen, reply, botSide))
            .Max();

        return score - Weighted(bestOpponentReplyScore, OpponentReplyWeight);
    }

    private int ScoreOpponentReply(string fen, BotMoveSelection reply, char botSide)
    {
        if (reply.Result.IsCheckmate)
        {
            return BotMoveEvaluator.CheckmateScore;
        }

        if (reply.Result.IsStalemate)
        {
            return 0;
        }

        var score = moveEvaluator.EvaluateImmediate(fen, reply);
        if (reply.Result.NewFen is null)
        {
            return score;
        }

        score -= moveEvaluator.EvaluatePositionForSide(reply.Result.NewFen, botSide);

        return score;
    }

    private static int Weighted(int score, double weight) =>
        (int)Math.Round(score * weight);

    private sealed record ScoredBotMove(BotMoveSelection Move, int Score);
}
