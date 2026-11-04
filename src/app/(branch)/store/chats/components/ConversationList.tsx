"use client";

import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export interface ChatConversation {
  id: string;
  customerName: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  status: "PENDING" | "PROCESSING" | "RESOLVED";
  phone: string;
  address: string;
  totalOrders: number;
  recentOrder?: {
    code: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
}

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedChatId: string;
  activeTab: "ALL" | "PENDING" | "PROCESSING";
  searchTerm: string;
  onSelectChat: (id: string) => void;
  onTabChange: (tab: "ALL" | "PENDING" | "PROCESSING") => void;
  onSearchChange: (value: string) => void;
}

export default function ConversationList({
  conversations,
  selectedChatId,
  activeTab,
  searchTerm,
  onSelectChat,
  onTabChange,
  onSearchChange,
}: ConversationListProps) {
  return (
    <div className="w-80 sm:w-88 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
      <div className="p-3.5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-slate-800 text-base">Tư vấn & Chat</h1>
          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-extrabold text-[11px] rounded-full border border-rose-100">
            4 chưa đọc
          </span>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onTabChange("ALL")}
            className={`flex-1 py-1 rounded-md transition ${
              activeTab === "ALL"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => onTabChange("PENDING")}
            className={`flex-1 py-1 rounded-md transition ${
              activeTab === "PENDING"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Chờ rep
          </button>
          <button
            type="button"
            onClick={() => onTabChange("PROCESSING")}
            className={`flex-1 py-1 rounded-md transition ${
              activeTab === "PROCESSING"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Đang tư vấn
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
        {conversations.map((item) => {
          const isSelected = item.id === selectedChatId;
          return (
            <div
              key={item.id}
              onClick={() => onSelectChat(item.id)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-emerald-50/70 border-l-4 border-emerald-600"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm">
                  {item.customerName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-xs text-slate-800 truncate">
                    {item.customerName}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.time}
                  </span>
                </div>

                <p className="text-xs text-slate-500 truncate leading-tight">
                  {item.lastMessage}
                </p>

                <div className="flex items-center justify-between mt-1.5">
                  {item.status === "PENDING" ? (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-xs font-bold">
                      Cần phản hồi
                    </span>
                  ) : item.status === "PROCESSING" ? (
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-xs font-bold">
                      Đang xử lý
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs font-medium">
                      Đã xong
                    </span>
                  )}

                  {item.unreadCount > 0 && (
                    <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {item.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
