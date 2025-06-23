namespace Server_chat.vm.message.request
{
    public sealed class SendMessage
    {
        public Guid ToUser { get; set; } // Id của người nhận tin nhắn
        public string Message { get; set; } // Nội dung tin nhắn
        public DateTime Timestamp { get; set; } // Thời gian gửi tin nhắn
        public bool IsRead { get; set; } // Trạng thái đã đọc hay chưa
    }
}
