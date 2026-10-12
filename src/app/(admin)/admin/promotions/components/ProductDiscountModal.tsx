"use client";

import { useState, useEffect } from "react";
import { TagIcon, CalendarIcon } from "@heroicons/react/24/outline";

export interface DiscountModalTarget {
  type: "SINGLE_PRODUCT" | "CATEGORY";
  titleName: string;
  productIds: string[];
}

interface ProductDiscountModalProps {
  isOpen: boolean;
  target: DiscountModalTarget | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productIds: string[];
    discountPercent: number;
    startsAt: string;
    endsAt: string;
  }) => void;
}

export default function ProductDiscountModal({
  isOpen,
  target,
  loading,
  onClose,
  onSubmit,
}: ProductDiscountModalProps) {
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      setStartsAt(now.toISOString().slice(0, 16));
      setEndsAt(nextWeek.toISOString().slice(0, 16));
      setDiscountPercent(10);
    }
  }, [isOpen]);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productIds: target.productIds,
      discountPercent: discountPercent / 100, // Đổi từ % sang thập phân (10% -> 0.1)
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-emerald-100 text-[#0d5c3a] rounded-lg">
            <TagIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {target.type === "CATEGORY"
                ? "Thêm khuyến mãi theo danh mục"
                : "Thiết lập khuyến mãi sản phẩm"}
            </h3>
            <p className="text-xs text-slate-500">
              {target.type === "CATEGORY" ? (
                <span>
                  Danh mục:{" "}
                  <strong className="text-[#0d5c3a]">{target.titleName}</strong>{" "}
                  ({target.productIds.length} sản phẩm)
                </span>
              ) : (
                <span>
                  Sản phẩm:{" "}
                  <strong className="text-[#0d5c3a]">{target.titleName}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Phần trăm giảm giá (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="99"
                required
                value={discountPercent === 0 ? "" : discountPercent}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setDiscountPercent(0);
                  } else {
                    const num = parseInt(val, 10) || 0;

                    setDiscountPercent(Math.min(99, Math.max(1, num)));
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "+" ||
                    e.key === "e" ||
                    e.key === "E"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-bold text-sm text-slate-800"
                placeholder=""
              />
              <span className="absolute right-3 top-2.5 font-bold text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Ngày bắt đầu *
              </label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Ngày kết thúc *
              </label>
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#0d5c3a] text-white font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Áp dụng khuyến mãi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
