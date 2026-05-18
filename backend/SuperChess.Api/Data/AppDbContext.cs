using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Models;
using SuperChess.Api.Entities;

namespace SuperChess.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Player> Players => Set<Player>();
    public DbSet<ChessGame> Games => Set<ChessGame>();
    public DbSet<Move> Moves => Set<Move>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Player>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.DisplayName).HasMaxLength(80).IsRequired();
            entity.Property(x => x.SessionToken).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<ChessGame>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            entity.Property(x => x.CurrentFen).HasMaxLength(200).IsRequired();
            entity.Property(x => x.WhoseTurn).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(x => x.TimeControlType).HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(x => x.EndReason).HasConversion<string>().HasMaxLength(30);
            entity.Property(x => x.WinnerColor).HasConversion<string>().HasMaxLength(10);

            entity.HasOne(x => x.WhitePlayer)
                .WithMany()
                .HasForeignKey(x => x.WhitePlayerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.BlackPlayer)
                .WithMany()
                .HasForeignKey(x => x.BlackPlayerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Move>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Uci).HasMaxLength(20).IsRequired();
            entity.Property(x => x.San).HasMaxLength(20);
            entity.Property(x => x.PlayedByColor).HasConversion<string>().HasMaxLength(10).IsRequired();

            entity.HasOne(x => x.Game)
                .WithMany(x => x.Moves)
                .HasForeignKey(x => x.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
