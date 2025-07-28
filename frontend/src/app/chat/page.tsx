"use client";
import { useEffect, useMemo } from "react";
import ChatUI from "./components/chatUI";
import { useSearchParams } from "next/navigation";
import { postCheckAuthentication } from "@/services/users/user.services";
import { useMutation } from "@tanstack/react-query";
import { useGlobal } from "@/provider/global.Context";

export default function Home() {
  const searchParams = useSearchParams();
  const global = useGlobal();
  const api = {
    checkAuthentication: useMutation({
      mutationKey: ["CheckAuthentication", searchParams.get("token")],
      mutationFn: postCheckAuthentication,
      onSuccess: (data) => {
        if (data.token && data.userInfo) {
          localStorage.setItem("token", data.token);
          global.dispatch({
            type: "SET_INIT",
            payload: {
              centerID: data.userInfo.data.identification,
              user_meet: data.userInfo.data.id,
              name: data.userInfo.data.name,
              user_id: data.userInfo.userID,
              token: data.token,
            },
          });
        }
        window.location.href = "/chat";
      },
    }),
  };

  const Token = useMemo(() => {
    const token = searchParams.get("token");
    if (token) {
      api.checkAuthentication.mutate({ token: token });
    }
    return token;
  }, [searchParams]);

  return (
    <main className="bg-[#f3f3f3] p-1">
      <ChatUI tokenPrams={Token ?? undefined} />
    </main>
  );
}
