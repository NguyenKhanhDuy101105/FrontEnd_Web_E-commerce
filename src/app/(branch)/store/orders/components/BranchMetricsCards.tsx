"use client";

import React from "react";
import {
  DocumentTextIcon,
  ClockIcon,
  ArchiveBoxIcon,
  TruckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface MetricsCardsProps {
  totalOrders: number;
  pendingCount: number;
  processingCount: number;
  readyCount: number;
  totalRevenue: number;
  isLoading?: boolean;
}

export default function BranchMetricsCards({
  totalOrders,
  pendingCount,
  processingCount,
  readyCount,
  totalRevenue,
  isLoading = false,
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            TỔNG ĐƠN HÔM NAY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {isLoading ? "..." : totalOrders}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Đơn hàng tại chi nhánh
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <DocumentTextIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
            CẦN XỬ LÝ GẤP
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">
              {isLoading ? "..." : pendingCount}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md">
              Chờ xác nhận
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Đơn mới phát sinh
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <ClockIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            ĐANG SOẠN HÀNG
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">
              {isLoading ? "..." : processingCount}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Đang đóng gói/chuẩn bị
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <ArchiveBoxIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            SẴN SÀNG / CHỜ LẤY
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">
              {isLoading ? "..." : readyCount}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Đã xong, chờ Shipper/Khách
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <TruckIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            DOANH THU TẠM TÍNH
          </span>
          <div className="text-xl font-black text-emerald-700">
            {isLoading ? "..." : totalRevenue.toLocaleString("vi-VN")}{" "}
            <span className="text-xs font-normal">đ</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Tổng tiền danh sách hiện tại
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
          <BanknotesIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
