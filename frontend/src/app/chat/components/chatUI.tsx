"use client";
import { Bubble, Sender } from "@ant-design/x";
import { Avatar, Badge, Col, GetRef, Row, Spin, theme } from "antd";
import React, { useEffect } from "react";
import { useSignalR } from "@/hook/signalr";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { useQuery } from "@tanstack/react-query";
import { getItemUserCenter } from "@/services/users/user.services";
import { getMessageByUser } from "@/services/message/message.services";
import { useGlobal } from "@/provider/global.Context";
import UserCenter from "./user.chat";
import ButtonInfoChat from "./buttonUserInfo.chat";

// ✅ Thêm interface cho unread messages
interface UnreadCount {
  [userId: string]: number;
}

export const ChatUI = ({ tokenPrams }: { tokenPrams?: string }) => {
  const global = useGlobal();
  const [scrollTop, setScrollTop] = React.useState(0);
  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null);

  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
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

  // ✅ State để lưu trữ số tin nhắn chưa đọc
  const [unreadCounts, setUnreadCounts] = React.useState<UnreadCount>({});

  const connectionRef = useSignalR({
    hubUrl: "",
    Token: tokenPrams ?? global.state.UserInfo?.token,
  });
  const { token } = theme.useToken();
  const LoadMessage = async ({ userID }: { userID: string }) => {
    const response = await getMessageByUser({
      ToUser: userID,
    });
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
    setBubbleDataType(mapMessage ?? []);
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
        const ItemUser = await getItemUserCenter({ centerID: centerID });
        setPersons(ItemUser);
        return ItemUser;
      },
    }),
  };
  const playNotificationSound = () => {
    const audio = new Audio(
      "https://console.emcvietnam.vn:9000/audio-emc/new-notification-014-363678.mp3"
    );
    audio.play().catch(() => {});
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
      <Row
        gutter={[16, 16]}
        className="w-full h-full"
        style={{ height: "calc(100% - 20vh)", margin: 0 }}
      >
        <Col xs={24} md={6} lg={6}>
          <div
            className="bg-[#fff] w-full p-2 rounded-md"
            style={{ maxHeight: "98vh", overflowY: "auto" }}
          >
            {api.getUser.isLoading ? (
              <Spin></Spin>
            ) : (
              <UserCenter
                data={api.getUser.data}
                onClick={(user: UserChat.UserCenter) => {
                  setBubbleDataType([]);
                  setChoosenPerson(user);
                  LoadMessage({ userID: user.userID });
                }}
              />
            )}
          </div>
        </Col>

        <Col xs={24} md={18} lg={18}>
          <div style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div
              className="p-2 border-b-1 border-gray-200"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: token.colorBgContainer,
              }}
            >
              <div className="center">
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={1} lg={1}>
                    <Avatar
                      size={48}
                      src={
                        "https://img.icons8.com/material/344/user-male-circle--v1.png"
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
                        <ButtonInfoChat
                          userInfo={choosenPerson}
                        ></ButtonInfoChat>
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
            </div>

            <Bubble.List
              className="bg-[#fff] h-[calc(100%-50vh)]  p-3 min-h-[calc(100%-50vh)]"
              onScroll={onScroll}
              ref={listRef}
              items={BubbleDataType ?? []}
            />
          </div>
          <div>
            <Sender
              className="bg-[#fff] mt-3"
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
        </Col>
      </Row>
    </>
  );
};

export default ChatUI;
