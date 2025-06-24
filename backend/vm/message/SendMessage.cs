

using MediatR;

namespace Server_chat.vm.message
{
    public sealed class MessageRequest : IRequest<IEnumerable<MessageResponse>>
    {
        public Guid FromUser { get; set; } // Id của người nhận tin nhắn
        public Guid ToUser { get; set; }
        public DateTime? timeRanger { get; set; } 


    }
}
