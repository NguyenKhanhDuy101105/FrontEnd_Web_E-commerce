"use client";

import React, { useState } from "react";
import { XMarkIcon, TagIcon } from "@heroicons/react/24/outline";
import { CreateFoodTagPayload } from "@/src/services/admin/adminIncompatibilityService";

interface FoodTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateFoodTagPayload) => Promise<void>;
}

export default function FoodTagModal({
  isOpen,
  onClose,
  onSubmit,
}: FoodTagModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        code: code.trim().toUpperCase(),
        name: name.trim(),
      });
      setCode("");
      setName("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <TagIcon className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-800">Tạo nhãn thực phẩm mới</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã nhãn (Code / Slug) <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="VD: HAISAN, VITAMINC, SUA"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none font-mono uppercase"
            />
            <p className="text-[10px] text-slate-400 mt-1">Mã định danh viết hoa không dấu, ngăn cách bằng dấu gạch dưới.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên hiển thị nhãn <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="VD: Hải sản, Vitamin C, Sữa & Chế phẩm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo nhãn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
