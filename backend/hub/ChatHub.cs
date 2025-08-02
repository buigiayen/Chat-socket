using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Server_chat.domain.repositories;
using Server_chat.extensions.notification;
using Server_chat.hub;
using Server_chat.vm.authentication.meet;
using Server_chat.vm.message;
using Server_chat.vm.user;
using System.Collections.Concurrent;


public class ChatHub(
    ILogger<ChatHub> logger, ICurrenUserRepositories currenUserRepositories,
    IUserRepositories userRepositories,
    IMessageRepositories MessageRepositories,
    IMapper mapper) : Hub<IHub_Message>
{
    private static ConcurrentDictionary<string, Guid> _connections = new();
    public override async Task OnConnectedAsync()
    {
        try
        {
            var connectionId = Context.ConnectionId;
            var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
            if (currenUser != null && currenUser.UserID.HasValue)
            {
                logger.LogDebug("Update user from contextid. Set state is online");
                string message = string.Empty;
                if (await userRepositories.IsUserStateAsync(currenUser.UserID.Value, Context.ConnectionId, true))
                {
                    message = string.Format(HubNotification.SendNotificationStartMessage, currenUser.Name, Context.ConnectionId, currenUser.CenterID);
                    await Groups.AddToGroupAsync(connectionId, currenUser.CenterID);
                    logger.LogDebug(message);
                    await Clients.Group(currenUser.CenterID).NotificationSystem(connectionId, currenUser, message);
                    _connections.TryAdd(Context.ConnectionId, currenUser.UserID.Value);
                    await base.OnConnectedAsync();
                }
            }

        }
        catch (Exception ex)
        {
            base.OnDisconnectedAsync(ex);
        }
    }
    public async Task GetUserChat(string UserMeet)
    {
        var connectionId = Context.ConnectionId;
        var User = await userRepositories.GetUserMeet(UserMeet);
        var map = mapper.Map<UserResponse>(User);
        await Clients.Client(connectionId).SendUserMeet(map);
    }
    public async Task SyncUser(SyncUser user)
    {
        var connectionId = Context.ConnectionId;
        var guid = await userRepositories.SyncUser(new Server_chat.Domain.enities.User
        {
            CenterID = user.CenterID,
            Name = user.Name,
            UserMeet = user.UserMeet,
            Image = user.ImageUrl ?? "https://img.icons8.com/material/344/user-male-circle--v1.png",
            TypeUser = user.TypeUser,
        });
        await Clients.Client(connectionId).sync(guid.Value, user.UserMeet);
    }
    public async Task SendPrivateMessage(Guid user, string message)
    {
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        string toID = await userRepositories.GetConnectionIdAsync(user);
        await MessageRepositories.InsertMessage(new Server_chat.Domain.enities.message { ToUser = user, FromUser = currenUser.UserID.Value, MessageText = message });
        await Clients.Client(toID).Message(currenUser.UserID, message);
    }
    public async Task SendNotificationMessage()
    {
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        string message = string.Format(HubNotification.SendNotificationStartMessage, currenUser.SocketID);
        await Clients.All.NotificationSystem(connectionId, currenUser, message);
    }
    public async Task GetConnections(string CenterCode)
    {
        var connectionIDs = _connections.Keys.ToList();
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        var socketsID = await userRepositories.GetAllConnectedUserByCenterIDAsync(CenterCode, currenUser.UserID);
        var connectionId = Clients.All.UpdateConnections(socketsID);
    }
    public async Task GetHistoryMessage(Guid ToUser, DateTime? DateRange)
    {
        if (!DateRange.HasValue)
        {
            DateRange = DateTime.Now;
        }
        var connectionId = Context.ConnectionId;
        var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
        var message = await MessageRepositories.MessageUser(currenUser.UserID.Value, ToUser, DateRange.Value.AddDays(-350).Date, DateRange.Value.AddDays(1).Date);
        await MessageRepositories.UpdateMessageStatusAsync(currenUser.UserID.Value, ToUser, true);
        var map = mapper.Map<IEnumerable<SearchMessageResponse>>(message);
        await Clients.Client(connectionId).GetHistoryMessage(map);
    }
    public override async Task OnDisconnectedAsync(Exception? exception = null)
    {
        if (exception == null)
        {
            var connectionId = Context.ConnectionId;
            var currenUser = await currenUserRepositories.GetCurrentUserSocketAsync();
            if (currenUser != null && currenUser.UserID.HasValue)
            {
                string message = string.Format(HubNotification.SendNotificationOffMessage, currenUser);
                if (currenUser.UserID.HasValue)
                {
                    await userRepositories.IsUserStateAsync(currenUser.UserID.Value, connectionId, false);
                    await Clients.Group(currenUser.CenterID).Disconnection(Context.ConnectionId);
                    _connections.TryRemove(Context.ConnectionId, out _);
                    await base.OnDisconnectedAsync(exception);
                }
            }
        }


    }
}