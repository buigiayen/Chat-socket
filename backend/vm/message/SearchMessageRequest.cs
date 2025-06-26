

using MediatR;

namespace Server_chat.vm.message
{
    public sealed class SearchMessageRequest : IRequest<IEnumerable<SearchMessageResponse>>
    {
        public Guid ToUser { get; set; }
        public DateTime? timeRanger { get; set; } 
    }
}
