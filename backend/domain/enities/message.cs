namespace Server_chat.Domain.enities
{
    public class message
    {
        public Guid messageID { get; set; } // Id của tin nhắn
        public DateTime Timestamp { get; set; } // Thời gian gửi tin nhắn
        public bool IsRead { get; set; } // Trạng thái đã đọc hay chưa
        public Guid ToUser { get; set; } // Id của người nhận tin nhắn
        public Guid FromUser { get; set; } // Id của người gửi tin nhắn
        public string MessageText {  get; set; }
        
    }
}
