"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { AdminBranchItem } from "@/src/services/admin/adminBranchService";

interface DeleteBranchModalProps {
  isOpen: boolean;
  branch: AdminBranchItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (branchId: string) => void;
}

export default function DeleteBranchModal({
  isOpen,
  branch,
  loading = false,
  onClose,
  onConfirm,
}: DeleteBranchModalProps) {
  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">
              Xác nhận xóa chi nhánh
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa chi nhánh{" "}
              <span className="font-bold text-slate-800">"{branch.name}"</span>{" "}
              không?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(branch.id)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
