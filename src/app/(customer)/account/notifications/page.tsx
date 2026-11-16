"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import notificationService, {
  NotificationItem,
  NotificationType,
} from "@/src/services/customer/notificationService";
import { showToast } from "@/src/utils/toast";
import NotificationFilterTabs from "./components/NotificationFilterTabs";
import NotificationCard from "./components/NotificationCard";
import Pagination from "@/src/components/common/Pagination";
import { BellIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeType, setActiveType] = useState<NotificationType | "ALL">("ALL");

  const [loading, setLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const listContainerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.status === "success" && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải số lượng thông báo chưa đọc:", error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({
        page,
        size: 10,
        type: activeType === "ALL" ? undefined : activeType,
      });

      if (res.status === "success" && res.data) {
        setNotifications(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      } else {
        setNotifications([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách thông báo:", error);
      showToast.error("Không thể tải danh sách thông báo!");
      setNotifications([]);
    } finally {
      setLoading(false);
      if (listContainerRef.current) {
        listContainerRef.current.scrollTop = 0;
      }
    }
  }, [page, activeType]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleSelectType = (type: NotificationType | "ALL") => {
    setActiveType(type);
    setPage(0);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.status === "success") {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isRead: true } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      const res = await notificationService.markAllAsRead();
      if (res.status === "success") {
        showToast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, isRead: true })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu đọc tất cả:", error);
      showToast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await notificationService.deleteNotification(id);
      if (res.status === "success") {
        showToast.success("Đã xóa thông báo!");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      showToast.error("Không thể xóa thông báo này!");
    }
  };

  return (
    <div className="w-full space-y-5">
      <NotificationFilterTabs
        activeType={activeType}
        unreadCount={unreadCount}
        onSelectType={handleSelectType}
        onMarkAllAsRead={handleMarkAllAsRead}
        isMarkingAll={isMarkingAll}
      />

      {loading ? (
        <div className="h-120 flex flex-col items-center justify-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200/80">
          <ArrowPathIcon className="w-6 h-6 animate-spin mb-2 text-[#0d5c3a]" />
          <span>Đang tải danh sách thông báo...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="h-120 flex flex-col items-center justify-center text-center space-y-2 bg-white rounded-xl border border-slate-200/80">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BellIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">
            Không có thông báo nào
          </p>
          <p className="text-xs text-slate-400">
            Bạn chưa có thông báo mới nào trong danh mục này.
          </p>
        </div>
      ) : (
        <div
          ref={listContainerRef}
          className="max-h-120 overflow-y-auto pr-1.5 space-y-3 scroll-smooth"
        >
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end pt-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
}
