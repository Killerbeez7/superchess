using SuperChess.Api.DTOs.Games;

namespace SuperChess.Api.Realtime;

public interface IGameNotifier
{
    Task NotifyOpenGamesChangedAsync(IReadOnlyList<GameResponse> games);
    Task NotifyPlayerJoinedAsync(Guid gameId, GameResponse game);
    Task NotifyMovePlayedAsync(Guid gameId, GameResponse game);
}
