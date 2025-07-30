using Dapper;
using Server_chat.domain.repositories;
using Server_chat.Domain.enities;
using System.Data;

namespace Server_chat.domain.Handler
{
    public class MessageRepositories(IDbConnection dbConnection) : IMessageRepositories
    {
        
        public async Task<bool> InsertMessage(message message)
        {
            string sql = "insert message (ToUser, FromUser, MessageText) values (@ToUser,@FromUser, @MessageText)";
            return await dbConnection.ExecuteAsync(sql, message) > 0 ? true : false;
        }

        public async Task<IEnumerable<message>> MessageUser(Guid FromID, Guid ToID, DateTime FromTimeStamp, DateTime ToTimeStamp)
        {
            string sql = @"select   m.messageID, m.MessageText, m.Timestamp , m.IsRead , m.FromUser from [dbo].[message] m
                            where ((m.FromUser=@FromUser and m.ToUser=@ToUser) or (m.FromUser=@ToUser and m.ToUser=@FromUser)) and m.Timestamp between @FromTimeStamp and @ToTimeStamp
                            order by  m.Timestamp asc;";

            return await dbConnection.QueryAsync<message>(sql, new { FromUser = FromID, ToUser = ToID, FromTimeStamp = FromTimeStamp, ToTimeStamp = ToTimeStamp });
        }

        public async Task<bool> UpdateMessageStatusAsync(Guid FromUser, Guid ToUser, bool isRead)
        {
            string sql = "update [dbo].[message] set IsRead=1 where (FromUser=@ToUser and ToUser=@FromUser) ";
            return await dbConnection.ExecuteAsync(sql, new { FromUser = FromUser, ToUser = ToUser }) > 0 ? true : false;
        }
    }
}
