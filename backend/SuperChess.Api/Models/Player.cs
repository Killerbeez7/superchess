using SuperChess.Api.Entities;

namespace SuperChess.Api.Models;

public class Player
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string DisplayName { get; set; } = string.Empty;
}