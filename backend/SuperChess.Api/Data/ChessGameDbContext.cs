using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Models;

namespace SuperChess.Api.Data
{

    public class ChessGameDbContext(DbContextOptions<ChessGameDbContext> options) : DbContext(options)
    {
        public DbSet<ChessGame> ChessGames => Set<ChessGame>();
        public DbSet<Move> Moves => Set<Move>();
        public DbSet<Player> Players => Set<Player>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ChessGame>()
                .HasMany(g => g.Moves)
                .WithOne(m => m.Game)
                .HasForeignKey(m => m.ChessGameId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChessGame>()
                .HasOne(g => g.Player1)
                .WithMany(g => g.GamesAsPlayer1)
                .HasForeignKey(g => g.Player1Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChessGame>()
                .HasOne(g => g.Player2)
                .WithMany(g => g.GamesAsPlayer2)
                .HasForeignKey(g => g.Player2Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChessGame>()
                .HasIndex(g => new { g.Status, g.CreatedAt });

            modelBuilder.Entity<ChessGame>()
                .HasIndex(g => g.Player1Id);

            modelBuilder.Entity<ChessGame>()
                .HasIndex(g => g.Player2Id);

            modelBuilder.Entity<Player>()
                .HasIndex(p => p.DisplayName);

            modelBuilder.Entity<ChessGame>()
                .HasIndex(g => g.Fen);

            modelBuilder.Entity<Move>()
                .HasIndex(m => m.ChessGameId);
        }
    }
}