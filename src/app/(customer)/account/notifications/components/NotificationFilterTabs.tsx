"use client";

import React from "react";
import { NotificationType } from "@/src/services/customer/notificationService";
import { TrashIcon } from "@heroicons/react/24/outline";

interface NotificationFilterTabsProps {
  activeType: NotificationType | "ALL";
  unreadCount: number;
  hasNotifications?: boolean;
  onSelectType: (type: NotificationType | "ALL") => void;
  onMarkAllAsRead: () => void;
  isMarkingAll: boolean;
  onDeleteAll?: () => void;
  isDeletingAll?: boolean;
}

const TABS: { key: NotificationType | "ALL"; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "ORDER", label: "Đơn hàng" },
  { key: "PROMOTION", label: "Khuyến mãi" },
  { key: "SYSTEM", label: "Hệ thống" },
  { key: "ENGAGEMENT", label: "Tương tác" },
];

export default function NotificationFilterTabs({
  activeType,
  unreadCount,
  hasNotifications = false,
  onSelectType,
  onMarkAllAsRead,
  isMarkingAll,
  onDeleteAll,
  isDeletingAll = false,
}: NotificationFilterTabsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">
            Thông báo của tôi
          </h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/60 font-extrabold text-[11px] rounded-full">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={isMarkingAll}
            className="text-xs font-bold text-[#0d5c3a] hover:text-[#094229] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
          >
            <span>
              {isMarkingAll ? "Đang xử lý..." : "Đánh dấu đã đọc tất cả"}
            </span>
          </button>
        ) : (
          hasNotifications &&
          onDeleteAll && (
            <button
              type="button"
              onClick={onDeleteAll}
              disabled={isDeletingAll}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>
                {isDeletingAll ? "Đang xóa..." : "Xóa tất cả thông báo"}
              </span>
            </button>
          )
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeType === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectType(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-[#0d5c3a] text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
