import axiosInstance from "@/services/api.services";


export const getLoginToken = async (body: {
  password: string;
  code: string;
}) => {
  return (
    await axiosInstance.post<UserMeet.UserResponse>(
      "/api/user/authentication/meet",
      body,
      {
        headers: {
          Authorization: "bearer " + localStorage.getItem("token") || null,
        },
      }
    )
  ).data;
};

export const getItemUserCenter = async (params: { centerID?: string }) => {
  return (
    await axiosInstance.get<UserChat.UserCenter[]>("/api/user/items", {
      params: params,
      headers: {
        Authorization: "bearer " + localStorage.getItem("token") || null,
      },
    })
  ).data;
};
export const postCheckAuthentication = async (params: { token?: string }) => {
  return (
    await axiosInstance.post<UserMeet.UserResponse>(
      "/api/user/authentication/check",
      null,
      {
        headers: {
          Authorization: "bearer " + params.token || null,
        },
      }
    )
  ).data;
};
