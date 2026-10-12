"use client";

export default function SalesChannelBreakdown() {
  const channels = [
    {
      name: "Mobile App (iOS/Android)",
      value: "55%",
      amount: "7.067.500.000 đ",
      color: "bg-emerald-600",
    },
    {
      name: "Website UrbanMart.vn",
      value: "30%",
      amount: "3.855.000.000 đ",
      color: "bg-teal-500",
    },
    {
      name: "POS tại 48 Siêu thị",
      value: "15%",
      amount: "1.927.500.000 đ",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-slate-900 text-base">
          Tỷ trọng Kênh bán
        </h3>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
          Thực thu
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Phân bổ doanh thu giữa ứng dụng, website và siêu thị trực tiếp.
      </p>

      {/* Circle Donut Chart Placeholder */}
      <div className="flex justify-center py-2">
        <div className="w-36 h-36 rounded-full border-8 border-emerald-600 border-t-amber-500 border-r-teal-500 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            KÊNH CHÍNH
          </span>
          <span className="text-2xl font-black text-slate-900">55%</span>
          <span className="text-[10px] font-medium text-slate-500">
            UrbanMart App
          </span>
        </div>
      </div>

      {/* Danh sách Kênh */}
      <div className="space-y-2.5 text-xs">
        {channels.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
              <div>
                <p className="font-bold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.amount}</p>
              </div>
            </div>
            <span className="font-black text-slate-900 text-sm">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
        ⚡ <strong>Tăng trưởng App +24%:</strong> Nhờ chương trình "Đi chợ siêu
        tốc 2H & Freeship đơn tươi sống".
      </div>
    </div>
  );
}
