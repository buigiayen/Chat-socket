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

export const ChatUI = () => {
  const global = useGlobal();
  const centerID = global.state.UserInfo?.centerID;
  const FromUserID = global.state.UserInfo?.user_id;
  const [value, setValue] = React.useState(""); //Lưu trữ giá trị tin nhắn dc gửi đi
  const [choosenPerson, setChoosenPerson] =
    React.useState<UserChat.UserCenter>();
  const [Persons, setPersons] = React.useState<UserChat.UserCenter[]>();
  const [sendUserConnectionID, setSendUserConnectionID] = React.useState<
    string | undefined
  >(undefined); //Lưu trữ người dùng được chọn để nhắn tin
  const [BubbleDataType, setBubbleDataType] =
    React.useState<BubbleDataType[]>(); //Lưu trữ người dùng

  const [conversations, setConversations] = React.useState<
    GetProp<ConversationsProps, "items">
  >([]); //Lưu trữ tin nhắn

  const connectionRef = useSignalR(); //Khởi tạo signalR
  const { token } = theme.useToken();

  // Customize the style of the container
  const style = {
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
                <span className="text-sm text-gray-800 font-bold">
                  {rs.name}
                </span>
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

      refetchInterval: 20000,
      refetchIntervalInBackground: true,
      gcTime: 2000,
      networkMode: "online",
      queryFn: async () => {
        var response = await getMessageByUser({
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
  useEffect(() => {
    connectionRef.current?.on(`Message`, (FromID, message: string) => {
      if (FromID === choosenPerson?.socketID) {
        setBubbleDataType((prev) => [
          ...(prev ?? []),
          {
            key: Date.now().toString(),
            content: message,
            role: "user",
            placement: "start",
          },
        ]);
      }
    });
  }, []);

  //Tải lại người dùng cho mỗi lần kết nối
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
              onActiveChange={(key) => {
                setSendUserConnectionID(key);
                setChoosenPerson(Persons?.find((rs) => rs.userID == key));
              }}
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
                </Flex>
              </div>
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
