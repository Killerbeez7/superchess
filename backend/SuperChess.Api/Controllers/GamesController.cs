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
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateGameRequest request, CancellationToken ct)
    {
        var result = await gameService.CreateGameAsync(request, ct);
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

    [HttpPost("{gameId:guid}/join")]
    public async Task<IActionResult> Join(
        Guid gameId, [FromBody] JoinGameRequest request, CancellationToken ct) =>
        ToActionResult(await gameService.JoinGameAsync(gameId, request, ct));

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
}
