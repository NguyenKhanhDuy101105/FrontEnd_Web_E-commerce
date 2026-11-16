"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ReasonModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const MAX_REASON_LENGTH = 255;

export default function ReasonModal({
  isOpen,
  title,
  description,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;

    if (rawValue.length > MAX_REASON_LENGTH) {
      setReason(rawValue.slice(0, MAX_REASON_LENGTH));
      setError(`Mô tả quá dài! Tối đa ${MAX_REASON_LENGTH} ký tự.`);
      return;
    }

    setReason(rawValue);

    if (rawValue.length > 0 && !rawValue.trim()) {
      setError("Lý do không được chỉ chứa khoảng trắng.");
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Vui lòng nhập lý do.");
      return;
    }

    if (trimmedReason.length > MAX_REASON_LENGTH) {
      setError(`Mô tả quá dài! Tối đa ${MAX_REASON_LENGTH} ký tự.`);
      return;
    }

    setError(null);
    onSubmit(trimmedReason);
    setReason("");
  };

  const isInvalid = !reason.trim() || reason.trim().length > MAX_REASON_LENGTH;

  return (
    <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative space-y-4 z-101">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
          <div className="space-y-1.5">
            <textarea
              value={reason}
              onChange={handleChange}
              placeholder="Nhập lý do chi tiết vào đây..."
              rows={3}
              maxLength={MAX_REASON_LENGTH}
              required
              disabled={isSubmitting}
              className={`w-full p-3 text-xs border rounded-lg focus:outline-none transition ${
                error
                  ? "border-rose-500 focus:border-rose-600 bg-rose-50/30"
                  : "border-slate-200 focus:border-emerald-600"
              }`}
            />

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-rose-600 font-medium">
                {error ? error : ""}
              </span>
              <span
                className={`font-semibold ml-auto ${
                  reason.length >= MAX_REASON_LENGTH
                    ? "text-rose-600"
                    : "text-slate-400"
                }`}
              >
                {reason.length}/{MAX_REASON_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isInvalid}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
