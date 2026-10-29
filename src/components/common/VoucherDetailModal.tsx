"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  TicketIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CustomerVoucherItem } from "@/src/services/customer/voucherService";

interface VoucherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: CustomerVoucherItem | null;
  onApply: (voucher: CustomerVoucherItem) => void;
  applyingCode?: boolean;
}

export default function VoucherDetailModal({
  isOpen,
  onClose,
  voucher,
  onApply,
  applyingCode = false,
}: VoucherDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !voucher || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-emerald-600" />
            Chi tiết mã ưu đãi
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-extrabold text-sm text-emerald-800 block">
              {voucher.code}
            </span>
            <p className="font-bold text-sm text-slate-900">{voucher.title}</p>
            <p className="text-xs font-semibold text-red-600">
              {voucher.discountType === "PERCENT"
                ? `Mức giảm: ${voucher.discountValue}%`
                : `Mức giảm: ${voucher.discountValue.toLocaleString("vi-VN")}đ`}
              {voucher.maxDiscountAmount &&
                ` (Tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ)`}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-800 mb-1">
              Mô tả chương trình
            </h5>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {voucher.description || "Không có mô tả thêm."}
            </p>
          </div>

          <div className="space-y-2.5 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                Thời gian hiệu lực:
              </span>
              <span className="font-bold text-slate-800">
                {voucher.startDate
                  ? new Date(voucher.startDate).toLocaleDateString("vi-VN")
                  : "N/A"}{" "}
                -{" "}
                {voucher.endDate
                  ? new Date(voucher.endDate).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                Lượt sử dụng:
              </span>
              <span className="font-bold text-slate-800">
                {voucher.usedCount} /{" "}
                {voucher.usageLimit ? voucher.usageLimit : "Vô hạn"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">Đơn hàng tối thiểu:</span>
              <span className="font-bold text-slate-800">
                {voucher.minOrderAmount
                  ? `${voucher.minOrderAmount.toLocaleString("vi-VN")}đ`
                  : "0đ"}
              </span>
            </div>

            {voucher.conditions?.isFirstOrder && (
              <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold">
                * Mã giảm giá chỉ áp dụng cho đơn hàng đầu tiên của khách hàng.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={applyingCode}
            onClick={() => onApply(voucher)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            {applyingCode ? "Đang xử lý..." : "Áp dụng ngay"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
