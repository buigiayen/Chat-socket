"use client";
import { Bubble, Sender } from "@ant-design/x";
import { Avatar, Badge, Col, GetRef, Row, Spin, theme, Button, Input, notification } from "antd";
import React, { useEffect } from "react";
import { useSignalR } from "@/hook/signalr";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { useQuery } from "@tanstack/react-query";
import { getItemUserCenter } from "@/services/users/user.services";
import { getMessageByUser } from "@/services/message/message.services";
import { useGlobal } from "@/provider/global.Context";
import UserCenter from "./user.chat";
import ButtonInfoChat from "./buttonUserInfo.chat";
import '@ant-design/v5-patch-for-react-19';

// ✅ Thêm interface cho unread messages
interface UnreadCount {
  [userId: string]: number;
}

export const ChatUI = ({ tokenPrams }: { tokenPrams?: string }) => {
  const global = useGlobal();
  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const target = e.target as HTMLDivElement;

      // Kiểm tra xem người dùng có đang cuộn lên xem tin nhắn cũ không
      const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 50;
      setIsUserScrolling(!isAtBottom);

      // Nếu người dùng cuộn xuống dưới, reset trạng thái
      if (isAtBottom) {
        setIsUserScrolling(false);
      }
    },
    []
  );
  const centerID = global.state.UserInfo?.centerID;
  const FromUserID = global.state.UserInfo?.user_id;

  const [value, setValue] = React.useState("");
  const [choosenPerson, setChoosenPerson] =
    React.useState<UserChat.UserCenter>();

  const [Persons, setPersons] = React.useState<UserChat.UserCenter[]>();

  const [BubbleDataType, setBubbleDataType] =
    React.useState<BubbleDataType[]>();

  // State cho tìm kiếm user
  const [searchText, setSearchText] = React.useState("");

  // ✅ State để lưu trữ số tin nhắn chưa đọc
  const [unreadCounts, setUnreadCounts] = React.useState<UnreadCount>({});

  // State để theo dõi vị trí cuộn
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);
  const [hasNewMessages, setHasNewMessages] = React.useState(false);

  const connectionRef = useSignalR({
    hubUrl: "",
    Token: tokenPrams ?? global.state.UserInfo?.token,
  });
  const { token } = theme.useToken();

  // Hàm để cuộn xuống dưới cùng
  const scrollToBottom = () => {
    setTimeout(() => {
      // Thử cuộn container chính trước
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }

      // Thử tìm và cuộn Bubble.List container
      const bubbleContainer = document.querySelector('.ant-bubble-list');
      if (bubbleContainer) {
        bubbleContainer.scrollTop = bubbleContainer.scrollHeight;
      }


    }, 150);
  };

  const LoadMessage = async ({ userID }: { userID: string }) => {
    const response = await getMessageByUser({
      ToUser: userID,
    });
    const mapMessage =
      response?.map<BubbleDataType>((r: MessageOnline.Message) => ({
        key: r.messageID?.toString() || Date.now().toString(),
        content: r.messageText,
        placement: r.fromUser == FromUserID ? "end" : "start",
        avatar: <Avatar src={
          r.fromUser == FromUserID ? 'https://console.emcvietnam.vn:9000/public-emc/user.png' :
            Persons?.filter(p => p.userID == r.fromUser)[0]?.image}></Avatar>
      })) ?? [];

    setBubbleDataType(mapMessage ?? []);
    // Tự động cuộn xuống dưới sau khi load tin nhắn
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    return mapMessage;
  };

  // ✅ Hàm để tăng số tin nhắn chưa đọc
  const incrementUnreadCount = (userId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + 1,
    }));
  };

  const api = {
    getUser: useQuery({
      queryKey: ["CenterID", centerID],
      enabled: true,
      refetchInterval: 10000,
      refetchIntervalInBackground: true,
      gcTime: 10000,
      queryFn: async () => {
        if (centerID) {
          const ItemUser = await getItemUserCenter({ centerID: centerID });
          setPersons(ItemUser);
          return ItemUser;
        }

      },
    }),
  };

  const playNotificationSound = () => {
    const audio = new Audio(
      "https://console.emcvietnam.vn:9000/audio-emc/new-notification-014-363678.mp3"
    );
    audio.play().catch(() => { });
  };

  // ✅ Xử lý SignalR Message event với unread count
  useEffect(() => {
    const cleanup = () => {
      if (connectionRef.current) {
        connectionRef.current.off("Message");
      }
    };
    cleanup();
    if (connectionRef.current) {
      const handleMessage = (FromID: string, message: string) => {
        const senderUser = Persons?.find((p) => p.userID === FromID);
        const senderUserId = senderUser?.userID;
        if (senderUserId) {
          // Nếu tin nhắn từ người đang chat
          if (FromID === choosenPerson?.userID) {
            setBubbleDataType((prev) => [
              ...(prev ?? []),
              {
                key: Date.now().toString(),
                content: message,
                role: "assistant",
                placement: "start",
                avatar: (
                  <Avatar src={choosenPerson.image} />
                ),
              },
            ]);
            playNotificationSound();
            // Tự động cuộn xuống dưới khi nhận tin nhắn mới
            setTimeout(() => {
              scrollToBottom();
            }, 50);
            // Không tăng unread count vì đang xem tin nhắn
          } else {
            playNotificationSound();
            incrementUnreadCount(senderUserId);
            notification.info({
              message: `${senderUser?.name} đã gửi tin cho bạn`,
              description:
                message,
              duration: 3,
              showProgress: true,
            });
          }

        }

      };

      connectionRef.current.on("Message", handleMessage);
    }

    return cleanup;
  }, [choosenPerson?.socketID, connectionRef.current, Persons]);

  // ✅ Hàm để lấy tổng số tin nhắn chưa đọc
  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce(
      (total, count) => total + count,
      0
    );
  };

  // ✅ Effect để cập nhật title với số tin nhắn chưa đọc
  useEffect(() => {
    const totalUnread = getTotalUnreadCount();
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, "");

    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    // Cleanup khi component unmount
    return () => {
      document.title = originalTitle;
    };
  }, [unreadCounts]);

  // Effect để tự động cuộn xuống dưới khi có tin nhắn mới
  useEffect(() => {
    if (BubbleDataType && BubbleDataType.length > 0) {
      // Chỉ cuộn xuống dưới nếu người dùng không đang cuộn lên xem tin nhắn cũ
      if (!isUserScrolling) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        setHasNewMessages(false);
      } else {
        // Nếu người dùng đang cuộn lên, đánh dấu có tin nhắn mới
        setHasNewMessages(true);
      }
    }
  }, [BubbleDataType, isUserScrolling]);

  // Effect để cuộn xuống dưới khi chọn người dùng mới
  useEffect(() => {
    if (choosenPerson) {
      // Chỉ cuộn xuống dưới khi load tin nhắn lần đầu
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [choosenPerson?.userID]);

  // Tải lại người dùng khi component mount
  React.useEffect(() => {
    api.getUser.refetch();
  }, []);

  return (
    <div style={{ height: "100vh", padding: "16px", display: "flex", flexDirection: "column" }}>
      <Row
        gutter={[16, 16]}
        style={{ flex: 1, margin: 0, height: "100%" }}
      >
        {/* Danh sách người dùng */}
        <Col xs={24} md={6} lg={6} style={{ height: "100%" }}>
          <div
            className="bg-[#fff] w-full p-2 rounded-md"
            style={{ height: "100%", overflowY: "auto", position: "relative" }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#fff",
                paddingBottom: 8,
                marginBottom: 8,
              }}
            >
              <Input
                placeholder="Tìm kiếm"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            {api.getUser.isLoading ? (
              <Spin></Spin>
            ) : (
              <UserCenter
                data={
                  api.getUser.data?.filter(
                    (user: UserChat.UserCenter) =>
                      user.name?.toLowerCase().includes(searchText.toLowerCase())
                  )
                }
                onClick={(user: UserChat.UserCenter) => {
                  setBubbleDataType([]);
                  setChoosenPerson(user);
                  LoadMessage({ userID: user.userID });
                }}
              />
            )}
          </div>
        </Col>

        {/* Khu vực chat */}
        <Col xs={24} md={18} lg={18} style={{ height: "100%" }}>
          <div
            className="bg-[#fff] rounded-md"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div
              className="p-3 border-b border-gray-200"
              style={{
                background: token.colorBgContainer,
                flexShrink: 0,
              }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} md={1} lg={1}>
                  <Avatar
                    size={48}
                    src={
                      choosenPerson?.image
                    }
                  />
                </Col>
                <Col md={12} lg={12}>
                  <div>
                    <span style={{ fontWeight: "bold", fontSize: 18 }}>
                      {choosenPerson?.name || "Chọn người trò chuyện"}
                    </span>
                    <p className="text-sm text-gray-400">
                      {choosenPerson?.isOnline
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
                    </p>
                  </div>
                </Col>
                <Col md={11}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      float: "right",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {choosenPerson && (
                      <ButtonInfoChat userInfo={choosenPerson}></ButtonInfoChat>
                    )}
                  </div>
                </Col>
              </Row>

              {getTotalUnreadCount() > 0 && (
                <div className="ml-auto">
                  <Badge
                    count={getTotalUnreadCount()}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                  <span className="text-xs text-gray-500 ml-2">
                    tin nhắn chưa đọc
                  </span>
                </div>
              )}
            </div>

            {/* Chat messages area */}
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                position: "relative",
                minHeight: 0
              }}
            >
              <Bubble.List
                className="bg-[#fff] p-3 h-full"
                onScroll={onScroll}
                ref={listRef}
                items={BubbleDataType ?? []}
              />
              {/* Nút cuộn xuống dưới */}
              <Button
                type="primary"
                shape="circle"
                size="small"
                onClick={scrollToBottom}
                style={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  zIndex: 10,
                  opacity: 0.8,
                }}
              >
                ↓
              </Button>

              {/* Indicator tin nhắn mới */}
              {hasNewMessages && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 80,
                    right: 20,
                    zIndex: 10,
                    background: "#1890ff",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                  onClick={scrollToBottom}
                >
                  Tin nhắn mới ↓
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{ flexShrink: 0, padding: "12px" }}>
              <Sender
                className="bg-[#fff]"
                value={value}
                disabled={!choosenPerson?.socketID}
                onChange={(nextVal) => {
                  setValue(nextVal);
                }}
                onSubmit={(value) => {
                  if (!value || !choosenPerson?.userID) {
                    return;
                  }
                  if (connectionRef.current?.state === "Connected") {
                    connectionRef?.current
                      ?.invoke("SendPrivateMessage", choosenPerson?.userID, value)
                      .then(() => {
                        setBubbleDataType((prev) => [
                          ...(prev ?? []),
                          {
                            key: Date.now().toString(),
                            content: value,
                            role: "user",
                            placement: "end",
                          },
                        ]);
                        setValue("");
                        // Tự động cuộn xuống dưới khi gửi tin nhắn
                        setTimeout(() => {
                          scrollToBottom();
                        }, 50);
                      })
                      .catch((error) => {
                        console.error("Error sending message:", error);
                      });
                  }
                }}
                placeholder={
                  choosenPerson?.centerID ? "Nhập tin nhắn" : "Chọn người dùng..."
                }
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ChatUI;
