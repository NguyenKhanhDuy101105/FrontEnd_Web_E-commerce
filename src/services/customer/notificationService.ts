import axiosClient from "../../lib/axiosClient";

export type NotificationType = "ORDER" | "PROMOTION" | "SYSTEM" | "ENGAGEMENT";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  imageUrl?: string;
  targetUrl?: string;
  referenceId?: string;
  createdAt: string;
}

export interface NotificationListResponseData {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
}

export interface UnreadCountResponseData {
  unreadCount: number;
}

export interface GetNotificationsParams {
  type?: NotificationType;
  isRead?: boolean;
  page?: number;
  size?: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const notificationService = {
  // 1. GET /api/v1/notifications
  getNotifications: async (
    params?: GetNotificationsParams,
  ): Promise<ApiResponse<NotificationListResponseData>> => {
    const response = await axiosClient.get("/api/v1/notifications", {
      params,
    });
    return response.data;
  },

  // 2. GET /api/v1/notifications/unread-count
  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponseData>> => {
    const response = await axiosClient.get(
      "/api/v1/notifications/unread-count",
    );
    return response.data;
  },

  // 3. PATCH /api/v1/notifications/read-all
  markAllAsRead: async (): Promise<ApiResponse<string>> => {
    const response = await axiosClient.patch("/api/v1/notifications/read-all");
    return response.data;
  },

  // 4. PATCH /api/v1/notifications/{id}/read
  markAsRead: async (id: string): Promise<ApiResponse<NotificationItem>> => {
    const response = await axiosClient.patch(
      `/api/v1/notifications/${id}/read`,
    );
    return response.data;
  },

  // 5. DELETE /api/v1/notifications/{id}
  deleteNotification: async (id: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete(`/api/v1/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
