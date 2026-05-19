using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Auth;
using SuperChess.Api.DTOs.Auth;
using SuperChess.Api.Entities;

namespace SuperChess.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService jwtTokenService,
    IWebHostEnvironment environment) : ControllerBase
{
    private const string RefreshTokenCookieName = "superchess_refresh";

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var displayName = request.DisplayName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (displayName.Length < 2)
            return BadRequest("Display name must be at least 2 characters.");

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest("Email is required.");

        if (request.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters.");

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = displayName,
            CreatedAtUtc = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        return await CreateAuthResponseAsync(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Unauthorized("Invalid email or password.");

        var result = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: false
        );

        if (!result.Succeeded)
            return Unauthorized("Invalid email or password.");

        return await CreateAuthResponseAsync(user);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        if (!Request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            ClearRefreshTokenCookie();
            return Unauthorized("Refresh session is missing.");
        }

        var refreshTokenHash = jwtTokenService.HashRefreshToken(refreshToken);
        var user = await userManager.Users.FirstOrDefaultAsync(x =>
            x.RefreshTokenHash == refreshTokenHash);

        if (user is null ||
            user.RefreshTokenExpiresAtUtc is null ||
            user.RefreshTokenExpiresAtUtc <= DateTime.UtcNow)
        {
            ClearRefreshTokenCookie();
            return Unauthorized("Refresh session has expired.");
        }

        return await CreateAuthResponseAsync(user);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) &&
            !string.IsNullOrWhiteSpace(refreshToken))
        {
            var refreshTokenHash = jwtTokenService.HashRefreshToken(refreshToken);
            var user = await userManager.Users.FirstOrDefaultAsync(x =>
                x.RefreshTokenHash == refreshTokenHash);

            if (user is not null)
            {
                user.RefreshTokenHash = null;
                user.RefreshTokenExpiresAtUtc = null;
                await userManager.UpdateAsync(user);
            }
        }

        ClearRefreshTokenCookie();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me()
    {
        var user = await userManager.GetUserAsync(User);

        if (user is null)
            return Unauthorized();

        return ToCurrentUserResponse(user);
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(ApplicationUser user)
    {
        var refreshToken = jwtTokenService.CreateRefreshToken();
        var refreshTokenExpiry = jwtTokenService.GetRefreshTokenExpiryUtc();

        user.RefreshTokenHash = jwtTokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc = refreshTokenExpiry;

        await userManager.UpdateAsync(user);
        AppendRefreshTokenCookie(refreshToken, refreshTokenExpiry);

        return new AuthResponse
        {
            AccessToken = jwtTokenService.CreateAccessToken(user),
            User = ToCurrentUserResponse(user)
        };
    }

    private void AppendRefreshTokenCookie(string refreshToken, DateTime expiresAtUtc)
    {
        Response.Cookies.Append(
            RefreshTokenCookieName,
            refreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !environment.IsDevelopment(),
                SameSite = environment.IsDevelopment()
                    ? SameSiteMode.Lax
                    : SameSiteMode.None,
                Expires = expiresAtUtc,
                Path = "/api/auth"
            });
    }

    private void ClearRefreshTokenCookie()
    {
        Response.Cookies.Delete(
            RefreshTokenCookieName,
            new CookieOptions
            {
                Secure = !environment.IsDevelopment(),
                SameSite = environment.IsDevelopment()
                    ? SameSiteMode.Lax
                    : SameSiteMode.None,
                Path = "/api/auth"
            });
    }

    private static CurrentUserResponse ToCurrentUserResponse(ApplicationUser user)
    {
        return new CurrentUserResponse
        {
            Id = user.Id.ToString(),
            DisplayName = user.DisplayName,
            Email = user.Email ?? string.Empty,
            LastGameSettings = new UserGameSettingsResponse
            {
                InitialMinutes = user.LastInitialMinutes,
                IncrementSeconds = user.LastIncrementSeconds,
                IsRated = user.LastIsRated,
                GameMode = user.LastGameMode
            }
        };
    }
}
