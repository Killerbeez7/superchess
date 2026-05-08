using Microsoft.AspNetCore.Mvc;
using SuperChess.Api.Contracts.Games;
using SuperChess.Api.Services.Games;

namespace SuperChess.Api.Controllers;

[ApiController]
[Route("games")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;

    public GamesController(IGameService gameService)
    {
        _gameService = gameService;
    }

    // Create game
    [HttpPost]
    public async Task<ActionResult<GameResponse>> Create([FromBody] CreateGameRequest request)
    {
        try
        {
            var game = await _gameService.CreateGameAsync(request);
            return CreatedAtAction(nameof(GetById), new { gameId = game.Id }, game);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Get game
    [HttpGet("{gameId:guid}")]
    public async Task<ActionResult<GameResponse>> GetById(Guid gameId)
    {
        var game = await _gameService.GetGameAsync(gameId);

        if (game is null)
        {
            return NotFound();
        }

        return Ok(game);
    }

    // Get games list
    [HttpGet]
    public async Task<ActionResult<List<GameResponse>>> GetAll()
    {
        var games = await _gameService.GetGamesAsync();
        return Ok(games);
    }

    // Joing game
    [HttpPost("{gameId:guid}/join")]
    public async Task<ActionResult<GameResponse>> Join(Guid gameId, [FromBody] JoinGameRequest request)
    {
        try
        {
            var game = await _gameService.JoinGameAsync(gameId, request);

            if (game is null)
            {
                return NotFound();
            }

            return Ok(game);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // Make a move
    [HttpPost("{gameId:guid}/move")]
    public async Task<ActionResult<GameResponse>> MakeMove(
        Guid gameId,
        [FromBody] MakeMoveRequest request)
    {
        try
        {
            var game = await _gameService.MakeMoveAsync(gameId, request);

            if (game is null)
            {
                return NotFound();
            }

            return Ok(game);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
};