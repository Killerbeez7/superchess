using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Domain.Enums;
using SuperChess.Api.Models;

namespace SuperChess.Api.Data.Repositories;

public sealed class GameRepository : IGameRepository
{
    private readonly AppDbContext _db;

    public GameRepository(AppDbContext db) => _db = db;

    private IQueryable<ChessGame> WithDetails() =>
        _db.Games
            .Include(g => g.WhitePlayer)
            .Include(g => g.BlackPlayer)
            .Include(g => g.Moves);

    public Task<ChessGame?> GetByIdWithDetailsAsync(Guid gameId, CancellationToken ct = default) =>
        WithDetails().FirstOrDefaultAsync(g => g.Id == gameId, ct);

    public Task<List<ChessGame>> GetWaitingGamesAsync(CancellationToken ct = default) =>
        WithDetails()
            .Where(g => g.Status == GameStatus.Waiting)
            .OrderByDescending(g => g.CreatedAtUtc)
            .ToListAsync(ct);

    public void AddGame(ChessGame game) => _db.Games.Add(game);
    public void AddPlayer(Player player) => _db.Players.Add(player);
    public void AddMove(Move move) => _db.Moves.Add(move);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
}