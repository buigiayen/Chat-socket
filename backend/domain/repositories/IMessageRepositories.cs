using Server_chat.Domain.enities;

namespace Server_chat.domain.repositories
{
    public interface IMessageRepositories
    {
        Task<bool> UpdateMessageStatusAsync(Guid FromUser, Guid ToUser, bool isRead);
        Task<bool> InsertMessage(message message);
        Task<IEnumerable<message>> MessageUser(Guid FromID, Guid ToID, DateTime FromTimeStamp, DateTime ToTimeStamp);
    }

}
