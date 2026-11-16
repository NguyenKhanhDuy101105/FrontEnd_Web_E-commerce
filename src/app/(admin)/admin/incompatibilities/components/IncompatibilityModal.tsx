"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  FoodTag,
  FoodIncompatibilityItem,
  FoodIncompatibilityPayload,
  IncompatibilitySeverity,
} from "@/src/services/admin/adminIncompatibilityService";

interface IncompatibilityModalProps {
  isOpen: boolean;
  editingItem: FoodIncompatibilityItem | null;
  foodTags: FoodTag[];
  onClose: () => void;
  onSubmit: (payload: FoodIncompatibilityPayload) => Promise<void>;
}

const SEVERITIES: {
  value: IncompatibilitySeverity;
  label: string;
  color: string;
}[] = [
  { value: "LOW", label: "Thấp (Nhẹ)", color: "text-blue-600" },
  { value: "MEDIUM", label: "Trung bình", color: "text-amber-600" },
  { value: "HIGH", label: "Nghiêm trọng", color: "text-orange-600" },
  { value: "DANGEROUS", label: "Nguy hiểm cấp tính", color: "text-rose-600" },
];

export default function IncompatibilityModal({
  isOpen,
  editingItem,
  foodTags,
  onClose,
  onSubmit,
}: IncompatibilityModalProps) {
  const [tagA, setTagA] = useState("");
  const [tagB, setTagB] = useState("");
  const [severity, setSeverity] = useState<IncompatibilitySeverity>("LOW");
  const [title, setTitle] = useState("");
  const [effect, setEffect] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTagA(editingItem.tagA || "");
      setTagB(editingItem.tagB || "");
      setSeverity(editingItem.severity || "LOW");
      setTitle(editingItem.title || "");
      setEffect(editingItem.effect || "");
      setRecommendation(editingItem.recommendation || "");
      setIsActive(editingItem.isActive ?? true);
    } else {
      setTagA(foodTags[0]?.code || "");
      setTagB(foodTags[1]?.code || foodTags[0]?.code || "");
      setSeverity("LOW");
      setTitle("");
      setEffect("");
      setRecommendation("");
      setIsActive(true);
    }
  }, [editingItem, isOpen, foodTags]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tagA === tagB) {
      alert("Vui lòng chọn 2 nhãn thực phẩm khác nhau!");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        tagA,
        tagB,
        severity,
        title,
        effect,
        recommendation,
        isActive,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-amber-600">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-800">
              {editingItem
                ? "Chỉnh sửa quy tắc kỵ thực phẩm"
                : "Tạo quy tắc dị ứng thực phẩm mới"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhãn A <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={tagA}
                onChange={(e) => setTagA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none bg-white font-medium"
              >
                {foodTags.map((tag) => (
                  <option key={tag.code} value={tag.code}>
                    {tag.name} ({tag.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kỵ với Nhãn B <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={tagB}
                onChange={(e) => setTagB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none bg-white font-medium"
              >
                {foodTags.map((tag) => (
                  <option key={tag.code} value={tag.code}>
                    {tag.name} ({tag.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức độ nghiêm trọng <span className="text-rose-500">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as IncompatibilitySeverity)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none bg-white font-semibold"
              >
                {SEVERITIES.map((sev) => (
                  <option
                    key={sev.value}
                    value={sev.value}
                    className={sev.color}
                  >
                    {sev.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="true">Đang áp dụng</option>
                <option value="false">Đã ẩn (Tạm dừng)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề cảnh báo <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="VD: Hải sản kết hợp với thực phẩm giàu Vitamin C"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tác hại / Ảnh hưởng sức khỏe
            </label>
            <textarea
              rows={2}
              placeholder="VD: Tạo ra chất thạch thạch (Asen 3) gây ngộ độc cấp tính, buồn nôn..."
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khuyến nghị xử lý
            </label>
            <textarea
              rows={2}
              placeholder="VD: Tránh dùng chung trong cùng bữa ăn, giãn cách tối thiểu 4 tiếng."
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
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
              className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Đang lưu..."
                : editingItem
                  ? "Cập nhật"
                  : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
