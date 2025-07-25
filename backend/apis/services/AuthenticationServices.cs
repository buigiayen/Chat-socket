using MediatR;
using Server_chat.domain.Handler;
using Server_chat.domain.repositories;


namespace Server_chat.apis.services
{

    public class AuthenticationServices(IMediator mediator, ICurrenUserRepositories currenUserRepositories)
    {
        public IMediator Mediator { get; set; } = mediator;
        public ICurrenUserRepositories CurrenUserRepositories { get; set; } = currenUserRepositories;

    }
}
