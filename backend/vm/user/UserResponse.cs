namespace Server_chat.vm.user
{
    public sealed class UserResponse
    {
        /// <summary>
        /// Id của người nhận tin nhắn
        /// </summary>
        public Guid UserID { get; set; }
        /// <summary>
        /// userame của người dùng
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Trạng thái trực tuyến hay ngoại tuyến
        /// </summary>
        public bool isOnline { get; set; }

        /// <summary>
        ///  Id của trung tâm người dùng, nếu có
        /// </summary>
        public string CenterID {  get; set; }

        /// <summary>
        ///  Id socket của người dùng, nếu có
        /// </summary>
        public string SocketID { get; set; } 
    }
}
