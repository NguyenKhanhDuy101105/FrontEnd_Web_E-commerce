"use client";

import { useEffect, useState } from "react";

export default function StatCards() {
  const [stats, setStats] = useState({
    gmv: 12850000000,
    gmvGrowth: 15.2,
    targetGmv: 14000000000,
    orders: 45280,
    orderGrowth: 8.4,
    fulfillmentRate: 98.2,
    aov: 283800,
    aovGrowth: 3.1,
    activeUsers: 128400,
    retentionRate: 68,
    vipMembers: 24500,
  });

  // 💥 [API CALL HERE]: Lấy các chỉ số KPI thống kê từ Backend
  useEffect(() => {
    /*
    async function fetchStats() {
      const res = await axios.get('/api/admin/dashboard/stats');
      setStats(res.data);
    }
    fetchStats();
    */
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Tổng doanh thu */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          TỔNG DOANH THU (GMV)
        </span>
        <div className="text-2xl font-black text-slate-900">
          {stats.gmv.toLocaleString("vi-VN")} đ
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
            ↗ +{stats.gmvGrowth}% vs tháng trước
          </span>
          <span className="text-slate-400 text-[11px]">
            Mục tiêu: 14 Tỷ (Đạt 91.8%)
          </span>
        </div>
      </div>

      {/* Card 2: Tổng đơn hàng */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            TỔNG ĐƠN HÀNG
          </span>
          <span className="text-slate-400">🛍️</span>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {stats.orders.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-500">đơn</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
            ↗ +{stats.orderGrowth}% (48 chi nhánh)
          </span>
          <span className="text-slate-500 text-[11px]">
            {stats.fulfillmentRate}% Hoàn thành đúng giờ
          </span>
        </div>
      </div>

      {/* Card 3: Giá trị TB / Đơn */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            GIÁ TRỊ TB / ĐƠN (AOV)
          </span>
          <span className="text-slate-400">📄</span>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {stats.aov.toLocaleString("vi-VN")}{" "}
          <span className="text-xs font-normal text-slate-500">đ</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
            ↗ +{stats.aovGrowth}% vs Quý 2
          </span>
          <span className="text-slate-500 text-[11px]">
            +12.500 đ từ combo rau thịt
          </span>
        </div>
      </div>

      {/* Card 4: Khách hàng hoạt động */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            KHÁCH HÀNG HOẠT ĐỘNG
          </span>
          <span className="text-slate-400">👥</span>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {stats.activeUsers.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-500">user</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
            {stats.retentionRate}% Retention quay lại
          </span>
          <span className="text-slate-500 text-[11px]">
            VIP Members: {stats.vipMembers.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
