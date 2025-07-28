using Server_chat.Domain.enities;
using Server_chat.vm.user;

namespace Server_chat.domain.repositories
{
    public interface ICurrenUserRepositories
    {
        Task<Guid?> GetCurrentUserIDAsync();
        Task<UserResponse> GetCurrentUserSocketAsync();
        Task<string> GetTokenAsync();
    }
}
