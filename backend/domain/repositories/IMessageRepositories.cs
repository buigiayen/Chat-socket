using Server_chat.Domain.enities;

namespace Server_chat.domain.repositories
{
    public interface IMessageRepositories
    {
        Task<List<message>> GetAllMessagesByUserAsync(Guid userID);
        Task<List<message>> GetMessageUserID(Guid userID, string centerID);
        Task<bool> UpdateMessageStatusAsync(Guid messageID, bool isRead);
        Task<message?> GetMessageByIdAsync(Guid messageID);
        Task<bool> InsertMessage(message message);
        Task<IEnumerable<message>> MessageUser(Guid FromID, Guid ToID, DateTime FromTimeStamp, DateTime ToTimeStamp);
    }

}
