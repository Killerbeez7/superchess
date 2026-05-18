using Microsoft.AspNetCore.SignalR;

namespace SuperChess.Api.Realtime;

public class GameHub : Hub
{
    private const string LobbyGroupName = "lobby";

    public async Task JoinLobby()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, LobbyGroupName);
    }

    public async Task LeaveLobby()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, LobbyGroupName);
    }

    public async Task JoinGameRoom(string gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"game:{gameId}");
    }

    public async Task LeaveGameRoom(string gameId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game:{gameId}");
    }
}