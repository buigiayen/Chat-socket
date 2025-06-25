namespace Server_chat.vm.authentication.meet
{
    public record class AuthenticationResponse
    {

        public string status { get; set; }
        public string message { get; set; }
        public JWTMeet UserInfo { get; set; }
        public int code { get; set; }
        public string token { get; set; }
    }

    public class JWTMeet
    {
        public Guid userID { get; set; }
        public string sub { get; set; }
        public string iss { get; set; }
        public string aud { get; set; }
        public int iat { get; set; }
        public int exp { get; set; }
        public User data { get; set; }
    }

    public class User
    {
        public string user_id { get; set; }
        public string id { get; set; }
        public string identification { get; set; }
        public string name { get; set; }
    }

}
