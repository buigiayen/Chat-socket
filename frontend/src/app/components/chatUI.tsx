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
import {
  Avatar,
  Badge,
  Card,
  Divider,
  Flex,
  GetProp,
  Skeleton,
  theme,
} from "antd";
import React, { useEffect } from "react";
import { useSignalR } from "@/hook/signalr";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { useQuery } from "@tanstack/react-query";
import { getItemUserCenter } from "@/services/users/user.services";
import { getMessageByUser } from "@/services/message/message.services";

export const ChatUI = ({
  centerID = "10099",
  FromUserID = "8adc66b6-a189-4b14-8aec-bb86b02d1eec",
}: {
  centerID: string;
  FromUserID: string;
}) => {
  const [value, setValue] = React.useState("");//Lưu trữ giá trị tin nhắn dc gửi đi
  const [sendUserConnectionID, setSendUserConnectionID] = React.useState<
    string | undefined
  >(undefined);//Lưu trữ người dùng được chọn để nhắn tin
  const [BubbleDataType, setBubbleDataType] =
    React.useState<BubbleDataType[]>();//Lưu trữ người dùng

  const [conversations, setConversations] = React.useState<
    GetProp<ConversationsProps, "items">
  >([]); //Lưu trữ tin nhắn

  const connectionRef = useSignalR(); //Khởi tạo signalR
  const { token } = theme.useToken();

  // Customize the style of the container
  const style = {
    width: 280,
    height: 600,
    background: token.colorBgContainer,
    borderRadius: token.borderRadius,
    overflow: "auto",
  };
 //Gọi api cho mỗi lần thực hiện hành động
  const api = {
    getUser: useQuery({
      queryKey: ["CenterID", centerID],
      enabled: !!centerID,
      refetchInterval: 10000,
      refetchIntervalInBackground: true,
      gcTime: 10000,
      networkMode: "online",
      queryFn: async () => {
        var response = await getItemUserCenter({ centerID: centerID });
        const data =
          response
            ?.filter((r) => r.socketID !== connectionRef.current?.connectionId)
            .map<Conversation>((rs: UserChat.UserCenter, i: number) => ({
              ...conversations,
              key: rs.userID ?? i.toString(),
              label: (
                <span>
                  <Badge status={rs.isOnline ? "processing" : "default"} />{" "}
                  {"  "}
                  {rs.name}
                </span>
              ),
              description: `This is connection ${rs.socketID ?? "unknown"}`,
              icon: (
                <Avatar src="https://img.icons8.com/material/344/user-male-circle--v1.png"></Avatar>
              ),
            })) ?? [];
        setConversations([...data]);

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
        var response = await getMessageByUser({
          FromUser: FromUserID,
          ToUser: sendUserConnectionID,
        });
        if (!response || response.length < 0) {
          setBubbleDataType([]);
          return;
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

  useEffect(() => {
    api.getMessage.refetch();
  }, [sendUserConnectionID]);

  //Tải lại người dùng cho mỗi lần kết nối
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    connectionRef.current?.on(`Message`, (message: string) => {
      setBubbleDataType((prev) => [
        ...(prev ?? []),
        {
          key: Date.now().toString(),
          content: message,
          role: "user",
          placement: "start",
        },
      ]);
    });

    // Cleanup interval khi component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("ReceivedPersonalNotification");
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [connectionRef]);

  return (
    <>
      <Card styles={{ body: { height: "100%", padding: 0 } }}>
        <XProvider>
          <Flex style={{ height: "calc(100vh - 80px)" }} gap={12}>
            <Skeleton loading={api.getUser.isLoading}>
              <Conversations
                style={style}
                defaultActiveKey="1"
                items={conversations}
                onActiveChange={(key) => {
                  setSendUserConnectionID(key);
                }}
              />
            </Skeleton>

            <Divider type="vertical" style={{ height: "100%" }} />
            <Flex vertical style={{ flex: 1 }} gap={8}>
              <Bubble.List style={{ flex: 1 }} items={BubbleDataType} />

              <Suggestion
                items={[{ label: "Write a report", value: "report" }]}
              >
                {({ onTrigger, onKeyDown }) => {
                  return (
                    <Sender
                      disabled={!sendUserConnectionID}
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
                        if (!value || !sendUserConnectionID) {
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
                      placeholder='Type "/" to trigger suggestion'
                    />
                  );
                }}
              </Suggestion>
            </Flex>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Flex>
        </XProvider>
      </Card>
    </>
  );
};
export default ChatUI;
