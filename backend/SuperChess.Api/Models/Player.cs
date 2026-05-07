namespace SuperChess.Api.Models;

public class Player
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string SessionToken { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}




