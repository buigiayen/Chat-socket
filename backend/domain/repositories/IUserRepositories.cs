using Server_chat.Domain.enities;


namespace Server_chat.domain.repositories
{
    public interface IUserRepositories
    {
        public Task<User> AddUserAsync(User user);
        public Task<bool> IsUserStateAsync(Guid UserID, string SocketID, bool Connection);
        public Task<string?> GetConnectionIdAsync(Guid UserID);
        public Task<User> GetUserMeet(string UserIDMeet);
        public Task<IEnumerable<User>> GetAllConnectedUserByCenterIDAsync(string CenterID, Guid? UserNotIn);
        public Task<Guid?> SyncUser(User user);
      
    }
}
