"use client";

import React, { useEffect } from "react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ClearCartConfirmModalProps {
  isOpen: boolean;
  itemCount: number;
  isClearing?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClearCartConfirmModal({
  isOpen,
  itemCount,
  isClearing = false,
  onClose,
  onConfirm,
}: ClearCartConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isClearing) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClearing, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        if (!isClearing) onClose();
      }}
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px] animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg bg-white p-5 sm:p-6 shadow-xl border border-slate-100 space-y-5"
      >
        <button
          type="button"
          disabled={isClearing}
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3.5 top-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <TrashIcon className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Xóa toàn bộ giỏ hàng?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa tất cả{" "}
              <span className="font-bold text-slate-700">
                {itemCount} sản phẩm
              </span>{" "}
              trong giỏ hàng không? Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isClearing}
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={isClearing}
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isClearing ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
