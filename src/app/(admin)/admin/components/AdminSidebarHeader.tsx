"use client";

import React from "react";
import Image from "next/image";
import {
  BuildingStorefrontIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface AdminSidebarHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsMobileOpen: (value: boolean) => void;
}

export default function AdminSidebarHeader({
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen,
}: AdminSidebarHeaderProps) {
  return (
    <div className="space-y-5">
      {/* Brand & Toggle Section */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between px-1"
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center space-x-3 shrink-0 overflow-hidden">
            <div className="relative w-9 h-9 bg-indigo-600 rounded-xl p-0.5 border border-indigo-500/30 shadow-md shrink-0 flex items-center justify-center text-white">
              <Image
                src="/images/Logo.jpeg"
                alt="UrbanMart Logo"
                fill
                className="object-contain rounded-lg p-0.5 bg-white"
                priority
              />
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-black tracking-tight text-white leading-tight whitespace-nowrap">
                  Urban<span className="text-green-400">Mart</span>
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Close Button on Mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Collapse Toggle on Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
          className="hidden lg:flex p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer shrink-0 items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-6 h-6 text-indigo-400" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Scope Selector Indicator */}
      <div
        className={`bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all cursor-pointer group ${
          isCollapsed ? "p-3 flex items-center justify-center" : "p-2.5"
        }`}
      >
        {isCollapsed ? (
          <BuildingStorefrontIcon className="w-5 h-5 text-indigo-400 shrink-0" />
        ) : (
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-xs font-bold text-white truncate">
                Toàn bộ chuỗi Siêu thị
              </p>
            </div>
            <ChevronUpDownIcon className="w-4 h-4 text-zinc-400 group-hover:text-white shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
