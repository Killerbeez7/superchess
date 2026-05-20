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
[Route("api/games")]
public class GamesController(IGameService gameService) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<GameSessionResponse>> CreateGame(
        CreateGameRequest request,
        CancellationToken ct)
    {
        var currentUser = GetAuthenticatedGameUser();
        if (currentUser is null)
        {
            return Unauthorized("Authentication is required.");
        }

        var result = await gameService.CreateGameAsync(currentUser, request, ct);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpPost("ai")]
    public async Task<ActionResult<GameSessionResponse>> CreateAiGame(
        CreateBotGameRequest request,
        CancellationToken ct)
    {
        var currentUser = GetAuthenticatedGameUser();
        if (currentUser is null)
        {
            return Unauthorized("Authentication is required.");
        }

        var result = await gameService.CreateBotGameAsync(currentUser, request, ct);
        return ToActionResult(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<GameResponse>>> GetGames(CancellationToken ct)
    {
        var games = await gameService.GetGamesAsync(ct);
        return Ok(games);
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<ActionResult<List<GameHistoryResponse>>> GetGameHistory(
        CancellationToken ct)
    {
        var currentUser = GetAuthenticatedGameUser();
        if (currentUser is null)
        {
            return Unauthorized("Authentication is required.");
        }

        var games = await gameService.GetGameHistoryAsync(currentUser, ct);
        return Ok(games);
    }

    [Authorize]
    [HttpGet("stats")]
    public async Task<ActionResult<GameStatsResponse>> GetGameStats(
        CancellationToken ct)
    {
        var currentUser = GetAuthenticatedGameUser();
        if (currentUser is null)
        {
            return Unauthorized("Authentication is required.");
        }

        var stats = await gameService.GetGameStatsAsync(currentUser, ct);
        return Ok(stats);
    }

    [HttpGet("{gameId:guid}")]
    public async Task<ActionResult<GameResponse>> GetGame(
        Guid gameId,
        CancellationToken ct)
    {
        var result = await gameService.GetGameAsync(gameId, ct);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpPost("{gameId:guid}/join")]
    public async Task<ActionResult<GameSessionResponse>> JoinGame(
        Guid gameId,
        JoinGameRequest request,
        CancellationToken ct)
    {
        var currentUser = GetAuthenticatedGameUser();
        if (currentUser is null)
        {
            return Unauthorized("Authentication is required.");
        }

        var result = await gameService.JoinGameAsync(gameId, currentUser, request, ct);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpPost("{gameId:guid}/moves")]
    public async Task<ActionResult<GameResponse>> MakeMove(
        Guid gameId,
        MakeMoveRequest request,
        CancellationToken ct)
    {
        var currentUser = GetAuthenticatedGameUser();
        if (currentUser is null)
        {
            return Unauthorized("Authentication is required.");
        }

        var result = await gameService.MakeMoveAsync(gameId, currentUser, request, ct);
        return ToActionResult(result);
    }

    private AuthenticatedGameUser? GetAuthenticatedGameUser()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return null;
        }

        var displayName =
            User.FindFirstValue("displayName") ??
            User.FindFirstValue(ClaimTypes.Name) ??
            User.FindFirstValue(ClaimTypes.Email) ??
            "Player";

        return new AuthenticatedGameUser(userId, displayName);
    }

    private ActionResult<T> ToActionResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        return result.Kind switch
        {
            ErrorKind.NotFound => NotFound(new { message = result.Error }),
            ErrorKind.Validation => BadRequest(new { message = result.Error }),
            ErrorKind.Conflict => Conflict(new { message = result.Error }),
            ErrorKind.Forbidden => StatusCode(403, new { message = result.Error }),
            _ => BadRequest(new { message = result.Error })
        };
    }
}
