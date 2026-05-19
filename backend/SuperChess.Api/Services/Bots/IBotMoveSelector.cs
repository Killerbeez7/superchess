namespace SuperChess.Api.Services.Bots;

public interface IBotMoveSelector
{
    int Level { get; }

    BotMoveSelection? SelectMove(string fen);
}
