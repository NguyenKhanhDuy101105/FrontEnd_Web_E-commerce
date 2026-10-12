"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AdminBranchItem } from "@/src/services/admin/adminBranchService";

interface BranchListTabProps {
  branches: AdminBranchItem[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onEditBranch: (branch: AdminBranchItem) => void;
  onDeleteBranch: (branch: AdminBranchItem) => void;
}

export default function BranchListTab({
  branches,
  loading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onEditBranch,
  onDeleteBranch,
}: BranchListTabProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-70">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên chi nhánh, địa chỉ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="MAINTENANCE">Đang kiểm kê / Bảo trì</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Tên Chi Nhánh</th>
              <th className="py-3 px-3">Địa chỉ & Tọa độ</th>
              <th className="py-3 px-3">Hotline</th>
              <th className="py-3 px-3">Bán kính</th>
              <th className="py-3 px-3 text-center">Loại kho</th>
              <th className="py-3 px-3 text-center">Trạng thái</th>
              <th className="py-3 px-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Đang tải danh sách chi nhánh...
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Không tìm thấy chi nhánh nào phù hợp.
                </td>
              </tr>
            ) : (
              branches.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">
                      {item.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="truncate text-slate-700" title={item.address}>
                      {item.address}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      📍 {item.lat}, {item.lng}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{item.phone}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                      {item.deliveryRadiusKm} km
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
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
                  <td className="py-3 px-3 text-center">
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
                  <td className="py-3 px-3 text-center">
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
                        onClick={() => onDeleteBranch(item)} // 💥 Truyền nguyên đối tượng item vào callback xóa
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
