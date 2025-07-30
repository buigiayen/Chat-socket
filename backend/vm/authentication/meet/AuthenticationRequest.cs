using MediatR;

namespace Server_chat.vm.authentication.meet
{
    public class TokenRequest(string token) : IRequest<AuthenticationResponse>
    {
        public string Token { get; set; } = token ?? string.Empty;
    }
    public class AuthenticationRequest : IRequest<AuthenticationResponse>
    {
        public string code { get; set; }
        public string password { get; set; }
    }
    public class SyncUser
    {
        public string Name { get; set; } // Tên người dùng
        public string CenterID { get; set; } // Mã trung tâm người dùng
        public int UserMeet { get; set; } // socket id của người dùng
        public string ImageUrl { get; set; }
    }
}
