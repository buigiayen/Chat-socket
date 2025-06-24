using Microsoft.AspNetCore.SignalR;
using Server_chat.contract;
using Server_chat.domain.Handler;
using Server_chat.domain.repositories;
using System.Collections.Concurrent;
using System.Collections.Generic;

public class ChatHub(ICurrenUserRepositories currenUserRepositories, IUserRepositories userRepositories, IMessageRepositories MessageRepositories) : Hub
{
    private static ConcurrentDictionary<string, Guid> _connections = new();
    public override async Task OnConnectedAsync()
    {
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserIDAsync();
        if (currenUser.Item1.HasValue)
        {
            string message = string.Format(HubMessage.SendNotificationMessage, currenUser.Item2);
            await userRepositories.IsUserStateAsync(currenUser.Item1.Value, connectionId, true);
            await Clients.All.SendAsync(HubConst.NotificationSystem, connectionId, message);
            _connections.TryAdd(Context.ConnectionId, currenUser.Item1.Value);
        }
        else
        {
            await base.OnDisconnectedAsync(new Exception(AuthenticationMessage.NoAuthentication));
            return;
        }

        await base.OnConnectedAsync();
    }

    public async Task ReciverMessage(string user, string message)
    {
        var connectionId = Context.ConnectionId;
        await Clients.All.SendAsync(connectionId, message);
    }

    public async Task SendPrivateMessage(Guid user, string message)
    {
        var currenUser = await currenUserRepositories.GetCurrentUserIDAsync();
        await MessageRepositories.InsertMessage(new Server_chat.Domain.enities.message { ToUser = user, FromUser = currenUser.Item1.Value, MessageText = message });
        await Clients.Client(user.ToString()).SendAsync(string.Format(HubMessage.SendUserMessage, user), message);
    }
    public async Task SendPublicMessage(string user, string message)
    {
        var connectionId = Context.ConnectionId;
        await Clients.All.SendAsync("ReceivedPersonalNotification", connectionId, message);
    }
    public async Task SendNotificationMessage()
    {
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserIDAsync();
        string message = string.Format(HubMessage.SendNotificationMessage, currenUser.Item2);
        await Clients.All.SendAsync(HubConst.NotificationSystem, connectionId, message);
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
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserIDAsync();
        string message = string.Format(HubMessage.SendNotificationMessage, currenUser);
        await userRepositories.IsUserStateAsync(currenUser.Item1.Value, currenUser.Item2, false);
        _connections.TryRemove(Context.ConnectionId, out _);
        await base.OnDisconnectedAsync(exception);
    }


}