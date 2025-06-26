using MediatR;
using Server_chat.domain.repositories;


namespace Server_chat.apis.services
{

    public class UserServices(IMediator mediator, ICurrenUserRepositories currenUserRepositories)
    {
        public IMediator Mediator { get; set; } = mediator;
        public ICurrenUserRepositories CurrenUserRepositories { get; set; } = currenUserRepositories;

    }
}
