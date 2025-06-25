using Dapper;
using Server_chat.domain.repositories;
using Server_chat.Domain.enities;
using System.Data;
using System.Net.Sockets;


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
        public async Task<IEnumerable<User>> GetAllConnectedUserByCenterIDAsync(string CenterID)
        {
            string sql = "SELECT * FROM [User] WHERE CenterID = @CenterID";
            var query = await dbConnection.QueryAsync<User>(sql, new { CenterID = CenterID });
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
                                INSERT INTO [dbo].[User] (UserID, [Name], [CenterID], [UserMeet])
                                VALUES (@ID, @Name, @CenterID, @UserMeet)
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
