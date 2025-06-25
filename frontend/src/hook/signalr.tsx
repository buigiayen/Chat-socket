import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useGlobal } from "@/provider/global.Context";

export function useSignalR(hubUrl = "/chathub", onConnected?: () => void) {
  const global = useGlobal();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  hubUrl =
    process.env.NEXT_PUBLIC_URL +
    "/chathub" +
    "?Authorization=" +
    localStorage?.getItem("token");
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
