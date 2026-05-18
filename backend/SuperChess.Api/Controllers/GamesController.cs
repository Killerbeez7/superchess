using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperChess.Api.Common;
using SuperChess.Api.Common.Errors;
using SuperChess.Api.DTOs.Games;
using SuperChess.Api.Services.Games;

namespace SuperChess.Api.Controllers;

[ApiController]
[Route("games")]
public class GamesController(IGameService gameService) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateGameRequest? request,
        CancellationToken ct)
    {
        var player = GetAuthenticatedPlayer();
        if (player is null)
        {
            return Unauthorized(new { message = "Authenticated user is missing required claims." });
        }

        var result = await gameService.CreateGameAsync(player, request ?? new CreateGameRequest(), ct);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { gameId = result.Value!.Game.Id }, result.Value)
            : ToActionResult(result);
    }

    [HttpGet("{gameId:guid}")]
    public async Task<IActionResult> GetById(Guid gameId, CancellationToken ct) =>
        ToActionResult(await gameService.GetGameAsync(gameId, ct));

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await gameService.GetGamesAsync(ct));

    [Authorize]
    [HttpPost("{gameId:guid}/join")]
    public async Task<IActionResult> Join(
        Guid gameId, [FromBody] JoinGameRequest? request, CancellationToken ct)
    {
        var player = GetAuthenticatedPlayer();
        if (player is null)
        {
            return Unauthorized(new { message = "Authenticated user is missing required claims." });
        }

        return ToActionResult(await gameService.JoinGameAsync(gameId, player, request ?? new JoinGameRequest(), ct));
    }

    [HttpPost("{gameId:guid}/move")]
    public async Task<IActionResult> MakeMove(
        Guid gameId, [FromBody] MakeMoveRequest request, CancellationToken ct) =>
        ToActionResult(await gameService.MakeMoveAsync(gameId, request, ct));

    private IActionResult ToActionResult<T>(Result<T> result) => result.Kind switch
    {
        ErrorKind.None => Ok(result.Value),
        ErrorKind.NotFound => NotFound(new { message = result.Error }),
        ErrorKind.Validation => BadRequest(new { message = result.Error }),
        ErrorKind.Conflict => Conflict(new { message = result.Error }),
        ErrorKind.Forbidden => StatusCode(403, new { message = result.Error }),
        _ => StatusCode(500)
    };

    private AuthenticatedGameUser? GetAuthenticatedPlayer()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var displayName =
            User.FindFirstValue("displayName") ??
            User.FindFirstValue(ClaimTypes.Name);

        return Guid.TryParse(userIdValue, out var userId) &&
               !string.IsNullOrWhiteSpace(displayName)
            ? new AuthenticatedGameUser(userId, displayName.Trim())
            : null;
    }
}
