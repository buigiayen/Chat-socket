import { Avatar, Badge } from "antd";
import { useState } from "react";
export default function UserCenter({
  data,
  onClick,
}: {
  data?: UserChat.UserCenter[];
  onClick?: (user: UserChat.UserCenter) => void;
}) {
  const [user, setUser] = useState<UserChat.UserCenter>();
  return (
    <div className=" w-full overflow-y-auto  rounded-md ">
      <h1>Đoạn chat</h1>
      {data && data.length > 0 ? (
        data.map((rs: UserChat.UserCenter) => (
            <div
            key={rs.userID}
            className={`rounded-md p-4 mb-2 transition-colors cursor-pointer flex items-center ${
              user?.userID === rs.userID ? "bg-gray-100" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              onClick && onClick(rs);
              setUser(rs);
            }}
            >
            <Badge dot={rs.isOnline} color="green">
              <Avatar
              size={"small"}
              src={
                "https://img.icons8.com/material/344/user-male-circle--v1.png"
              }
              />
            </Badge>
            <strong className="ml-2">{rs.name}</strong>
            </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-8">No users found.</div>
      )}
    </div>
  );
}
