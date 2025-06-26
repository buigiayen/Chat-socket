using AutoMapper;
using MediatR;
using Server_chat.domain.repositories;
using Server_chat.Domain.enities;

namespace Server_chat.vm.user
{
    public class UserHandler(IUserRepositories userRepositories,
        ILogger<UserHandler> logger,
        IMapper mapper) 
        : IRequestHandler<UserRequest, IEnumerable<UserResponse>>
    {
        public async Task<IEnumerable<UserResponse>> Handle(UserRequest request, CancellationToken cancellationToken)
        {
            var reponse = await userRepositories.GetAllConnectedUserByCenterIDAsync(request.centerID.ToString(), request.CurrenID);
            var map = mapper.Map<IEnumerable<UserResponse>>(reponse);
            return map;
        }
    }
}
