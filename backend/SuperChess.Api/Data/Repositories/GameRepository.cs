using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Domain.Enums;
using SuperChess.Api.Models;

namespace SuperChess.Api.Data.Repositories;

public sealed class GameRepository(AppDbContext db) : IGameRepository
{
    private IQueryable<ChessGame> WithDetails() =>
        db.Games
            .Include(g => g.WhitePlayer)
            .Include(g => g.BlackPlayer)
            .Include(g => g.Moves);

    public Task<ChessGame?> GetByIdWithDetailsAsync(Guid gameId, CancellationToken ct = default) =>
        WithDetails().FirstOrDefaultAsync(g => g.Id == gameId, ct);

    public Task<List<ChessGame>> GetWaitingGamesAsync(CancellationToken ct = default) =>
        GetWaitingGamesQuery()
            .OrderByDescending(g => g.CreatedAtUtc)
            .ToListAsync(ct);

    public Task<List<ChessGame>> GetGamesForUserAsync(
        Guid userId,
        int take,
        CancellationToken ct = default) =>
        WithDetails()
            .Where(g =>
                g.Kind == GameKind.Online &&
                g.Status == GameStatus.Completed &&
                !g.WhitePlayer.IsBot &&
                g.BlackPlayer != null &&
                !g.BlackPlayer.IsBot &&
                (g.WhitePlayer.UserId == userId ||
                 g.BlackPlayer.UserId == userId))
            .OrderByDescending(g => g.UpdatedAtUtc)
            .ThenByDescending(g => g.CreatedAtUtc)
            .Take(take)
            .ToListAsync(ct);

    public void AddGame(ChessGame game) => db.Games.Add(game);
    public void AddPlayer(Player player) => db.Players.Add(player);
    public void AddMove(Move move) => db.Moves.Add(move);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);

    private IQueryable<ChessGame> GetWaitingGamesQuery()
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-15);

        return WithDetails()
            .Where(g =>
                g.Kind == GameKind.Online &&
                g.Status == GameStatus.Waiting &&
                !g.WhitePlayer.IsBot &&
                g.CreatedAtUtc >= cutoff);
    }
}
