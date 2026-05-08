namespace SuperChess.Api.Contracts.Games;

public class JoinGameRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public string? ExistingSessionToken { get; set; }
}

