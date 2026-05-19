namespace SuperChess.Api.Services.Bots;

public interface IBotMoveSelectorProvider
{
    IBotMoveSelector GetSelector(int level);
}
