namespace SuperChess.Api.Services.Bots;

public sealed class LevelTwoBotMoveSelector(
    IBotMoveGenerator moveGenerator,
    BotMoveEvaluator moveEvaluator) : IBotMoveSelector
{
    private const int TopMovePoolSize = 3;
    private const double OpponentReplyWeight = 0.85;

    public int Level => 2;

    public BotMoveSelection? SelectMove(string fen)
    {
        var candidates = moveGenerator.GetLegalMoves(fen).ToList();
        if (candidates.Count == 0)
        {
            return null;
        }

        var scoredMoves = candidates
            .Select(move => new ScoredBotMove(move, ScoreMoveWithBestReply(fen, move)))
            .OrderByDescending(move => move.Score)
            .Take(Math.Min(TopMovePoolSize, candidates.Count))
            .ToList();

        return scoredMoves[Random.Shared.Next(scoredMoves.Count)].Move;
    }

    private int ScoreMoveWithBestReply(string fen, BotMoveSelection move)
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
        if (opponentReplies.Count == 0)
        {
            return score;
        }

        var bestOpponentReplyScore = opponentReplies
            .Select(reply => moveEvaluator.EvaluateImmediate(move.Result.NewFen, reply))
            .Max();

        return score - (int)Math.Round(bestOpponentReplyScore * OpponentReplyWeight);
    }

    private sealed record ScoredBotMove(BotMoveSelection Move, int Score);
}
