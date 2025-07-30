using Dapper;
using Server_chat.domain.repositories;
using Server_chat.Domain.enities;
using System.Data;

namespace Server_chat.domain.Handler
{
    public class UserRepositories(IDbConnection dbConnection) : IUserRepositories
    {
        public async Task<User> AddUserAsync(User user)
        {
            throw new NotImplementedException();
        }
        public async Task<bool> IsUserStateAsync(Guid UserID, string SocketID, bool Connection)
        {
            string sql = "update  [User] set isOnline=@isOnline, SocketID=@SocketID WHERE UserID = @UserID";
            return await dbConnection.ExecuteAsync(sql, new { UserID = UserID, SocketID = SocketID, isOnline = Connection }) > 0 ? true : false;
        }
        public async Task<string?> GetConnectionIdAsync(Guid UserID)
        {
            string sql = "SELECT top 1 SocketID FROM [User] WHERE UserID = @UserID";
            var query = await dbConnection.QueryFirstOrDefaultAsync<User>(sql, new { UserID = UserID }) ?? null;
            return query?.SocketID ?? string.Empty;
        }
        public async Task<IEnumerable<User>> GetAllConnectedUserByCenterIDAsync(string CenterID, Guid? UserNotIn)
        {
            string checkCountIsRead = "(select count(message.messageID) from [dbo].[message] where FromUser = u.UserID  and ToUser = @UserNotIn and IsRead = 0 and IsRead = 0 )";

            string sql = $"SELECT u.*, {checkCountIsRead} IsNotRead FROM [User] u WHERE CenterID = @CenterID ";
            if (UserNotIn.HasValue) { sql += " and [UserID] <> @UserNotIn"; }
             sql += " order by isOnline desc";
            var query =     await dbConnection.QueryAsync<User>(sql, new { CenterID = CenterID, UserNotIn = UserNotIn });
            return query;
        }
    
        public async Task<Guid?> SyncUser(User user)
        {
            Guid? newID = Guid.NewGuid();
            string sql = $@" DECLARE @ID UNIQUEIDENTIFIER
                            SET @ID = '{newID}'; -- Tạo một ID mới mặc định

                            DECLARE @Result UNIQUEIDENTIFIER;

                            IF EXISTS (
                                SELECT 1
                                FROM [dbo].[User]
                                WHERE UserMeet = @UserMeet
                            )
                            BEGIN
                                SELECT @ID = UserID
                                FROM [dbo].[User]
                                WHERE UserMeet = @UserMeet
                            END
                            ELSE
                            BEGIN
                                INSERT INTO [dbo].[User] (UserID, [Name], [CenterID], [UserMeet],[Image])
                                VALUES (@ID, @Name, @CenterID, @UserMeet,@Image)
                            END

                            SELECT @ID AS Result;";
            var Prase = await dbConnection.ExecuteScalarAsync<Guid?>(sql, user);
            return Prase;
        }

        public async Task<User?> GetUserMeet(string UserIDMeet)
        {
            string sql = "SELECT * FROM [User] WHERE UserMeet = @UserIDMeet";
            var query = await dbConnection.QueryFirstOrDefaultAsync<User>(sql, new { UserIDMeet = UserIDMeet });
            return query;
        }

       
    }

}
