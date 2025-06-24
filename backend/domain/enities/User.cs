namespace Server_chat.Domain.enities
{
    public record class User
    {
        public Guid UserID { get; set; } // Id của người dùng
        public string Name { get; set; } // Tên người dùng
        public bool isOnline   { get; set; } // Trạng thái trực tuyến hay ngoại tuyến
        public bool isActive { get; set; } // Bị khoá hay không
        public string CenterID { get; set; } // Mã trung tâm người dùng
        public string SocketID { get; set; } // socket id của người dùng

    }
}
