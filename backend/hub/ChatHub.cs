using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Server_chat.contract;
using Server_chat.domain.repositories;
using Server_chat.hub;
using Server_chat.vm.authentication.meet;
using Server_chat.vm.message;
using System.Collections.Concurrent;


public class ChatHub(ICurrenUserRepositories currenUserRepositories,
    IUserRepositories userRepositories,
    IMessageRepositories MessageRepositories, 
    IMapper mapper) : Hub<IHub_Message>
{
    private static ConcurrentDictionary<string, Guid> _connections = new();
    public override async Task OnConnectedAsync()
    {
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        if (currenUser.Item1.HasValue)
        {
            string message = string.Format(HubMessage.SendNotificationStartMessage, currenUser.Item2);
            await userRepositories.IsUserStateAsync(currenUser.Item1.Value, connectionId, true);
            await Clients.All.NotificationSystem(connectionId, message);
            _connections.TryAdd(Context.ConnectionId, currenUser.Item1.Value);
        }
        await base.OnConnectedAsync();
    }
    public async Task SyncUser(SyncUser user)
    {
        var connectionId = Context.ConnectionId;
        var guid = await userRepositories.SyncUser(new Server_chat.Domain.enities.User
        {
            CenterID = user.CenterID,
            Name = user.Name,
            UserMeet = user.UserMeet,
        });
        await Clients.Client(connectionId).sync(guid.Value);
    }
    public async Task SendPrivateMessage(Guid user, string message)
    {
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        await MessageRepositories.InsertMessage(new Server_chat.Domain.enities.message { ToUser = user, FromUser = currenUser.Item1.Value, MessageText = message });
        string toID = await userRepositories.GetConnectionIdAsync(user);
        await Clients.Client(toID).Message(message);
    }

    public async Task SendNotificationMessage()
    {
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        string message = string.Format(HubMessage.SendNotificationStartMessage, currenUser.Item2);
        await Clients.All.NotificationSystem(connectionId, message);
    }

    public async Task GetConnections(string CenterCode)
    {
        var connectionIDs = _connections.Keys.ToList();
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        var socketsID = await userRepositories.GetAllConnectedUserByCenterIDAsync(CenterCode, currenUser.Item1);
        var connectionId = Clients.All.UpdateConnections(socketsID.Where(p => p.SocketID != null && p.isOnline));
    }
    public async Task GetHistoryMessage(Guid ToUser, DateTime? DateRange)
    {
        if (!DateRange.HasValue)
        {
            DateRange = DateTime.Now;
        }
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        var message = await MessageRepositories.MessageUser(currenUser.Item1.Value, ToUser, DateRange.Value.Date, DateRange.Value.AddDays(1).Date);
        var map = mapper.Map<IEnumerable<SearchMessageResponse>>(message);
        await Clients.Client(connectionId).GetHistoryMessage(map);
    }
    public override async Task OnDisconnectedAsync(Exception? exception = null)
    {
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        string message = string.Format(HubMessage.SendNotificationOffMessage, currenUser);
        await userRepositories.IsUserStateAsync(currenUser.Item1.Value, currenUser.Item2, false);
        _connections.TryRemove(Context.ConnectionId, out _);
        await base.OnDisconnectedAsync(exception);
    }


}