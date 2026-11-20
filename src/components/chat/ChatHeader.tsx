"use client";

import {
  XMarkIcon,
  SparklesIcon,
  UserIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

interface ChatHeaderProps {
  chatMode: "ai" | "staff";
  onSwitchMode: (mode: "ai" | "staff") => void;
  onClose: () => void;
}

export default function ChatHeader({
  chatMode,
  onSwitchMode,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="bg-[#1e293b] text-white p-3.5 sm:p-4 flex flex-col space-y-3 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            {chatMode === "ai" ? (
              <SparklesIcon className="w-5 h-5" />
            ) : (
              <BuildingStorefrontIcon className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-tight truncate">
              {chatMode === "ai"
                ? "Trợ lý AI UrbanMart"
                : "NV Chi nhánh Cầu Giấy"}
            </h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[10px] text-slate-300 font-medium truncate">
                {chatMode === "ai" ? "Trực tuyến 24/7" : "Đang sẵn sàng"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-800/90 p-1 rounded-xl flex items-center border border-slate-700/60">
        <button
          type="button"
          onClick={() => onSwitchMode("ai")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            chatMode === "ai"
              ? "bg-emerald-500 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <SparklesIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">Chat với AI</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchMode("staff")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            chatMode === "staff"
              ? "bg-emerald-500 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">Nhân viên Chi nhánh</span>
        </button>
      </div>
    </div>
  );
}
