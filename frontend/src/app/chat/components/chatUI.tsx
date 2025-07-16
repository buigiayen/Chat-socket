"use client";
import {
  Bubble,
  Conversation,
  Conversations,
  ConversationsProps,
  Sender,
  Suggestion,
  XProvider,
} from "@ant-design/x";
import { Avatar, Badge, Card, Divider, Flex, GetProp, theme } from "antd";
import React, { useEffect } from "react";
import { useSignalR } from "@/hook/signalr";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { useQuery } from "@tanstack/react-query";
import { getItemUserCenter } from "@/services/users/user.services";
import { getMessageByUser } from "@/services/message/message.services";
import { useGlobal } from "@/provider/global.Context";

// ✅ Thêm interface cho unread messages
interface UnreadCount {
  [userId: string]: number;
}

export const ChatUI = ({ tokenPrams }: { tokenPrams?: string }) => {
  const global = useGlobal();
  const centerID = global.state.UserInfo?.centerID;
  const FromUserID = global.state.UserInfo?.user_id;
  const [value, setValue] = React.useState("");
  const [choosenPerson, setChoosenPerson] =
    React.useState<UserChat.UserCenter>();
  const [Persons, setPersons] = React.useState<UserChat.UserCenter[]>();
  const [sendUserConnectionID, setSendUserConnectionID] = React.useState<
    string | undefined
  >(undefined);
  const [BubbleDataType, setBubbleDataType] =
    React.useState<BubbleDataType[]>();
  const [conversations, setConversations] = React.useState<
    GetProp<ConversationsProps, "items">
  >([]);
  const [isChangingUser, setIsChangingUser] = React.useState(false);

  // ✅ State để lưu trữ số tin nhắn chưa đọc
  const [unreadCounts, setUnreadCounts] = React.useState<UnreadCount>({});

  const connectionRef = useSignalR({
    hubUrl: "",
    Token: tokenPrams ?? global.state.UserInfo?.token,
  });
  const { token } = theme.useToken();

  const style = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadius,
    overflow: "auto",
  };

  // ✅ Hàm để đánh dấu tin nhắn đã đọc
  const markAsRead = (userId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [userId]: 0,
    }));
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
      enabled: !!centerID,
      refetchInterval: 10000,
      refetchIntervalInBackground: true,
      gcTime: 10000,
      networkMode: "online",
      queryFn: async () => {
        const response = await getItemUserCenter({ centerID: centerID });
        const data =
          response
            ?.filter((r) => r.socketID !== connectionRef.current?.connectionId)
            .map<Conversation>((rs: UserChat.UserCenter, i: number) => ({
              ...conversations,
              key: rs?.userID ?? i.toString(),
              label: (
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm text-gray-800 font-bold">
                    {rs?.name}
                  </span>
                  {/* ✅ Hiển thị số tin nhắn chưa đọc */}
                  {unreadCounts[rs?.userID || ""] > 0 && (
                    <Badge
                      count={unreadCounts[rs.userID || ""]}
                      size="small"
                      style={{
                        backgroundColor: "#ff4d4f",
                        color: "#fff",
                        fontSize: "10px",
                        minWidth: "16px",
                        height: "16px",
                        lineHeight: "16px",
                      }}
                    />
                  )}
                </div>
              ),
              description: `This is connection ${rs.socketID ?? "unknown"}`,
              icon: (
                <Badge color="green" dot={rs.isOnline}>
                  <Avatar src="https://img.icons8.com/material/344/user-male-circle--v1.png"></Avatar>
                </Badge>
              ),
            })) ?? [];
        setConversations([...data]);
        setPersons(response);
        return response;
      },
    }),
    getMessage: useQuery({
      queryKey: ["user", sendUserConnectionID],
      enabled: !!sendUserConnectionID,
      refetchInterval: 20000,
      refetchIntervalInBackground: true,
      gcTime: 2000,
      networkMode: "online",
      queryFn: async () => {
        if (!sendUserConnectionID) return [];

        const response = await getMessageByUser({
          ToUser: sendUserConnectionID,
        });

        if (!response || response.length < 0) {
          setBubbleDataType([]);
          return [];
        }

        const mapMessage =
          response?.map<BubbleDataType>((r: MessageOnline.Message) => ({
            key: r.messageID?.toString() || Date.now().toString(),
            content: r.messageText,
            role: r.fromUser === FromUserID ? "user" : "assistant",
            placement: r.fromUser === FromUserID ? "end" : "start",
            avatar: (
              <Avatar src="https://img.icons8.com/material/344/user-male-circle--v1.png"></Avatar>
            ),
          })) ?? [];
        setBubbleDataType(mapMessage);
        return response;
      },
    }),
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
      const playNotificationSound = () => {
        const audio = new Audio(
          "https://console.emcvietnam.vn:9000/audio-emc/new-notification-014-363678.mp3"
        );
        audio.play().catch(() => {});
      };

      const handleMessage = (FromID: string, message: string) => {
        const senderUser = Persons?.find((p) => p.socketID === FromID);
        const senderUserId = senderUser?.userID;

        if (senderUserId) {
          // Nếu tin nhắn từ người đang chat
          if (FromID === choosenPerson?.socketID) {
            setBubbleDataType((prev) => [
              ...(prev ?? []),
              {
                key: Date.now().toString(),
                content: message,
                role: "assistant",
                placement: "start",
                avatar: (
                  <Avatar src="https://img.icons8.com/material/344/user-male-circle--v1.png" />
                ),
              },
            ]);
            playNotificationSound();
            // Không tăng unread count vì đang xem tin nhắn
          } else {
            playNotificationSound();
            // ✅ Tăng unread count cho người khác
            incrementUnreadCount(senderUserId);
          }
        }
      };

      connectionRef.current.on("Message", handleMessage);
    }

    return cleanup;
  }, [choosenPerson?.socketID, connectionRef.current, Persons]);

  // ✅ Xử lý khi thay đổi user được chọn
  useEffect(() => {
    if (sendUserConnectionID && choosenPerson) {
      setBubbleDataType([]);
      api.getMessage.refetch();

      // ✅ Đánh dấu tin nhắn đã đọc khi mở conversation
      markAsRead(sendUserConnectionID);
    }
  }, [sendUserConnectionID, choosenPerson]);

  // ✅ Hàm xử lý thay đổi user với loading state
  const handleActiveChangeWithLoading = async (key: string) => {
    if (isChangingUser) return;

    setIsChangingUser(true);

    try {
      const selectedPerson = Persons?.find((rs) => rs.userID === key);

      if (selectedPerson?.socketID !== choosenPerson?.socketID) {
        if (connectionRef.current) {
          connectionRef.current.off("Message");
        }

        setSendUserConnectionID(key);
        setChoosenPerson(selectedPerson);

        // ✅ Đánh dấu đã đọc khi chọn user
        markAsRead(key);
      }
    } catch (error) {
      console.error("Error changing user:", error);
    } finally {
      setIsChangingUser(false);
    }
  };

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

  // Tải lại người dùng khi component mount
  React.useEffect(() => {
    api.getUser.refetch();
  }, []);

  return (
    <>
      <Card styles={{ body: { height: "100%", padding: 0 } }}>
        <XProvider>
          <Flex style={{ height: "calc(100vh - 80px)" }} gap={12}>
            <Conversations
              draggable
              style={style}
              defaultActiveKey="1"
              items={conversations}
              onActiveChange={handleActiveChangeWithLoading}
            />
            <Divider type="vertical" style={{ height: "100%" }} />
            <Flex vertical style={{ flex: 1 }} gap={8}>
              <div
                className="p-2 border-b-1 border-gray-200"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: token.colorBgContainer,
                }}
              >
                <Flex align="center" gap={12}>
                  <Avatar
                    size={48}
                    src={
                      "https://img.icons8.com/material/344/user-male-circle--v1.png"
                    }
                  />
                  <Flex vertical>
                    <span style={{ fontWeight: "bold", fontSize: 18 }}>
                      {choosenPerson?.name || "Chọn người trò chuyện"}
                    </span>
                    <span className="text-sm text-gray-400">
                      {choosenPerson?.isOnline
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </Flex>
                  {/* ✅ Hiển thị tổng số tin nhắn chưa đọc */}
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
                </Flex>
              </div>

              <Bubble.List style={{ flex: 1 }} items={BubbleDataType} />

              <Suggestion
                items={[{ label: "Write a report", value: "report" }]}
              >
                {({ onTrigger, onKeyDown }) => {
                  return (
                    <Sender
                      disabled={!sendUserConnectionID || isChangingUser}
                      value={value}
                      onChange={(nextVal) => {
                        if (nextVal === "/") {
                          onTrigger();
                        } else if (!nextVal) {
                          onTrigger(false);
                        }
                        setValue(nextVal);
                      }}
                      onKeyDown={onKeyDown}
                      onSubmit={(value) => {
                        if (!value || !sendUserConnectionID || isChangingUser) {
                          return;
                        }
                        if (connectionRef.current?.state === "Connected") {
                          connectionRef?.current
                            ?.invoke(
                              "SendPrivateMessage",
                              sendUserConnectionID,
                              value
                            )
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
                            })
                            .catch((error) => {
                              console.error("Error sending message:", error);
                            });
                        }
                      }}
                      placeholder={
                        isChangingUser
                          ? "Đang chọn người dùng..."
                          : 'Type "/" to trigger suggestion'
                      }
                    />
                  );
                }}
              </Suggestion>
              <br></br>
            </Flex>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Flex>
        </XProvider>
      </Card>
    </>
  );
};

export default ChatUI;
