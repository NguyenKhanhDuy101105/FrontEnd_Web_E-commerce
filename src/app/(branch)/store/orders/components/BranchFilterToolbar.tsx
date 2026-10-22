"use client";

import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BranchOrderStatus } from "@/src/services/store/branchOrderService";

interface FilterToolbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  isExpressOnly: boolean;
  onToggleExpress: () => void;

  statusCounts: Record<string, number>;
}

const TABS: { id: BranchOrderStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "PROCESSING", label: "Đang soạn hàng" },
  { id: "READY_FOR_PICKUP", label: "Chờ giao / Chờ nhận" },
  { id: "SHIPPING", label: "Đang vận chuyển" },
  { id: "DELIVERY_FAILED", label: "Giao thất bại" },
  { id: "COMPLETED", label: "Hoàn thành" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export default function BranchFilterToolbar({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  isExpressOnly,
  onToggleExpress,
  statusCounts,
}: FilterToolbarProps) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = statusCounts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? tab.id === "ALL"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-800 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-md ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-70">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo mã đơn hàng"
            className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isExpressOnly}
              onChange={onToggleExpress}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-orange-500 relative"></div>
            <span className="text-xs font-bold text-slate-700">
              Giao hỏa tốc
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
