using Server_chat.Domain.enities;

namespace Server_chat.vm.message.response
{
    public class MessageResponse
    {
        public IEnumerable<messageDetail> MessageDetails { get; set; } // Danh sách chi tiết tin nhắn
        public User FromUser { get; set; } // Thông tin người dùng gửi tin nhắn
        public User ToUser { get; set; } // Thông tin người dùng gửi tin nhắn
        public DateTime? Timestamp { get { return MessageDetails.Any() ? MessageDetails.FirstOrDefault().Timestamp : null; } set { } } // Thời gian gửi tin nhắn gần nhất
        public bool IsRead { get { return MessageDetails.Any() ? MessageDetails.FirstOrDefault(p => p.IsRead == false).IsRead : true; } set { } } // Trạng thái đã đọc gần nhất
    }
    public class messageDetail
    {
        public Guid messageID { get; set; } // Id của tin nhắn
        public DateTime Timestamp { get; set; } // Thời gian gửi tin nhắn
        public bool IsRead { get; set; } // Trạng thái đã đọc hay chưa
    }

}
