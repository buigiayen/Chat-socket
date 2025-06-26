using MediatR;

namespace Server_chat.vm.message
{
    public class SendMessageRequest : IRequest
    {
        public Guid user { get; set; }
        public string message { get; set; }
    }
}
