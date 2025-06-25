import axiosInstance from "@/services/api.services";

export const getLoginToken = async (body: {
  password: string;
  code: string;
}) => {
  return (
    await axiosInstance.post<UserMeet.UserResponse>(
      "/api/user/authentication/meet",
      body
    )
  ).data;
};

export const getItemUserCenter = async (params: { centerID?: string }) => {
  return (
    await axiosInstance.get<UserChat.UserCenter[]>("/api/user/items", {
      params: params,
    })
  ).data;
};
