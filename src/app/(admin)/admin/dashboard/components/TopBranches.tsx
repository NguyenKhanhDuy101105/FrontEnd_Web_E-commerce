"use client";

export default function TopBranches() {
  const topBranches = [
    {
      rank: 1,
      name: "UrbanMart Quận 1",
      address: "Bến Nghé - HCM",
      revenue: "1.850.000.000 đ",
      kpi: "108% KPI",
      mom: "+16.4% MoM",
    },
    {
      rank: 2,
      name: "UrbanMart Cầu Giấy",
      address: "Flagship - Hà Nội",
      revenue: "1.620.000.000 đ",
      kpi: "104% KPI",
      mom: "+12.1% MoM",
    },
    {
      rank: 3,
      name: "UrbanMart Landmark Plus",
      address: "Bình Thạnh",
      revenue: "1.480.000.000 đ",
      kpi: "99% KPI",
      mom: "+8.9% MoM",
    },
    {
      rank: 4,
      name: "UrbanMart Hoàn Kiếm",
      address: "Trần Hưng Đạo - HN",
      revenue: "1.340.000.000 đ",
      kpi: "96% KPI",
      mom: "+5.2% MoM",
    },
    {
      rank: 5,
      name: "UrbanMart Mỹ Đình",
      address: "KĐT Mỹ Đình 1 - HN",
      revenue: "1.150.000.000 đ",
      kpi: "92% KPI",
      mom: "+4.8% MoM",
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-slate-900 text-base">
          🏆 Top Chi nhánh Doanh thu Cao nhất
        </h3>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
          Top 5 / 48
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Xếp hạng chi nhánh vượt chỉ tiêu cam kết trong tháng 10.
      </p>

      <div className="space-y-2.5 text-xs">
        {topBranches.map((item) => (
          <div
            key={item.rank}
            className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white text-xs ${item.rank === 1 ? "bg-emerald-800" : "bg-slate-400"}`}
              >
                {item.rank}
              </span>
              <div>
                <p className="font-bold text-slate-900">
                  {item.name}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({item.address})
                  </span>
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">
                  {item.kpi} • {item.mom}
                </p>
              </div>
            </div>
            <span className="font-black text-slate-900 text-sm">
              {item.revenue}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-400">Tổng 48 siêu thị trên toàn quốc</span>
        <button className="text-emerald-700 font-bold hover:underline">
          Xem toàn bộ 48 chi nhánh ➔
        </button>
      </div>
    </div>
  );
}
