import axiosInstance from "@/services/api.services";

export const getLoginToken = async (body: Api.Request) => {
  return (
    await axiosInstance.post<Api.ApiResponse<UserMeet.UserResponse>>(
      process.env.NEXT_PUBLIC_URL_MEET + "/api/auth/login",
      { FormData: body }
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
