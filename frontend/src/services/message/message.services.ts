import axiosInstance from "@/services/api.services";

export const getMessageByUser = async (params: {
  ToUser?: string;
  timeRanger?: string;
}) => {
  return (
    await axiosInstance.get<MessageOnline.Message[]>("/api/message/items", {
      params: params,
    })
  ).data;
};
