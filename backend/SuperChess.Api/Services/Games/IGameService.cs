using SuperChess.Api.Common;
using SuperChess.Api.Contracts.Games;

namespace SuperChess.Api.Services.Games;

public interface IGameService
{
    Task<List<GameResponse>> GetGamesAsync(CancellationToken ct = default);
    Task<Result<GameResponse>> GetGameAsync(Guid gameId, CancellationToken ct = default);
    Task<Result<GameSessionResponse>> CreateGameAsync(CreateGameRequest request, CancellationToken ct = default);
    Task<Result<GameSessionResponse>> JoinGameAsync(Guid gameId, JoinGameRequest request, CancellationToken ct = default);
    Task<Result<GameResponse>> MakeMoveAsync(Guid gameId, MakeMoveRequest request, CancellationToken ct = default);
}
