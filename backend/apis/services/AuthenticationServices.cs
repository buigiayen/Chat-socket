using MediatR;


namespace Server_chat.apis.services
{
  
    public class AuthenticationServices(IMediator mediator)
    {
        public IMediator Mediator { get; set; } = mediator;

    }
}
