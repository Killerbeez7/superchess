using SuperChess.Api.Common;
using SuperChess.Api.DTOs.Games;

namespace SuperChess.Api.Services.Games;

public interface IGameService
{
    Task<Result<GameSessionResponse>> CreateGameAsync(
        AuthenticatedGameUser player,
        CreateGameRequest request,
        CancellationToken ct = default);

    Task<Result<GameSessionResponse>> CreateBotGameAsync(
        AuthenticatedGameUser player,
        CreateBotGameRequest request,
        CancellationToken ct = default);

    Task<Result<GameResponse>> GetGameAsync(
        Guid gameId,
        CancellationToken ct = default);

    Task<List<GameResponse>> GetGamesAsync(
        CancellationToken ct = default);

    Task<List<GameHistoryResponse>> GetGameHistoryAsync(
        AuthenticatedGameUser player,
        CancellationToken ct = default);

    Task<GameStatsResponse> GetGameStatsAsync(
        AuthenticatedGameUser player,
        CancellationToken ct = default);

    Task<Result<GameSessionResponse>> JoinGameAsync(
        Guid gameId,
        AuthenticatedGameUser player,
        JoinGameRequest request,
        CancellationToken ct = default);

    Task<Result<GameResponse>> MakeMoveAsync(
        Guid gameId,
        AuthenticatedGameUser player,
        MakeMoveRequest request,
        CancellationToken ct = default);
}
