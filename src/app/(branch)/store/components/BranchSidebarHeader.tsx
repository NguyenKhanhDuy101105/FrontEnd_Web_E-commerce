"use client";

import React from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface BranchData {
  id: string;
  name: string;
  address: string;
  [key: string]: unknown;
}

interface BranchSidebarHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsMobileOpen: (value: boolean) => void;
  currentBranch: BranchData | null;
  isMounted: boolean;
}

export default function BranchSidebarHeader({
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen,
  currentBranch,
  isMounted,
}: BranchSidebarHeaderProps) {
  return (
    <div className="space-y-5">
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between px-1"
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center space-x-3 shrink-0 overflow-hidden">
            <div className="relative w-9 h-9 bg-white rounded-xl p-0.5 border border-slate-700/50 shadow-xs shrink-0 flex items-center justify-center">
              <Image
                src="/images/Logo.jpeg"
                alt="UrbanMart Logo"
                fill
                className="object-contain rounded-lg p-0.5"
                priority
              />
            </div>

            <div className="overflow-hidden">
              <h1 className="text-base font-black tracking-tight text-white leading-tight whitespace-nowrap">
                Urban
                <span className="text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
                  Mart
                </span>
              </h1>
              <p className="text-[10px] font-extrabold text-[#10b981] tracking-wider uppercase mt-0.5 whitespace-nowrap">
                BRANCH PORTAL
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
          className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer shrink-0 items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-6 h-6 text-[#10b981]" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div
        className={`bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer group ${
          isCollapsed ? "p-3 flex items-center justify-center" : "p-2.5"
        }`}
      >
        {isCollapsed ? (
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0 animate-pulse" />
        ) : (
          <div className="flex flex-col space-y-1 overflow-hidden">
            <p className="text-[10px] text-slate-400 font-medium leading-none pl-4.5">
              Chi nhánh trực thuộc
            </p>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0 animate-pulse" />
                <p
                  className="text-xs font-bold text-white truncate"
                  title={currentBranch?.name || currentBranch?.address}
                >
                  {isMounted
                    ? currentBranch?.name || "Đang tải chi nhánh..."
                    : "---"}
                </p>
              </div>
              <ChevronUpDownIcon className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
