"use client";

import { useState } from "react";

export default function DashboardHeader() {
  const [filterPeriod, setFilterPeriod] = useState("month");

  const handleExportPDF = () => {
    // 💥 [API CALL HERE]: Gọi API xuất file Báo cáo PDF/Excel
    alert("Đang tải báo cáo tổng hợp...");
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900">
            Tổng quan hệ thống
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            Q4 Realtime
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Báo cáo kinh doanh, doanh thu và chỉ số tăng trưởng toàn chuỗi 48 siêu
          thị UrbanMart.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex text-xs font-medium text-slate-600 shadow-sm">
          {["Hôm nay", "7 ngày qua", "Tháng này", "Quý 3"].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setFilterPeriod(item)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterPeriod === item
                  ? "bg-slate-100 font-bold text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <select className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm font-semibold">
          <option>Tháng 10/2026</option>
          <option>Tháng 09/2026</option>
        </select>

        <button
          onClick={handleExportPDF}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          📄 Xuất PDF/Excel
        </button>

        <button className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm">
          📊 Tải báo cáo tổng hợp
        </button>
      </div>
    </div>
  );
}
