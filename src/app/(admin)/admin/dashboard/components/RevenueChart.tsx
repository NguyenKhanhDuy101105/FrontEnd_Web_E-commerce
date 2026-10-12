"use client";

export default function RevenueChart() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="font-black text-slate-900 text-base">
            Biến động Doanh thu & Đơn hàng
          </h3>
          <p className="text-xs text-slate-400">
            Phân bổ doanh số thực tế so với chỉ tiêu kế hoạch (01/10 -
            30/10/2026)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-600 rounded-full inline-block"></span>
            <span>Doanh thu thực</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 inline-block"></span>
            <span className="text-slate-500">Mục tiêu</span>
          </div>
        </div>
      </div>

      {/* Placeholder Biểu đồ Line/Bar Chart */}
      <div className="w-full h-64 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center relative p-4">
        {/* Tooltip mẫu hiển thị giống Ảnh 1 */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-emerald-400">📅 Thứ Năm, 24/10/2026</p>
          <p>
            Doanh thu: <span className="font-bold">485.250.000 đ</span>
          </p>
          <p>
            Sản lượng: <span className="font-bold">1.820 đơn (+14%)</span>
          </p>
        </div>
        <span className="text-xs text-slate-400">
          [Tích hợp Recharts / Chart.js Line Chart tại đây]
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block">Doanh số cao nhất/ngày</span>
          <span className="font-bold text-slate-800">
            512.400.000 đ (20/10)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Tốc độ hoàn thành KPI</span>
          <span className="font-bold text-emerald-600">
            102.4% Tốc độ chuẩn
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Đơn hàng đỉnh điểm</span>
          <span className="font-bold text-slate-800">
            2.140 đơn (Giờ vàng 17h-19h)
          </span>
        </div>
      </div>
    </div>
  );
}
