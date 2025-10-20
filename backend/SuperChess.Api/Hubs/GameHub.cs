using Microsoft.AspNetCore.SignalR;

namespace SuperChess.Api.Hubs;

public class GameHub : Hub
{
    // Joins a game room for real-time updates
    // Called from client on game load/join
    public async Task JoinGame(int gameId, string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Game_{gameId}");
        await Clients.Caller.SendAsync("Joined", new { GameId = gameId });
    }

    // Leaves a game room
    // Called on game end or disconnect
    public async Task LeaveGame(int gameId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Game_{gameId}");
        await Clients.Caller.SendAsync("Left", new { GameId = gameId });
    }

    // Sends a chat message to the game room
    public async Task SendChatMessage(int gameId, string message)
    {
        await Clients.Group($"Game_{gameId}").SendAsync("ChatMessage", new
        {
            UserId = Context.UserIdentifier,  // From JWT if auth added
            Message = message,
            Timestamp = DateTimeOffset.UtcNow
        });
    }

    /// Override for connection events - log, disconnect
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Optional: Notify game group of disconnect
        await base.OnDisconnectedAsync(exception);
    }
}