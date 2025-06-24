using AutoMapper;
using Server_chat.vm.user;

namespace Server_chat.mapper
{
    public class map : Profile
    {
        public map()
        {
            CreateMap<Server_chat.Domain.enities.User, UserResponse>();
        }
    }
}
