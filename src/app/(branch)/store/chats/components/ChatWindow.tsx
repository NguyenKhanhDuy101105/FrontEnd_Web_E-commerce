"use client";

import React from "react";
import Image from "next/image";
import {
  PaperAirplaneIcon,
  PhotoIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ChatConversation } from "./ConversationList";

export interface ChatMessage {
  id: string;
  sender: "CUSTOMER" | "STAFF";
  text: string;
  time: string;
  productCard?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    unit: string;
  };
}

interface ChatWindowProps {
  selectedCustomer?: ChatConversation;
  messages: ChatMessage[];
  inputText: string;
  quickReplies: string[];
  onInputChange: (value: string) => void;
  onSendMessage: (text?: string) => void;
}

export default function ChatWindow({
  selectedCustomer,
  messages,
  inputText,
  quickReplies,
  onInputChange,
  onSendMessage,
}: ChatWindowProps) {
  if (!selectedCustomer) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
        Chọn một cuộc trò chuyện để bắt đầu tư vấn
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
      <div className="p-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs">
            {selectedCustomer.customerName.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-slate-800">
              {selectedCustomer.customerName}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="text-emerald-600 font-semibold">Online</span>
              <span>•</span>
              <span>SĐT: {selectedCustomer.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Đánh dấu xong</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="text-center my-2">
          <span className="text-[11px] text-slate-400 bg-slate-200/60 px-3 py-1 rounded-full font-medium">
            Hôm nay
          </span>
        </div>

        {messages.map((msg) => {
          const isStaff = msg.sender === "STAFF";
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isStaff ? "justify-end" : "justify-start"
              }`}
            >
              {!isStaff && (
                <div className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                  {selectedCustomer.customerName.charAt(0)}
                </div>
              )}

              <div
                className={`max-w-[75%] space-y-1.5 rounded-2xl p-3 text-xs shadow-2xs ${
                  isStaff
                    ? "bg-emerald-700 text-white rounded-br-xs"
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-xs"
                }`}
              >
                {msg.productCard && (
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-800 flex items-center gap-2.5 mb-1">
                    <div className="relative w-11 h-11 bg-white rounded-lg border border-slate-100 shrink-0 overflow-hidden">
                      <Image
                        src={msg.productCard.imageUrl}
                        alt={msg.productCard.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-[11px]">
                      <p className="font-bold truncate text-slate-800">
                        {msg.productCard.name}
                      </p>
                      <p className="font-black text-emerald-700 mt-0.5">
                        {msg.productCard.price.toLocaleString("vi-VN")}đ /{" "}
                        {msg.productCard.unit}
                      </p>
                    </div>
                  </div>
                )}

                <p className="leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
                <span
                  className={`block text-[10px] text-right font-medium ${
                    isStaff ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-white border-t border-slate-200/80 shrink-0 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
            Mẫu:
          </span>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(reply)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-medium rounded-full transition whitespace-nowrap shrink-0 cursor-pointer border border-slate-200/60"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Gửi hình ảnh"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="Nhập câu trả lời tư vấn cho khách hàng..."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
            className="flex-1 py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          />

          <button
            type="button"
            onClick={() => onSendMessage()}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer shrink-0"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
