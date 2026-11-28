"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import notificationService, {
  NotificationItem,
} from "@/src/services/customer/notificationService";
import {
  useUserNotificationWebSocket,
  UserNotificationRealtimeEvent,
} from "@/src/hooks/useUserNotificationWebSocket";
import { showToast } from "@/src/utils/toast";

export default function NotificationBell() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const checkAuthAndFetchUnread = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    const auth = Boolean(token);
    setIsLoggedIn(auth);

    if (auth) {
      try {
        const res = await notificationService.getUnreadCount();
        if (res.status === "success" && res.data) {
          const count = res.data.unreadCount || 0;
          setUnreadCount(count);
          setHasUnread(count > 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải số lượng thông báo chưa đọc:", error);
      }
    } else {
      setHasUnread(false);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    checkAuthAndFetchUnread();

    const syncBell = () => {
      checkAuthAndFetchUnread();
    };
    window.addEventListener("user-notification-received", syncBell);
    window.addEventListener("storage", syncBell);
    return () => {
      window.removeEventListener("user-notification-received", syncBell);
      window.removeEventListener("storage", syncBell);
    };
  }, [checkAuthAndFetchUnread]);

  const handleRealtimeNotification = useCallback(
    (payload: UserNotificationRealtimeEvent) => {
      setHasUnread(true);
      setUnreadCount((prev) => prev + 1);

      const toastText =
        payload.title ||
        payload.content ||
        payload.message ||
        "Bạn có một thông báo mới!";
      showToast.info(toastText);

      if (payload.id && payload.title) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === payload.id)) return prev;
          const newItem: NotificationItem = {
            id: payload.id!,
            title: payload.title!,
            content: payload.content || payload.message || "",
            isRead: false,
            createdAt: payload.createdAt || new Date().toISOString(),
          } as NotificationItem;
          return [newItem, ...prev].slice(0, 5);
        });
      }

      checkAuthAndFetchUnread();

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("user-notification-received", { detail: payload }),
        );
      }
    },
    [checkAuthAndFetchUnread],
  );

  useUserNotificationWebSocket({
    enabled: isLoggedIn,
    onNotification: handleRealtimeNotification,
  });

  const fetchQuickNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({
        page: 0,
        size: 5,
      });

      if (res.status === "success" && res.data) {
        setNotifications(res.data.content || []);
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
          setHasUnread(res.data.unreadCount > 0);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách thông báo xem nhanh:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      fetchQuickNotifications();
    }
  };

  const handleClickBell = () => {
    setIsHovered(false);

    if (isLoggedIn) {
      router.push("/account/notifications");
    } else {
      router.push("/auth/login?redirect=/account/notifications");
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    setIsHovered(false);

    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        setHasUnread(newUnreadCount > 0);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
      } catch (error) {
        console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      }
    }

    router.push("/account/notifications");
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="relative py-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleClickBell}
        className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors relative focus:outline-none cursor-pointer"
        title="Thông báo"
      >
        <BellIcon className="w-6 h-6" />

        {isLoggedIn && hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {isHovered && (
        <div className="absolute right-0 top-full w-80 pt-0.5 z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
            {isLoggedIn ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200/60 px-2 py-0.5 rounded-full font-extrabold">
                        {unreadCount} mới
                      </span>
                    )}
                  </h4>
                  <button
                    type="button"
                    onClick={handleClickBell}
                    className="text-xs text-emerald-600 hover:underline font-medium cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  {loading ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium">
                      Đang tải thông báo...
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
                          !item.isRead
                            ? "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100"
                            : "hover:bg-slate-50 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {formatTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                          {item.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Không có thông báo nào
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                  <Link
                    href="/account/notifications"
                    onClick={() => setIsHovered(false)}
                    className="text-xs text-slate-500 hover:text-emerald-600 font-medium inline-block w-full py-1"
                  >
                    Đến trang quản lý thông báo →
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                  <BellIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Chưa đăng nhập
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 px-2">
                    Vui lòng đăng nhập để nhận và xem các thông báo ưu đãi từ hệ
                    thống.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClickBell}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
