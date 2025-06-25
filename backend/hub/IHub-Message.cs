

using Server_chat.Domain.enities;

namespace Server_chat.hub
{
    public interface IHub_Message
    {
        Task Message(string message);
        Task NotificationSystem(string connectionId, string message);
        Task SendPublicSystem(string message);
        Task UpdateConnections(IEnumerable<User> users);
        Task sync(Guid idChat);

    }
}
