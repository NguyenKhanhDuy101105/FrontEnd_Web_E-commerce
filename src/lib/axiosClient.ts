import axios from "axios";
import { showToast } from "@/src/utils/toast";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (status === 401) {
        showToast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (!window.location.pathname.startsWith("/auth/login")) {
          const loginUrl = `/auth/login?redirect=${encodeURIComponent(
            window.location.pathname,
          )}`;
          window.location.replace(loginUrl);
        }
      } else if (status === 403) {
        showToast.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (status === 500) {
        showToast.error("Lỗi máy chủ! Vui lòng thử lại sau.");
      } else if (serverMessage) {
        console.log(serverMessage);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
