"use client";
import { useLayoutEffect } from "react";
import ChatUI from "./components/chatUI";
import { useGlobal } from "@/provider/global.Context";
import { useParams } from "next/navigation";

export default function Home() {
  const { token } = useParams();
  const global = useGlobal();
  useLayoutEffect(() => {
    console.log(token)
    if (!token) {
      localStorage.setItem("token", token ?? "");
      global.dispatch({
        payload: { ...global.state.UserInfo, token: token },
        type: "SET_INIT",
      });
    } else {
    }
  }, [token]);
  return (
    <main className="h-full  ">
      <ChatUI tokenPrams={token?.toLocaleString() ?? undefined}></ChatUI>
    </main>
  );
}
