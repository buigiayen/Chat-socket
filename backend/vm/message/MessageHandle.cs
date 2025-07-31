using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Server_chat.domain.Handler;
using Server_chat.domain.repositories;

namespace Server_chat.vm.message
{
    public class MessageHandle(IMessageRepositories messageRepositories,
        IMapper mapper,
        ICurrenUserRepositories currenUserRepositories,
        ILogger<MessageHandle> Logger) :
        IRequestHandler<SearchMessageRequest, IEnumerable<SearchMessageResponse>>,
        IRequestHandler<SendMessageRequest>

    {
        public async Task<IEnumerable<SearchMessageResponse>> Handle(SearchMessageRequest request, CancellationToken cancellationToken)
        {
            var currenID = await currenUserRepositories.GetCurrentUserIDAsync();
            await messageRepositories.UpdateMessageStatusAsync(currenID.Value, request.ToUser, true);
            if (!request.timeRanger.HasValue) { request.timeRanger = DateTime.Now; }
            var Data = await messageRepositories.MessageUser(currenID.Value, request.ToUser, request.timeRanger.Value.AddDays(-7).Date, request.timeRanger.Value.AddDays(+1).Date);
            var map = mapper.Map<IEnumerable<SearchMessageResponse>>(Data);
            return map;
        }

        public async Task Handle(SendMessageRequest request, CancellationToken cancellationToken)
        {
            var currenID = await currenUserRepositories.GetCurrentUserIDAsync();
            await messageRepositories.InsertMessage(new Domain.enities.message
            {
                FromUser = currenID.Value,
                ToUser = request.user,
                IsRead = false,
                MessageText = request.message,

            }).ConfigureAwait(false);

        }
    }
}
