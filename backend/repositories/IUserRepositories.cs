using Server_chat.vm.user.Response;

namespace Server_chat.repositories
{
    public interface IUserRepositories
    {
        public Task<bool> AddUserAsync(string userName, string connectionId);
        public Task<bool> RemoveUserAsync(string userName, string connectionId);
        public Task<bool> IsUserConnectedAsync(string userName);
        public Task<string?> GetConnectionIdAsync(string userName);
        public Task<List<UserResponse>> GetAllConnectedUsersAsync();

    }
}
