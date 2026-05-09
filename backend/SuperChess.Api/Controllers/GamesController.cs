using Microsoft.AspNetCore.Mvc;
using SuperChess.Api.Common;
using SuperChess.Api.Common.Errors;
using SuperChess.Api.Contracts.Games;
using SuperChess.Api.Services.Games;

namespace SuperChess.Api.Controllers;

[ApiController]
[Route("games")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;

    public GamesController(IGameService gameService) => _gameService = gameService;

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateGameRequest request, CancellationToken ct)
    {
        var result = await _gameService.CreateGameAsync(request, ct);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { gameId = result.Value!.Game.Id }, result.Value)
            : ToActionResult(result);
    }

    [HttpGet("{gameId:guid}")]
    public async Task<IActionResult> GetById(Guid gameId, CancellationToken ct) =>
        ToActionResult(await _gameService.GetGameAsync(gameId, ct));

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await _gameService.GetGamesAsync(ct));

    [HttpPost("{gameId:guid}/join")]
    public async Task<IActionResult> Join(
        Guid gameId, [FromBody] JoinGameRequest request, CancellationToken ct) =>
        ToActionResult(await _gameService.JoinGameAsync(gameId, request, ct));

    [HttpPost("{gameId:guid}/move")]
    public async Task<IActionResult> MakeMove(
        Guid gameId, [FromBody] MakeMoveRequest request, CancellationToken ct) =>
        ToActionResult(await _gameService.MakeMoveAsync(gameId, request, ct));

    private IActionResult ToActionResult<T>(Result<T> result) => result.Kind switch
    {
        ErrorKind.None       => Ok(result.Value),
        ErrorKind.NotFound   => NotFound(new { message = result.Error }),
        ErrorKind.Validation => BadRequest(new { message = result.Error }),
        ErrorKind.Conflict   => Conflict(new { message = result.Error }),
        ErrorKind.Forbidden  => StatusCode(403, new { message = result.Error }),
        _                    => StatusCode(500)
    };
}
