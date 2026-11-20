"use client";

import React, { useEffect } from "react";
import { TruckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ShippingPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingPolicyModal({
  isOpen,
  onClose,
}: ShippingPolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-100 space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3.5 top-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pr-8">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TruckIcon className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Bảng giá cước phí vận chuyển
            </h3>
            <p className="text-xs text-slate-500">
              Áp dụng theo khoảng cách giao hàng và giá trị đơn hàng
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3 font-bold">Khoảng cách</th>
                <th className="py-2.5 px-3 font-bold">Dưới 300k</th>
                <th className="py-2.5 px-3 font-bold">300k–500k</th>
                <th className="py-2.5 px-3 font-bold">Trên 500k</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  0–5 km
                </td>
                <td className="py-2.5 px-3">10.000đ</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-600">
                  Miễn phí
                </td>
                <td className="py-2.5 px-3 font-semibold text-emerald-600">
                  Miễn phí
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Trên 5–15 km
                </td>
                <td className="py-2.5 px-3">20.000đ</td>
                <td className="py-2.5 px-3 font-medium text-amber-700">
                  Giảm 50% (10.000đ)
                </td>
                <td className="py-2.5 px-3 font-semibold text-emerald-600">
                  Miễn phí
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Trên 15–30 km
                </td>
                <td className="py-2.5 px-3">30.000đ</td>
                <td className="py-2.5 px-3 font-medium text-amber-700">
                  Giảm 50% (15.000đ)
                </td>
                <td className="py-2.5 px-3 font-semibold text-emerald-600">
                  Miễn phí
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Trên 30 km
                </td>
                <td className="py-2.5 px-3">40.000đ</td>
                <td className="py-2.5 px-3 font-medium text-amber-700">
                  Giảm 50% (20.000đ)
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  20.000đ
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs text-emerald-900">
          <span className="font-bold">Lưu ý:</span> Miễn phí 100% cước vận
          chuyển khi chọn hình thức{" "}
          <span className="font-semibold">Nhận hàng tại chi nhánh</span>.
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
