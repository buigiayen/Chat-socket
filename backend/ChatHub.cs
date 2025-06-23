using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

public class ChatHub : Hub
{
    private static ConcurrentDictionary<string, bool> _connections = new ();
    public override async Task OnConnectedAsync()
    {
        _connections[Context.ConnectionId] = true;
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public async Task ReciverMessage(string user, string message)
    {
        var connectionId = Context.ConnectionId;
        await Clients.All.SendAsync(connectionId, message);
    }

    public async Task SendPrivateMessage(string user, string message)
    {
        var connectionId = Context.ConnectionId;
        await Clients.Client(user).SendAsync("ReceivedPersonalNotification", connectionId, message);
    }
    public async Task SendPublicMessage(string user, string message)
    {
        var connectionId = Context.ConnectionId;
        await Clients.All.SendAsync("ReceivedPersonalNotification", connectionId, message);
    }

    public async Task SendMessageToGroup(string groupName, string message)
    {
        var connectionId = Context.ConnectionId;
        await Clients.Group(groupName).SendAsync("ReceiveMessage", connectionId, message);
    }
    public async Task GetConnections()
    {
       var connectionIDs = _connections.Keys.ToList();
       var connectionId = Clients.All.SendAsync("UpdateConnections", connectionIDs);

    }
    public override async Task OnDisconnectedAsync(Exception? exception = null)
    {
        _connections.TryRemove(Context.ConnectionId, out _);
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }


}