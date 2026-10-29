"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PaperClipIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/src/utils/toast";

interface Message {
  id: string;
  sender: "user" | "bot" | "staff" | "system";
  text: string;
  timestamp: string;
}

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatMode, setChatMode] = useState<"ai" | "staff">("ai");
  const [inputMessage, setInputMessage] = useState<string>("");

  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Xin chào! Trợ lý AI UrbanMart có thể giúp gì cho bạn hôm nay?",
      timestamp: "10:00",
    },
  ]);

  const [staffMessages, setStaffMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "system",
      text: "Bạn đã kết nối với nhân viên tư vấn Chi nhánh Cầu Giấy - Hà Nội.",
      timestamp: "10:01",
    },
    {
      id: "2",
      sender: "staff",
      text: "Chào bạn, mình là Linh - Nhân viên chi nhánh Cầu Giấy. Mình có thể hỗ trợ kiểm tra đơn hàng hoặc sản phẩm giúp bạn ạ!",
      timestamp: "10:01",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkAuth = (): boolean => {
    if (typeof window === "undefined") return false;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      showToast.error("Vui lòng đăng nhập để sử dụng tính năng hỗ trợ chat!");
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    return true;
  };

  const handleToggleWidget = () => {
    if (!isOpen) {
      if (!checkAuth()) return;
    }
    setIsOpen(!isOpen);
  };

  const handleSwitchMode = (mode: "ai" | "staff") => {
    if (!checkAuth()) return;
    setChatMode(mode);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, chatMode, aiMessages, staffMessages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!checkAuth()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (chatMode === "ai") {
      setAiMessages((prev) => [...prev, newMsg]);
      setInputMessage("");

      setTimeout(() => {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Cảm ơn bạn! Hệ thống AI đang xử lý yêu cầu của bạn...",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setAiMessages((prev) => [...prev, botReply]);
      }, 1000);
    } else {
      setStaffMessages((prev) => [...prev, newMsg]);
      setInputMessage("");
    }
  };

  const quickPrompts = [
    "Sản phẩm khuyến mãi hôm nay",
    "Thời gian giao hàng bao lâu?",
    "Chính sách đổi trả hỏng hóc",
  ];

  const handleQuickPrompt = (promptText: string) => {
    if (!checkAuth()) return;
    setInputMessage(promptText);
  };

  const currentMessages = chatMode === "ai" ? aiMessages : staffMessages;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggleWidget}
          aria-label="Mở cửa sổ hỗ trợ"
          className="relative w-14 h-14 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
        >
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
          )}

          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
          )}

          {isOpen ? (
            <XMarkIcon className="w-7 h-7 text-white transition-transform duration-300 rotate-90" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-105 h-145 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="bg-[#1e293b] text-white p-4 flex flex-col space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                {chatMode === "ai" ? (
                  <SparklesIcon className="w-5 h-5" />
                ) : (
                  <BuildingStorefrontIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">
                  {chatMode === "ai"
                    ? "Trợ lý AI UrbanMart"
                    : "NV Chi nhánh Cầu Giấy"}
                </h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-300 font-medium">
                    {chatMode === "ai" ? "Trực tuyến 24/7" : "Đang sẵn sàng"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-800/90 p-1 rounded-xl flex items-center border border-slate-700/60">
            <button
              type="button"
              onClick={() => handleSwitchMode("ai")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                chatMode === "ai"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Chat với AI</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode("staff")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                chatMode === "staff"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Nhân viên Chi nhánh</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
          {currentMessages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div
                  key={msg.id}
                  className="text-center my-2 px-3 py-1.5 bg-slate-200/80 rounded-xl text-[11px] font-medium text-slate-600"
                >
                  {msg.text}
                </div>
              );
            }

            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 text-xs leading-relaxed ${
                    isUser
                      ? "bg-emerald-600 text-white rounded-2xl rounded-tr-xs shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-xs shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {chatMode === "ai" && (
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 flex space-x-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-slate-200/80 flex items-center space-x-2 shrink-0"
        >
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              chatMode === "ai"
                ? "Hỏi AI Bot bất kỳ điều gì..."
                : "Nhập tin nhắn cho nhân viên..."
            }
            className="flex-1 bg-slate-100 text-slate-800 placeholder-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hidden sm:block"
          >
            <FaceSmileIcon className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
