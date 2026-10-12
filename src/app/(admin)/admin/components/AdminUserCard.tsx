"use client";

import React from "react";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { User } from "@/src/utils/getUser";

interface AdminUserCardProps {
  user: User | null;
  isCollapsed: boolean;
  isMounted: boolean;
  firstLetter: string;
  onLogout: () => void;
}

export default function AdminUserCard({
  user,
  isCollapsed,
  isMounted,
  firstLetter,
  onLogout,
}: AdminUserCardProps) {
  return (
    <div
      className={`border-t border-zinc-800/80 bg-[#0f172a] ${
        isCollapsed ? "p-2" : "p-3"
      }`}
    >
      <div
        className={`bg-zinc-900 rounded-xl flex items-center border border-zinc-800 ${
          isCollapsed ? "p-2 justify-center" : "p-3 justify-between"
        }`}
      >
        <div
          className={`flex items-center shrink-0 ${
            isCollapsed ? "justify-center" : "space-x-3 overflow-hidden"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-md">
            {isMounted ? firstLetter : "A"}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate whitespace-nowrap">
                {isMounted ? user?.fullName || "Admin System" : "---"}
              </p>
              <p className="text-[10px] text-indigo-400 font-semibold truncate whitespace-nowrap">
                Quản trị viên
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
