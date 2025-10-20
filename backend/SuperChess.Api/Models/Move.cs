using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using SuperChess.Core.Models;

namespace SuperChess.Api.Models;

public class Move
{
    [Key]
    public int Id { get; set; }

    public int ChessGameId { get; set; }
    [JsonIgnore]
    public ChessGame? Game { get; set; }

    public int MoveNumber { get; set; }
    public PlayerColor ByColor { get; set; }

    [Required, MaxLength(2)]
    public string From { get; set; } = string.Empty;

    [Required, MaxLength(2)]
    public string To { get; set; } = string.Empty;

    [MaxLength(1)]
    public string? Promotion { get; set; }

    [MaxLength(16)]
    public string? San { get; set; }

    [MaxLength(8)]
    public string? Uci { get; set; }

    public DateTimeOffset PlayedAt { get; set; } = DateTimeOffset.UtcNow;
}