using AutoMapper;
using MediatR;
using Server_chat.domain.repositories;

namespace Server_chat.vm.message
{
    public class MessageHandle(IMessageRepositories messageRepositories, IMapper mapper, ILogger<MessageHandle> Logger) : IRequestHandler<MessageRequest, IEnumerable<MessageResponse>>
    {
        public async Task<IEnumerable<MessageResponse>> Handle(MessageRequest request, CancellationToken cancellationToken)
        {
            if (!request.timeRanger.HasValue) { request.timeRanger = DateTime.Now; }
            var Data = await messageRepositories.MessageUser(request.FromUser, request.ToUser, request.timeRanger.Value.Date, request.timeRanger.Value.AddDays(1).Date);
            var map = mapper.Map<IEnumerable<MessageResponse>>(Data);
            return map;
        }
    }
}
