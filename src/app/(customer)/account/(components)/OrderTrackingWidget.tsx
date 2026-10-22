"use client";

import React from "react";
import Link from "next/link";
import {
  TruckIcon,
  ClockIcon,
  InboxStackIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export interface OrderCounts {
  pending: number;
  packing: number;
  shipping: number;
  completed: number;
}

interface OrderTrackingWidgetProps {
  orderCounts?: OrderCounts;
  loading?: boolean;
}

export default function OrderTrackingWidget({
  orderCounts = { pending: 0, packing: 0, shipping: 0, completed: 0 },
  loading = false,
}: OrderTrackingWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="h-5 w-36 bg-slate-200 rounded"></div>
          <div className="h-4 w-20 bg-slate-200 rounded"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-50 p-3.5 rounded-lg border border-slate-100/80 text-center flex flex-col items-center justify-center min-h-22.5"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 mb-2"></div>
              <div className="h-3 w-20 bg-slate-200 rounded mb-1"></div>
              <div className="h-2.5 w-12 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2 text-[#0d5c3a] font-bold text-sm sm:text-base">
          <TruckIcon className="w-5 h-5 shrink-0" />
          <h2 className="text-slate-800">Theo dõi đơn hàng</h2>
        </div>
        <Link
          href="/account/orders"
          className="text-xs font-semibold text-[#0d5c3a] hover:underline"
        >
          Xem tất cả đơn &gt;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/account/orders?status=PENDING"
          className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-lg border border-slate-100/80 text-center relative flex flex-col items-center justify-center min-h-22.5 transition-all group"
        >
          {orderCounts.pending > 0 && (
            <span className="absolute -top-1.5 right-4 sm:right-6 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {orderCounts.pending}
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <ClockIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Chờ xác nhận</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {orderCounts.pending} đơn
          </p>
        </Link>

        <Link
          href="/account/orders?status=PROCESSING"
          className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-lg border border-slate-100/80 text-center relative flex flex-col items-center justify-center min-h-22.5 transition-all group"
        >
          {orderCounts.packing > 0 && (
            <span className="absolute -top-1.5 right-4 sm:right-6 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {orderCounts.packing}
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <InboxStackIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Đang đóng gói</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {orderCounts.packing} đơn
          </p>
        </Link>

        <Link
          href="/account/orders?status=SHIPPING"
          className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-lg border border-slate-100/80 text-center relative flex flex-col items-center justify-center min-h-22.5 transition-all group"
        >
          {orderCounts.shipping > 0 && (
            <span className="absolute -top-1.5 right-4 sm:right-6 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {orderCounts.shipping}
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <TruckIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Đang vận chuyển
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {orderCounts.shipping} đơn đang tới
          </p>
        </Link>

        <Link
          href="/account/orders?status=COMPLETED"
          className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-lg border border-slate-100/80 text-center relative flex flex-col items-center justify-center min-h-22.5 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <CheckCircleIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Đã giao thành công
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {orderCounts.completed} đơn
          </p>
        </Link>
      </div>
    </div>
  );
}
