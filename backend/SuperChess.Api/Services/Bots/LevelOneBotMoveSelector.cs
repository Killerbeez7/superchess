namespace SuperChess.Api.Services.Bots;

public sealed class LevelOneBotMoveSelector(
    IBotMoveGenerator moveGenerator,
    BotMoveEvaluator moveEvaluator) : IBotMoveSelector
{
    private const int TopMovePoolSize = 3;

    public int Level => 1;

    public BotMoveSelection? SelectMove(string fen)
    {
        var candidates = moveGenerator.GetLegalMoves(fen).ToList();
        if (candidates.Count == 0)
        {
            return null;
        }

        var scoredMoves = candidates
            .Select(move => new ScoredBotMove(move, moveEvaluator.EvaluateWithBasicSafety(fen, move)))
            .OrderByDescending(move => move.Score)
            .Take(Math.Min(TopMovePoolSize, candidates.Count))
            .ToList();

        return scoredMoves[Random.Shared.Next(scoredMoves.Count)].Move;
    }

    private sealed record ScoredBotMove(BotMoveSelection Move, int Score);
}
