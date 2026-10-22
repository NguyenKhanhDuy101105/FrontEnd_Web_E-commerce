"use client";

import React from "react";
import {
  QrCodeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function BranchHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
          Quản lý đơn hàng
        </h1>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <QrCodeIcon className="w-4 h-4 text-slate-600" />
          <span>Quét mã vạch (F2)</span>
        </button>

        <button
          type="button"
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <PrinterIcon className="w-4 h-4 text-slate-600" />
          <span>In danh sách nhặt</span>
        </button>

        <button
          type="button"
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span>Xuất báo cáo Excel</span>
        </button>
      </div>
    </div>
  );
}
