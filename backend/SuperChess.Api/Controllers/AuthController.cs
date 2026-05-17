using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SuperChess.Api.Auth;
using SuperChess.Api.DTOs.Auth;
using SuperChess.Api.Entities;

namespace SuperChess.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService jwtTokenService) : ControllerBase
{
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

        return CreateAuthResponse(user);
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

        return CreateAuthResponse(user);
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

    private AuthResponse CreateAuthResponse(ApplicationUser user)
    {
        return new AuthResponse
        {
            AccessToken = jwtTokenService.CreateAccessToken(user),
            User = ToCurrentUserResponse(user)
        };
    }

    private static CurrentUserResponse ToCurrentUserResponse(ApplicationUser user)
    {
        return new CurrentUserResponse
        {
            Id = user.Id.ToString(),
            DisplayName = user.DisplayName,
            Email = user.Email ?? string.Empty
        };
    }
}
