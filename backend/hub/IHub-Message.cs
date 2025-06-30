

using Server_chat.Domain.enities;
using Server_chat.vm.message;
using Server_chat.vm.user;

namespace Server_chat.hub
{
    public interface IHub_Message
    {
        Task Message(string? FromID,string message);
        Task NotificationSystem(string connectionId, string message);
        Task SendPublicSystem(string message);
        Task UpdateConnections(IEnumerable<User> users);
        Task sync(Guid idChat, int userMeet);
        Task GetHistoryMessage(IEnumerable<SearchMessageResponse> messageResponses);
        Task SendUserMeet(UserResponse UserMeet);

    }
}
