using Microsoft.AspNetCore.SignalR;

namespace SuperChess.Api.Realtime;

public class GameHub : Hub
{
    public async Task JoinGameRoom(string gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"game:{gameId}");
    }

    public async Task LeaveGameRoom(string gameId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game:{gameId}");
    }
}