"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBagIcon,
  TagIcon,
  Cog6ToothIcon,
  ChatBubbleLeftEllipsisIcon,
  TrashIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { NotificationItem } from "@/src/services/customer/notificationService";

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "ORDER":
        return (
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingBagIcon className="w-5 h-5" />
          </div>
        );
      case "PROMOTION":
        return (
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
            <TagIcon className="w-5 h-5" />
          </div>
        );
      case "SYSTEM":
        return (
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
            <Cog6ToothIcon className="w-5 h-5" />
          </div>
        );
      case "ENGAGEMENT":
      default:
        return (
          <div className="w-10 h-10 bg-emerald-50 text-[#0d5c3a] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          </div>
        );
    }
  };

  const handleCardClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const formattedDate = new Date(notification.createdAt).toLocaleString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  return (
    <div
      onClick={handleCardClick}
      className={`relative group bg-white rounded-xl border p-4 transition-all flex items-start gap-3.5 cursor-pointer hover:border-slate-300 ${
        !notification.isRead
          ? "border-emerald-200/80 bg-emerald-50/20 shadow-2xs"
          : "border-slate-200/80 opacity-90"
      }`}
    >
      {!notification.isRead && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
      )}

      {notification.imageUrl ? (
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
          <Image
            src={notification.imageUrl}
            alt={notification.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        getNotificationIcon()
      )}

      <div className="flex-1 min-w-0 pr-6 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`text-xs sm:text-sm leading-snug truncate ${
              !notification.isRead
                ? "font-extrabold text-slate-900"
                : "font-bold text-slate-800"
            }`}
          >
            {notification.title}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            • {formattedDate}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {notification.content}
        </p>

        {notification.targetUrl && (
          <div className="pt-1">
            <Link
              href={"/account/orders"}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0d5c3a] hover:underline"
            >
              <span>Xem chi tiết</span>
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
        title="Xóa thông báo"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
