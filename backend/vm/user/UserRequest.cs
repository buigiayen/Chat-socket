

using MediatR;

namespace Server_chat.vm.user
{
    public  class UserRequest : IRequest<IEnumerable<UserResponse>>
    {
        public string centerID { get; set; }
        public DateTime? Timestamp { get; set; } // Thời gian gửi yêu cầu
        public Guid? CurrenID { get; set; } // Thời gian gửi yêu cầu
    }
}
