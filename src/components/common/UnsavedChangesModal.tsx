"use client";

import React from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  title?: string;
  subtitle?: string;
  description?: React.ReactNode;
  stayLabel?: string;
  discardLabel?: string;
  saveLabel?: string;
  onStay: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  isSubmitting = false,
  title = "Thay đổi chưa được lưu",
  subtitle = "Bạn đã chỉnh sửa nội dung nhưng chưa lưu lại.",
  description,
  stayLabel = "Ở lại trang",
  discardLabel = "Hủy bỏ & rời đi",
  saveLabel = "Lưu thay đổi",
  onStay,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStay}
            disabled={isSubmitting}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
          {description ?? (
            <>
              Bạn muốn <strong>lưu các thay đổi</strong> trước khi chuyển trang
              hay <strong>hủy bỏ</strong> nội dung vừa chỉnh sửa?
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onStay}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {stayLabel}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {discardLabel}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#0d5c3a] hover:bg-[#094229] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
