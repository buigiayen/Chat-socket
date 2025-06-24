// src/infrastructure/api/axiosInstance.ts
import { message, notification } from "antd";
import axios from "axios";

const createAxiosInstance = (baseURL?: string) => {
  const config = axios.create({
    baseURL: baseURL ?? process.env.NEXT_PUBLIC_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  config.interceptors.request.use((request) => {
    request.headers.set(
      "Authorization",
      "bearer " + localStorage.getItem("token") || null
    );
    return request;
  });
  config.interceptors.response.use(
    (response) => response,
    (error) => {
      message.error("Có lỗi xảy ra, vui lòng thử lại .", 8);
      if (error.response.status === 400) {
        const data = error.response.data;
        if (data?.isError && data.responseException) {
          message.error(data.message, 3);
          notification.error({
            showProgress: true,
            duration: 8,
            message: "Có lỗi xảy ra, vui lòng thử lại sau.",
            description: data.responseException.exceptionMessage,
          });
          return Promise.reject(data);
        }
      }
      return Promise.reject(error);
    }
  );
  return config;
};
const axiosInstance = createAxiosInstance();
export default axiosInstance;
