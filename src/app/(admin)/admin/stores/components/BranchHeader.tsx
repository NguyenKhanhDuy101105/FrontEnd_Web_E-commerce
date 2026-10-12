"use client";

interface BranchHeaderProps {
  onOpenAddModal: () => void;
}

export default function BranchHeader({ onOpenAddModal }: BranchHeaderProps) {
  const handleExportExcel = () => {
    // 💥 [API CALL HERE]: Gọi API xuất file Excel báo cáo chi nhánh
    // axios.get("/api/admin/branches/export-excel", { responseType: 'blob' })
    alert("Đang tải file Excel báo cáo...");
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-black text-slate-900">
          Quản lý chuỗi chi nhánh
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handleExportExcel}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          📊 Xuất báo cáo Excel
        </button>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Thêm chi nhánh mới
        </button>
      </div>
    </div>
  );
}
