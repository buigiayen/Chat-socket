using MediatR;

namespace Server_chat.vm.authentication.meet
{
    public class AuthenticationRequest : IRequest<AuthenticationResponse>
    {
        public string code { get; set; }
        public string username { get; set; }
        public string password { get; set; }
    }
}
