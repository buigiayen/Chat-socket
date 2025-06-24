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
            var query = await dbConnection.QueryFirstAsync<User>(sql, new { UserID = UserID });
            return query.SocketID;
        }
        public async Task<IEnumerable<User>> GetAllConnectedUserByCenterIDAsync(string CenterID)
        {
            string sql = "SELECT * FROM [User] WHERE CenterID = @CenterID";
            var query = await dbConnection.QueryAsync<User>(sql, new { CenterID = CenterID });
            return query;

        }
    }

}
