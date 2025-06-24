using Dapper;
using Server_chat.domain.repositories;
using Server_chat.Domain.enities;
using System.Data;

namespace Server_chat.domain.Handler
{
    public class MessageRepositories(IDbConnection dbConnection) : IMessageRepositories
    {
        public Task<List<message>> GetAllMessagesByUserAsync(Guid userID)
        {
            throw new NotImplementedException();
        }

        public Task<message?> GetMessageByIdAsync(Guid messageID)
        {
            throw new NotImplementedException();
        }

        public Task<List<message>> GetMessageUserID(Guid userID, string centerID)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> InsertMessage(message message)
        {
            string sql = "insert message (ToUser, FromUser, MessageText) values (@ToUser,@FromUser, @MessageText)";
            return await dbConnection.ExecuteAsync(sql, message) > 0 ? true : false;
        }

        public Task<bool> UpdateMessageStatusAsync(Guid messageID, bool isRead)
        {
            throw new NotImplementedException();
        }
    }
}
