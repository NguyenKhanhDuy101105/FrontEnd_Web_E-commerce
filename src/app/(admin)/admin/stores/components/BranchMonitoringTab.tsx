"use client";

import { useEffect, useState } from "react";

export default function BranchMonitoringTab() {
  // Fake Data Thống kê KPIs
  const [metrics, setMetrics] = useState({
    totalBranches: 48,
    onlineBranches: 45,
    todayOrders: 1245,
    deliveringOrders: 182,
    todayChainRevenue: 450000000,
    outOfStockAlerts: 12,
  });

  // 💥 [API CALL HERE]: Fetch real-time monitoring data
  useEffect(() => {
    /*
    const interval = setInterval(async () => {
      const res = await axios.get('/api/admin/branches/realtime-monitoring');
      setMetrics(res.data);
    }, 15000); // 15 giây poll 1 lần
    return () => clearInterval(interval);
    */
  }, []);

  return (
    <div className="space-y-5">
      {/* 1. Khối 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold">
            Tổng số chi nhánh
          </span>
          <div className="text-2xl font-black text-slate-900">
            {metrics.totalBranches} Siêu thị
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            🟢 {metrics.onlineBranches} Hoạt động
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold">
            Đơn trực tuyến hôm nay
          </span>
          <div className="text-2xl font-black text-slate-900">
            {metrics.todayOrders.toLocaleString()} đơn
          </div>
          <div className="text-[11px] text-slate-500">
            🚚 {metrics.deliveringOrders} đang giao
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold">
            Doanh thu chuỗi (Hôm nay)
          </span>
          <div className="text-2xl font-black text-emerald-800">
            {metrics.todayChainRevenue.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            ↗ +12.4% so với hôm qua
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold">
            Cảnh báo tồn kho khẩn
          </span>
          <div className="text-2xl font-black text-rose-600">
            {metrics.outOfStockAlerts} Điểm bán
          </div>
          <div className="text-[11px] text-rose-500 font-bold">
            ⚠️ Rau quả & Hàng tươi sắp cạn
          </div>
        </div>
      </div>

      {/* 2. Khối Bản đồ & Top doanh thu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bản đồ Geofence */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">
              Bản đồ Geofence & Tín hiệu Radar
            </h3>
            <span className="text-xs text-emerald-700 font-bold cursor-pointer">
              Phóng to bản đồ ↗
            </span>
          </div>
          <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300 relative">
            <span className="text-xs text-slate-400">
              [Tích hợp Leaflet / Google Maps Component tại đây]
            </span>
          </div>
        </div>

        {/* Top Doanh thu hôm nay */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900">
            🏆 Top Doanh thu hôm nay
          </h3>
          <div className="space-y-2.5 text-xs">
            {[
              { name: "UrbanMart Quận 1", val: "72.450.000 đ", target: "115%" },
              {
                name: "UrbanMart Cầu Giấy",
                val: "64.820.000 đ",
                target: "108%",
              },
              {
                name: "UrbanMart Landmark Plus",
                val: "58.200.000 đ",
                target: "102%",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"
              >
                <span className="font-semibold text-slate-700">
                  {idx + 1}. {item.name}
                </span>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{item.val}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    {item.target}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bảng Giám Sát Vận Hành Thới Gian Thực */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900">
          Bảng giám sát vận hành thời gian thực (POS / ERP)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-2.5 px-3">Điểm bán</th>
                <th className="py-2.5 px-3">Kết nối POS/ERP</th>
                <th className="py-2.5 px-3">Tải đơn (Queue)</th>
                <th className="py-2.5 px-3">SLA Giao trễ</th>
                <th className="py-2.5 px-3">Tồn kho & Cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-3 font-bold">UrbanMart Cầu Giấy</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">
                  🟢 Online 99.9%
                </td>
                <td className="py-3 px-3">88% (Tải cao)</td>
                <td className="py-3 px-3 text-slate-700">
                  22 phút (Đạt chuẩn)
                </td>
                <td className="py-3 px-3">
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    ⚠️ Mất 2 SKU rau hữu cơ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
