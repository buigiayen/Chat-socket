"use client";
import {
  Bubble,
  Conversation,
  Conversations,
  Sender,
  Suggestion,
  XProvider,
} from "@ant-design/x";
import { Button, Card, Divider, Flex } from "antd";
import React from "react";

import {
  AlipayCircleOutlined,
  GithubOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSignalR } from "@/hook/signalr";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";

export const ChatUI = () => {
  const [value, setValue] = React.useState("");
  const [sendUserConnectionID, setSendUserConnectionID] = React.useState<
    string | null
  >(null);
  const [BubbleDataType, setBubbleDataType] = React.useState<BubbleDataType[]>(
    []
  );

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const connectionRef = useSignalR("https://localhost:7092/chathub", () => {
    console.log("SignalR connected");
  });
  // Lấy danh sách các kết nối đang truy cập từ SignalR
  React.useEffect(() => {
    if (connectionRef.current) {
      connectionRef.current.on(
        "ReceivedPersonalNotification",
        (connectionId: string, message: string) => {
          setBubbleDataType((prev) => [
            ...prev,
            {
              key: Date.now().toString(),
              content: message,
              role: "user",
              placement: "end",
              avatar: (
                <AlipayCircleOutlined style={{ fontSize: 24, color: "#08c" }} />
              ),
            },
          ]);
        }
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
        (connectionIds: string[]) => {
          setConversations(
            connectionIds
              .filter((id) => id !== connectionRef.current?.connectionId)
              .map((id) => ({
                key: id,
                label: `${
                  id === connectionRef.current?.connectionId ? "You" : id
                }`,
                icon: <UserOutlined />,
                description: `This is connection ${id}`,
              }))
          );
        }
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
      <Card styles={{ body: { height: "100%" } }}>
        <XProvider>
          <Flex style={{ height: "calc(100vh - 80px)" }} gap={12}>
            <Conversations
              style={{ width: 200 }}
              defaultActiveKey="1"
              items={conversations}
              onActiveChange={(key) => {
                setSendUserConnectionID(key);
              }}
            />
            <Divider type="vertical" style={{ height: "100%" }} />
            <Flex vertical style={{ flex: 1 }} gap={8}>
              <Bubble.List style={{ flex: 1 }} items={BubbleDataType} />

              <Suggestion
                items={[{ label: "Write a report", value: "report" }]}
              >
                {({ onTrigger, onKeyDown }) => {
                  return (
                    <Sender
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
                        if (connectionRef.current) {
                          connectionRef.current
                            ?.invoke(
                              "SendPrivateMessage",
                              sendUserConnectionID,
                              value
                            )
                            .then(() => {
                              console.log("Message sent successfully");
                              setBubbleDataType((prev) => [
                                ...prev,
                                {
                                  key: Date.now().toString(),
                                  content: value,
                                  role: "user",
                                  placement: "start",
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
