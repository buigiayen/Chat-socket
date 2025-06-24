namespace MessageOnline {
  interface Message {
    messageID: string;
    timestamp: string;
    isRead: boolean;
    messageText: string;
    fromUser: string;
  }
}
