"use client";

import React from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";

interface ChatInputAreaProps {
  chatMode: "ai" | "staff";
  inputMessage: string;
  isAiLoading: boolean;
  quickPrompts: string[];
  onInputChange: (value: string) => void;
  onQuickPrompt: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInputArea({
  chatMode,
  inputMessage,
  isAiLoading,
  quickPrompts,
  onInputChange,
  onQuickPrompt,
  onSubmit,
}: ChatInputAreaProps) {
  return (
    <>
      {chatMode === "ai" && (
        <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAiLoading}
              onClick={() => onQuickPrompt(prompt)}
              className="text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="p-2.5 sm:p-3 bg-white border-t border-slate-200/80 flex items-center space-x-1.5 sm:space-x-2 shrink-0"
      >
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer shrink-0"
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputMessage}
          disabled={chatMode === "ai" && isAiLoading}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={
            chatMode === "ai"
              ? "Nhập tên món ăn hoặc nguyên liệu..."
              : "Nhập tin nhắn cho nhân viên..."
          }
          className="flex-1 min-w-0 bg-slate-100 text-slate-800 placeholder-slate-400 text-xs rounded-full px-3.5 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        />

        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hidden sm:block shrink-0"
        >
          <FaceSmileIcon className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!inputMessage.trim() || (chatMode === "ai" && isAiLoading)}
          className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}
