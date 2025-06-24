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
  Card,
  Divider,
  Flex,
  GetProp,
  Image,
  Input,
  Skeleton,
  theme,
} from "antd";
import React from "react";
import { useSignalR } from "@/hook/signalr";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { useQuery } from "@tanstack/react-query";
import { getItemUserCenter } from "@/services/users/user.services";

export const ChatUI = () => {
  const [value, setValue] = React.useState("");
  const [sendUserConnectionID, setSendUserConnectionID] = React.useState<
    string | null
  >(null);
  const [BubbleDataType, setBubbleDataType] =
    React.useState<BubbleDataType[]>();

  const [conversations, setConversations] = React.useState<
    GetProp<ConversationsProps, "items">
  >([]);

  const connectionRef = useSignalR();
  const { token } = theme.useToken();

  // Customize the style of the container
  const style = {
    width: 280,
    height: 600,
    background: token.colorBgContainer,
    borderRadius: token.borderRadius,
    overflow: "auto",
  };
  const centerID = "10099";
  const api = useQuery({
    queryKey: ["user", centerID],
    enabled: !!centerID,
    refetchInterval: 20000,
    refetchIntervalInBackground: true,
    gcTime: 2000,
    networkMode: "online",
    queryFn: async () => {
      var response = await getItemUserCenter({ centerID: centerID });
      const data =
        response?.map<Conversation>((rs: UserChat.UserCenter, i: number) => ({
          ...conversations,
          key: rs.idUser ?? i.toString(),
          label: rs.name ?? "Unknown",
          description: `This is connection ${rs.socketID ?? "unknown"}`,

          icon: (
            <Avatar src="https://img.icons8.com/material/344/user-male-circle--v1.png"></Avatar>
          ),
        })) ?? [];
      setConversations([...data]);
      return response;
    },
  });

  // Lấy danh sách các kết nối đang truy cập từ SignalR
  React.useEffect(() => {
    if (connectionRef.current) {
      connectionRef.current.on(
        "ReceivedPersonalNotification",
        (connectionId: string, message: string) => {}
      );
    }
    // Cleanup listener khi component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("ReceivedPersonalNotification");
      }
    };
  }, [connectionRef]);
  React.useEffect(() => {
    if (connectionRef.current) {
      connectionRef.current.on(
        "UpdateConnections",
        (connectionIds: string[]) => {}
      );
      // Gửi yêu cầu lấy danh sách kết nối khi component mount
      connectionRef.current.invoke("GetConnections");

      // Thiết lập interval để gọi lại mỗi 10s
      const intervalId = setInterval(() => {
        connectionRef.current?.invoke("GetConnections");
      }, 10000);

      // Cleanup interval khi component unmount
      return () => {
        clearInterval(intervalId);
        if (connectionRef.current) {
          connectionRef.current.off("UpdateConnections");
        }
      };
    }
    // Cleanup listener khi component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("UpdateConnections");
      }
    };
  }, [connectionRef]);

  return (
    <>
      <Card styles={{ body: { height: "100%", padding: 0 } }}>
        <XProvider>
          <Flex style={{ height: "calc(100vh - 80px)" }} gap={12}>
            <Skeleton loading={api.isLoading}>
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
                              console.log("Message sent successfully");
                              setBubbleDataType((prev) => [
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
