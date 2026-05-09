using Microsoft.AspNetCore.SignalR;
using SuperChess.Api.Contracts.Games;

namespace SuperChess.Api.Realtime;

public sealed class SignalRGameNotifier : IGameNotifier
{
    private readonly IHubContext<GameHub> _hub;

    public SignalRGameNotifier(IHubContext<GameHub> hub) => _hub = hub;

    public Task NotifyOpenGamesChangedAsync(IReadOnlyList<GameResponse> games) =>
        _hub.Clients.All.SendAsync("OpenGamesChanged", games);

    public Task NotifyPlayerJoinedAsync(Guid gameId, GameResponse game) =>
        _hub.Clients.Group($"game:{gameId}").SendAsync("PlayerJoined", game);

    public Task NotifyMovePlayedAsync(Guid gameId, GameResponse game) =>
        _hub.Clients.Group($"game:{gameId}").SendAsync("MovePlayed", game);
}