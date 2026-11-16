"use client";

import {
  ClockIcon,
  PencilSquareIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminBranchItem } from "@/src/services/admin/adminBranchService";

interface BranchListTabProps {
  branches: AdminBranchItem[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch?: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onEditBranch: (branch: AdminBranchItem) => void;
  onDeleteBranch: (branch: AdminBranchItem) => void;
}

const DAY_LABELS: Record<string, string> = {
  mon: "T2",
  tue: "T3",
  wed: "T4",
  thu: "T5",
  fri: "T6",
  sat: "T7",
  sun: "CN",
};

const formatOpeningHoursSummary = (openingHours?: Record<string, string>) => {
  if (!openingHours || Object.keys(openingHours).length === 0) {
    return { primary: "Chưa cập nhật", detail: "" };
  }

  const orderedKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const entries = orderedKeys
    .filter((k) => openingHours[k])
    .map((k) => ({ key: k, label: DAY_LABELS[k], time: openingHours[k] }));

  if (entries.length === 0) {
    const rawEntries = Object.entries(openingHours);
    return {
      primary: rawEntries[0][1],
      detail: rawEntries.map(([k, v]) => `${k}: ${v}`).join(" | "),
    };
  }

  const uniqueTimes = Array.from(new Set(entries.map((e) => e.time)));
  const detail = entries.map((e) => `${e.label}: ${e.time}`).join(" • ");

  if (uniqueTimes.length === 1 && entries.length === 7) {
    return { primary: `${uniqueTimes[0]} (Cả tuần)`, detail };
  }

  const weekdayTime = openingHours.mon;
  const weekendTime = openingHours.sat;
  if (weekdayTime && weekendTime && weekdayTime !== weekendTime) {
    return {
      primary: `T2-T6: ${weekdayTime}`,
      sub: `T7-CN: ${weekendTime}`,
      detail,
    };
  }

  return { primary: entries[0].time, detail };
};

export default function BranchListTab({
  branches,
  loading,
  searchTerm,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusFilterChange,
  onEditBranch,
  onDeleteBranch,
}: BranchListTabProps) {
  const handleClear = () => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      onSearchChange("");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo tên chi nhánh, địa chỉ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              title="Xóa tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full sm:w-auto text-xs border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="MAINTENANCE">Đang kiểm kê / Bảo trì</option>
          </select>
        </div>
      </div>

      <div className="block lg:hidden divide-y divide-slate-100">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Đang tải danh sách chi nhánh...
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Không tìm thấy chi nhánh nào phù hợp.
          </div>
        ) : (
          branches.map((item) => {
            const hoursInfo = formatOpeningHoursSummary(item.openingHours);
            return (
              <div key={item.id} className="py-3.5 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {item.name}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {item.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditBranch(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBranch(item)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Bảo trì"
                    >
                      <WrenchScrewdriverIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-slate-700 bg-slate-50 p-2 rounded-lg space-y-1">
                  <p className="line-clamp-2 text-slate-700">{item.address}</p>
                  <p className="text-[10px] text-slate-400">
                    Tọa độ: {item.lat}, {item.lng}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
                    <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {hoursInfo.primary}
                      {hoursInfo.sub ? ` | ${hoursInfo.sub}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.isWarehouse ? (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Kho tổng
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Siêu thị
                      </span>
                    )}

                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      Bán kính {item.deliveryRadiusKm} km
                    </span>
                  </div>

                  <div>
                    {item.status === "ACTIVE" ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        Đang bảo trì
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 whitespace-nowrap">Tên Chi Nhánh</th>
              <th className="py-3 px-3 whitespace-nowrap">Địa chỉ & Tọa độ</th>
              <th className="py-3 px-3 whitespace-nowrap">Hotline</th>
              <th className="py-3 px-3 whitespace-nowrap">Giờ hoạt động</th>
              <th className="py-3 px-3 whitespace-nowrap">Bán kính</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">
                Loại kho
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">
                Trạng thái
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  Đang tải danh sách chi nhánh...
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  Không tìm thấy chi nhánh nào phù hợp.
                </td>
              </tr>
            ) : (
              branches.map((item) => {
                const hoursInfo = formatOpeningHoursSummary(item.openingHours);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <p
                        className="truncate text-slate-700"
                        title={item.address}
                      >
                        {item.address}
                      </p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">
                        {item.lat}, {item.lng}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {item.phone}
                    </td>
                    <td
                      className="py-3 px-3 whitespace-nowrap"
                      title={hoursInfo.detail}
                    >
                      <span className="text-slate-700 font-semibold block">
                        {hoursInfo.primary}
                      </span>
                      {hoursInfo.sub && (
                        <span className="text-[10px] text-slate-500 block">
                          {hoursInfo.sub}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                        {item.deliveryRadiusKm} km
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.isWarehouse ? (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Kho tổng
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Siêu thị
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.status === "ACTIVE" ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Đang bảo trì
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditBranch(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteBranch(item)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Bảo trì"
                        >
                          <WrenchScrewdriverIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
