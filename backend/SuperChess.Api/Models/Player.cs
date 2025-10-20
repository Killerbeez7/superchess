using System.ComponentModel.DataAnnotations;
using SuperChess.Core.Models;

namespace SuperChess.Api.Models;

public class Player
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(64)]
    public string DisplayName { get; set; } = "Guest";

    public PlayerColor Color { get; set; } = PlayerColor.None;

    public int Elo { get; set; } = 1000;
    public bool IsBot { get; set; } = false;
    public bool IsOnline { get; set; } = false;
    [MaxLength(256)]
    public string? AvatarUrl { get; set; }
    [MaxLength(128)]
    public string? Location { get; set; }

    // Navigation
    public ICollection<ChessGame> GamesAsPlayer1 { get; set; } = new List<ChessGame>();
    public ICollection<ChessGame> GamesAsPlayer2 { get; set; } = new List<ChessGame>();
}