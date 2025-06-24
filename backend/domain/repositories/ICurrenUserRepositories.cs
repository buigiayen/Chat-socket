namespace Server_chat.domain.repositories
{
    public interface ICurrenUserRepositories
    {
        Task<(Guid?, string)> GetCurrentUserIDAsync();
    }
}
