namespace Server_chat.domain.repositories
{
    public interface ICurrenUserRepositories
    {
        Task<Guid?> GetCurrentUserIDAsync();
        Task<(Guid?, string)> GetCurrentUserSocketAsync();
        Task<string> GetTokenAsync();
    }
}
