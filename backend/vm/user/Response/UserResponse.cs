namespace Server_chat.vm.user.Response
{
    public sealed class UserResponse
    {
        /// <summary>
        /// Id của người nhận tin nhắn
        /// </summary>
        public Guid idUser { get; set; }
        /// <summary>
        /// userame của người dùng
        /// </summary>
        public string UserName { get; set; }
        /// <summary>
        /// Trạng thái trực tuyến hay ngoại tuyến
        /// </summary>
        public bool isOnline { get; set; } 
    }
}
