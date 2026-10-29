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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        const protectedRoutes = ["/account", "/checkout", "/orders"];
        const currentPath = window.location.pathname;
        const isProtectedRoute = protectedRoutes.some((route) =>
          currentPath.startsWith(route),
        );
        const isAuthRoute = currentPath.startsWith("/auth");

        if (isProtectedRoute && !isAuthRoute) {
          showToast.error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
          );
          const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
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
