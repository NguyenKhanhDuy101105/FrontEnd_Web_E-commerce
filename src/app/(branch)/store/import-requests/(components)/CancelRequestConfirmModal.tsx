"use client";

import React from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CancelRequestConfirmModalProps {
  isOpen: boolean;
  requestId: string | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelRequestConfirmModal({
  isOpen,
  requestId,
  isDeleting,
  onClose,
  onConfirm,
}: CancelRequestConfirmModalProps) {
  if (!isOpen || !requestId) return null;

  return (
    <div
      onClick={() => !isDeleting && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100 space-y-5"
      >
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Hủy yêu cầu nhập hàng?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn hủy phiếu yêu cầu{" "}
              <span className="font-mono font-bold text-slate-700">
                #{requestId.slice(0, 8)}
              </span>{" "}
              không? Chỉ có thể hủy khi phiếu đang ở trạng thái Chờ duyệt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Giữ lại
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}
