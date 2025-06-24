
namespace Server_chat.domain.repositories
{
    public interface IAppRepositories
    {
        Task<bool> AuthenticationAppID (string appID, string appSecret);
    }
}
