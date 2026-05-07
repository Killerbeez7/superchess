using SuperChess.Api.Contracts.Games;

namespace SuperChess.Api.Services.Games;

public interface IGameService
{
    Task<GameResponse> CreateGameAsync(CreateGameRequest request);
    Task<GameResponse?> GetGameAsync(Guid gameId);
    Task<GameResponse?> JoinGameAsync(Guid gameId, JoinGameRequest request);
}
