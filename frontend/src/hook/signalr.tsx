import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR(hubUrl = "/chathub", onConnected?: () => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  hubUrl = process.env.NEXT_PUBLIC_URL + "/chathub";
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        headers: {
          Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMzY2M2RjOS1lZTg3LTRkZjUtOGQwYi0zZmM3MTYyZmZkMDIiLCJuYW1lIjoiSm9obiBEb2UiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ.B3rKz92_2GbCfWXrwIfNLkgCW7NCR7rB9un8LfwP1QU",
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected.");
        onConnected?.();
      } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
      }
    };

    connection.onclose(start);

    start();

    return () => {
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubUrl]);

  return connectionRef;
}
