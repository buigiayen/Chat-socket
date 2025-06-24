using MediatR;


namespace Server_chat.apis.services
{
  
    public class UserServices(IMediator mediator)
    {
        public IMediator Mediator { get; set; } = mediator;

    }
}
