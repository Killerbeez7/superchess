namespace SuperChess.Api.Services.Bots;

public sealed class BotMoveSelectorProvider : IBotMoveSelectorProvider
{
    private readonly Dictionary<int, IBotMoveSelector> _selectors;
    private readonly IBotMoveSelector _fallbackSelector;

    public BotMoveSelectorProvider(IEnumerable<IBotMoveSelector> selectors)
    {
        _selectors = selectors.ToDictionary(selector => selector.Level);
        _fallbackSelector = _selectors.Values
            .OrderByDescending(selector => selector.Level)
            .First();
    }

    public IBotMoveSelector GetSelector(int level) =>
        _selectors.TryGetValue(level, out var selector)
            ? selector
            : _fallbackSelector;
}
