namespace SuperChess.Api.DTOs.Auth;

public class CurrentUserResponse
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserGameSettingsResponse LastGameSettings { get; set; } = new();
}

public class UserGameSettingsResponse
{
    public int InitialMinutes { get; set; } = 5;
    public int IncrementSeconds { get; set; }
    public bool IsRated { get; set; }
    public string GameMode { get; set; } = "classical";
}
