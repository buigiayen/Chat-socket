"use client";
import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR({
  hubUrl,
  onConnected,
  Token,
}: {
  hubUrl?: string;
  onConnected?: () => void;
  Token?: string ;
}) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  hubUrl = process.env.NEXT_PUBLIC_URL + "/chathub" + "?Authorization=" + Token;
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
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
