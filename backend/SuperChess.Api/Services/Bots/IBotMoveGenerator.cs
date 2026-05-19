namespace SuperChess.Api.Services.Bots;

public interface IBotMoveGenerator
{
    IEnumerable<BotMoveSelection> GetLegalMoves(string fen);
}
