using Server_chat.Domain.enities;

namespace Server_chat.vm.message
{
    public class SearchMessageResponse
    {
        public Guid messageID { get; set; } // Id của tin nhắn
        public DateTime Timestamp { get; set; } // Thời gian gửi tin nhắn
        public bool IsRead { get; set; } // Trạng thái đã đọc hay chưa
        public string MessageText { get; set; }
        public Guid FromUser { get; set; } // Id của người gửi tin nhắn
    }


}
