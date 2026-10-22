"use client";

import React from "react";
import {
  ClockIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { OrderGroup } from "@/src/services/customer/orderService";

export interface StatusCounts {
  pending: number;
  processing: number;
  shipping: number;
  completed: number;
}

interface OrderTrackingWidgetProps {
  statusCounts: StatusCounts;
  activeGroup: OrderGroup;
  onSelectGroup: (group: OrderGroup) => void;
}

export default function OrderTrackingWidget({
  statusCounts,
  activeGroup,
  onSelectGroup,
}: OrderTrackingWidgetProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
        <TruckIcon className="w-5 h-5 text-emerald-600" />
        Quản lý đơn hàng
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onSelectGroup("PENDING")}
          className={`relative bg-slate-50/70 hover:bg-slate-50 p-3.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-22.5 group ${
            activeGroup === "PENDING"
              ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30"
              : "border-slate-100/80"
          }`}
        >
          {statusCounts.pending > 0 && (
            <span className="absolute -top-1.5 right-4 sm:right-6 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {statusCounts.pending}
            </span>
          )}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Chờ xác nhận
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {statusCounts.pending} đơn
          </span>
        </div>

        <div
          onClick={() => onSelectGroup("PROCESSING")}
          className={`relative bg-slate-50/70 hover:bg-slate-50 p-3.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-22.5 group ${
            activeGroup === "PROCESSING"
              ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30"
              : "border-slate-100/80"
          }`}
        >
          {statusCounts.processing > 0 && (
            <span className="absolute -top-1.5 right-4 sm:right-6 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {statusCounts.processing}
            </span>
          )}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <ArchiveBoxIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Đang đóng gói
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {statusCounts.processing} đơn
          </span>
        </div>

        <div
          onClick={() => onSelectGroup("WAITING")}
          className={`relative bg-slate-50/70 hover:bg-slate-50 p-3.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-22.5 group ${
            activeGroup === "WAITING"
              ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30"
              : "border-slate-100/80"
          }`}
        >
          {statusCounts.shipping > 0 && (
            <span className="absolute -top-1.5 right-4 sm:right-6 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {statusCounts.shipping}
            </span>
          )}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Đang vận chuyển
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {statusCounts.shipping} đơn đang tới
          </span>
        </div>

        <div
          onClick={() => onSelectGroup("COMPLETED")}
          className={`relative bg-slate-50/70 hover:bg-slate-50 p-3.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-22.5 group ${
            activeGroup === "COMPLETED"
              ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30"
              : "border-slate-100/80"
          }`}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Đã giao thành công
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {statusCounts.completed} đơn
          </span>
        </div>
      </div>
    </div>
  );
}
