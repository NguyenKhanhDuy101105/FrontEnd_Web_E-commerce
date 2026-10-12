"use client";

import React from "react";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { User } from "@/src/utils/getUser";

interface BranchData {
  id: string;
  name: string;
  address: string;
  [key: string]: unknown;
}

interface UserCardProps {
  user: User | null;
  currentBranch: BranchData | null;
  isCollapsed: boolean;
  isMounted: boolean;
  onLogout: () => void;
}

export default function UserCard({
  user,
  currentBranch,
  isCollapsed,
  isMounted,
  onLogout,
}: UserCardProps) {
  const displayName = currentBranch?.name || user?.fullName || "UrbanMart";
  const firstLetter = displayName.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`border-t border-slate-800/80 bg-[#1e293b] ${
        isCollapsed ? "p-2" : "p-3"
      }`}
    >
      <div
        className={`bg-slate-800/90 rounded-xl flex items-center border border-slate-700/50 ${
          isCollapsed ? "p-2 justify-center" : "p-3 justify-between"
        }`}
      >
        <div
          className={`flex items-center shrink-0 ${
            isCollapsed ? "justify-center" : "space-x-3 overflow-hidden"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-[#0d5c3a] text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
            {isMounted ? firstLetter : "U"}
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <p
                className="text-xs font-bold text-white truncate whitespace-nowrap"
                title={currentBranch?.name || user?.fullName}
              >
                {isMounted
                  ? currentBranch?.name || user?.fullName || "Chi nhánh"
                  : "---"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate whitespace-nowrap">
                {isMounted ? user?.role || "BRANCH" : "---"}
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
