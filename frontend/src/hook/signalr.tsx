import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR(hubUrl = "/chathub", onConnected?: () => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  hubUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL +
    "/chathub" +
    "?Authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YWRjNjZiNi1hMTg5LTRiMTQtOGFlYy1iYjg2YjAyZDFlZWMiLCJuYW1lIjoiSm9obiBEb2UiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ.-hjWYLz4rbw76PxjA48pZaKYDSzAsB_jhmj0M90cbUg";
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
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
