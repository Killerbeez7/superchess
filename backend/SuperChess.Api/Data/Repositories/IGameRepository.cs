using SuperChess.Api.Models;

namespace SuperChess.Api.Data.Repositories;

public interface IGameRepository
{
    Task<ChessGame?> GetByIdWithDetailsAsync(Guid gameId, CancellationToken ct = default);
    Task<List<ChessGame>> GetWaitingGamesAsync(CancellationToken ct = default);
    void AddGame(ChessGame game);
    void AddPlayer(Player player);
    void AddMove(Move move);
    Task SaveChangesAsync(CancellationToken ct = default);
}