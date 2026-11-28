"use client";

import React, { useState, useMemo } from "react";
import {
  XMarkIcon,
  TagIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CreateFoodTagPayload } from "@/src/services/admin/adminIncompatibilityService";

interface FoodTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateFoodTagPayload) => Promise<void>;
  existingCodes?: string[];
}

export default function FoodTagModal({
  isOpen,
  onClose,
  onSubmit,
  existingCodes = [],
}: FoodTagModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState<{ code: boolean; name: boolean }>({
    code: false,
    name: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const normalizedExistingCodes = useMemo(
    () => new Set(existingCodes.map((c) => c.trim().toUpperCase())),
    [existingCodes],
  );

  const codeError = useMemo(() => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return "Vui lòng nhập mã nhãn.";
    }
    if (trimmed.length < 2) {
      return "Mã nhãn phải có ít nhất 2 ký tự.";
    }
    if (trimmed.length > 50) {
      return "Mã nhãn không được vượt quá 50 ký tự.";
    }
    if (!/^[A-Z0-9_]+$/.test(trimmed)) {
      return "Chỉ cho phép chữ cái in hoa không dấu (A-Z), số (0-9) và dấu gạch dưới (_).";
    }
    if (
      trimmed.startsWith("_") ||
      trimmed.endsWith("_") ||
      trimmed.includes("__")
    ) {
      return "Dấu gạch dưới không được nằm ở đầu, cuối hoặc lặp liên tiếp (__).";
    }
    if (normalizedExistingCodes.has(trimmed)) {
      return `Mã nhãn "${trimmed}" đã tồn tại trong hệ thống.`;
    }
    return "";
  }, [code, normalizedExistingCodes]);

  const nameError = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "Vui lòng nhập tên hiển thị nhãn.";
    }
    if (trimmed.length < 2) {
      return "Tên hiển thị phải có ít nhất 2 ký tự.";
    }
    if (trimmed.length > 100) {
      return "Tên hiển thị không được vượt quá 100 ký tự.";
    }
    return "";
  }, [name]);

  const isFormValid = !codeError && !nameError;

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setCode("");
    setName("");
    setTouched({ code: false, name: false });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ code: true, name: true });

    if (!isFormValid || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit({
        code: code.trim().toUpperCase(),
        name: name.trim(),
      });
      setCode("");
      setName("");
      setTouched({ code: false, name: false });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const showCodeError = (touched.code || code.length > 0) && Boolean(codeError);
  const showNameError = (touched.name || name.length > 0) && Boolean(nameError);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <TagIcon className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-800">
              Tạo nhãn thực phẩm mới
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã nhãn (Code / Slug) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: HAI_SAN, VITAMIN_C, TRUNG"
              value={code}
              onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
              }}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none font-mono uppercase transition-colors ${
                showCodeError
                  ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {showCodeError ? (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{codeError}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                Mã định danh viết hoa không dấu, ngăn cách bằng dấu gạch dưới.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên hiển thị nhãn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Hải sản, Vitamin C, Sữa & Chế phẩm"
              value={name}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                showNameError
                  ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {showNameError && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang tạo..." : "Tạo nhãn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
