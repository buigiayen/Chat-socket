using MediatR;
using Microsoft.AspNetCore.SignalR;
using Server_chat.hub;


namespace Server_chat.apis.services
{

    public class MessageServices(IMediator mediator)
    {
        public IMediator Mediator { get; set; } = mediator;
      
    }
}
