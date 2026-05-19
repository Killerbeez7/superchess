using Microsoft.AspNetCore.Identity;

namespace SuperChess.Api.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public int LastInitialMinutes { get; set; } = 5;
    public int LastIncrementSeconds { get; set; }
    public bool LastIsRated { get; set; }
    public string LastGameMode { get; set; } = "classical";
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
