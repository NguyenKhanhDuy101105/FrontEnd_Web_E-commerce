"use client";

export default function CategoryRevenue() {
  const categories = [
    {
      name: "Thịt tươi, cá & hải sản nhập khẩu",
      amount: "4.820.000.000 đ",
      percent: "37.5%",
      width: "w-[75%]",
    },
    {
      name: "Rau củ hữu cơ & Trái cây nhiệt đới",
      amount: "3.980.000.000 đ",
      percent: "31.0%",
      width: "w-[62%]",
    },
    {
      name: "Sữa tươi & Sản phẩm bơ sữa organic",
      amount: "2.310.000.000 đ",
      percent: "18.0%",
      width: "w-[36%]",
    },
    {
      name: "Đồ uống & Bánh kẹo nhập khẩu cao cấp",
      amount: "1.740.000.000 đ",
      percent: "13.5%",
      width: "w-[27%]",
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-slate-900 text-base">
          Doanh thu theo Danh mục Sản phẩm
        </h3>
        <span className="text-xs text-slate-400 font-semibold">T10/2026</span>
      </div>

      <p className="text-xs text-slate-400">
        Tỷ lệ đóng góp doanh số giữa các nhóm ngành hàng thiết yếu.
      </p>

      <div className="space-y-4 text-xs">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>🟢 {cat.name}</span>
              <span>
                {cat.amount}{" "}
                <span className="text-slate-400 font-normal">
                  ({cat.percent})
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-emerald-800 rounded-full ${cat.width}`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-400">Hiển thị 4/18 nhóm danh mục lớn</span>
        <button className="text-emerald-700 font-bold hover:underline">
          Xem báo cáo chi tiết SKU ➔
        </button>
      </div>
    </div>
  );
}
