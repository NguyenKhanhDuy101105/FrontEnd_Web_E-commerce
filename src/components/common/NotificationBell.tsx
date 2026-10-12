"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export default function NotificationBell() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleMouseEnter = () => {
    checkAuth();
    setIsHovered(true);

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      const mockData: NotificationItem[] = [
        {
          id: "1",
          title: "Đơn hàng đã giao thành công",
          message: "Đơn hàng #UBM1023 của bạn đã giao hoàn tất.",
          time: "5 phút trước",
          isRead: false,
        },
        {
          id: "2",
          title: "Ưu đãi siêu thị AI",
          message: "Tặng voucher 20k cho đơn hàng nguyên liệu làm lẩu.",
          time: "1 giờ trước",
          isRead: false,
        },
      ];
      setNotifications(mockData);
      setHasUnread(mockData.some((item) => !item.isRead));
    }
  };

  const handleClickBell = () => {
    setIsHovered(false);

    if (isLoggedIn) {
      setHasUnread(false);
      router.push("/account/notifications");
    } else {
      router.push("/auth/login?redirect=/account/notifications");
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
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
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
                    {hasUnread && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        Mới
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

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={handleClickBell}
                        className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          !item.isRead
                            ? "bg-emerald-50/60 hover:bg-emerald-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                          {item.message}
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
