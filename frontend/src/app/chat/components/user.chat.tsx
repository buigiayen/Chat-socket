import { Avatar, Badge, Input } from "antd";
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
      {data && data.length > 0 ? (
        data.map((rs: UserChat.UserCenter) => (
          <div
            key={rs.userID}
            className={`rounded-md p-4 mb-2 transition-colors cursor-pointer flex items-center ${user?.userID === rs.userID ? "bg-gray-100" : "hover:bg-gray-100"
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
                  rs.image
                }
              />
            </Badge>
            <strong className="ml-2">{rs.name}</strong>
            {rs.messsageNotRead > 0 && (
              <Badge
                count={rs.messsageNotRead}
                style={{
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  minWidth: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginLeft: 8,
                }}
                overflowCount={99}
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-8">No users found.</div>
      )}
    </div>

  );
}
