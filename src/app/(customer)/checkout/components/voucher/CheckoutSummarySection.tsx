"use client";

import React from "react";

interface CheckoutSummarySectionProps {
  subTotal: number;
  shippingFee: number;
  discountAmount?: number;
  distanceKm?: number;
  isSubmitting?: boolean;
  onSubmitOrder: () => void;
}

export default function CheckoutSummarySection({
  subTotal,
  shippingFee,
  discountAmount = 0,
  isSubmitting = false,
  onSubmitOrder,
}: CheckoutSummarySectionProps) {
  const grandTotal = Math.max(0, subTotal + shippingFee - discountAmount);

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Tổng tạm tính</span>
          <span className="font-bold text-slate-900">
            {subTotal.toLocaleString("vi-VN")}đ
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-500 font-medium shrink-0">
            Phí vận chuyển
          </span>
          <div className="text-right">
            <span className="font-semibold text-emerald-600 text-[11px] block">
              Freeship&lt;6km. Từ 6km: chỉ 5000đ/km
            </span>
            {shippingFee > 0 && (
              <span className="font-bold text-slate-900 text-xs">
                +{shippingFee.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span className="font-medium">Giảm giá voucher</span>
            <span className="font-bold">
              -{discountAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-2">
          <span className="text-xs font-bold text-slate-800">Thành tiền</span>
          <div className="text-right">
            <span className="text-lg font-black text-rose-600 block leading-none">
              {grandTotal.toLocaleString("vi-VN")}{" "}
              <span className="underline decoration-1">đ</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              (Đã bao gồm VAT)
            </span>
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onSubmitOrder}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs transition-all shadow-md cursor-pointer flex flex-col items-center justify-center gap-0.5"
        >
          <span className="text-sm tracking-wide font-black">
            {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
          </span>
        </button>
      </div>
    </div>
  );
}
