"use client";

import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DeleteVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  voucherCode?: string;
  loading?: boolean;
}

export default function DeleteVoucherModal({
  isOpen,
  onClose,
  onConfirm,
  voucherCode,
  loading = false,
}: DeleteVoucherModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Xác nhận vô hiệu Voucher
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">
              Bạn có chắc chắn muốn vô hiệu Voucher có mã{" "}
              <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                {voucherCode}
              </span>{" "}
              không?
            </p>
            <p className="text-xs text-slate-500">
              Hành động này sẽ không thể hoàn tác sau khi thực hiện.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? "Đang vô hiệu..." : "Vô hiệu"}
          </button>
        </div>
      </div>
    </div>
  );
}
