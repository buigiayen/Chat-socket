using MediatR;


namespace Server_chat.apis.services
{
  
    public class MessageServices(IMediator mediator)
    {
        public IMediator Mediator { get; set; } = mediator;

    }
}
