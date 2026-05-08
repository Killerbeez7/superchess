using SuperChess.Api.Contracts.Games;

namespace SuperChess.Api.Services.Games;

public interface IGameService
{
    Task<List<GameResponse>> GetGamesAsync();
    Task<GameResponse?> GetGameAsync(Guid gameId);
    Task<GameSessionResponse> CreateGameAsync(CreateGameRequest request);
    Task<GameSessionResponse?> JoinGameAsync(Guid gameId, JoinGameRequest request);
    Task<GameResponse?> MakeMoveAsync(Guid gameId, MakeMoveRequest request);
}
