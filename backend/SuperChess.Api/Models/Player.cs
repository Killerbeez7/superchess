using SuperChess.Api.Entities;

namespace SuperChess.Api.Models;

public class Player
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public bool IsBot { get; set; }

    public string DisplayName { get; set; } = string.Empty;
}