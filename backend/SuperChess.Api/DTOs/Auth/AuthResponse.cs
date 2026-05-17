namespace SuperChess.Api.DTOs.Auth;

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public CurrentUserResponse User { get; set; } = new();
}