"use client";

import { useState } from "react";
import { TicketIcon, XMarkIcon } from "@heroicons/react/24/outline";
import VoucherSelectModal from "../../../../components/common/VoucherSelectModal";
import { CustomerVoucherItem } from "@/src/services/customer/voucherService";
import { useBranch } from "@/src/context/BranchContext";
import { showToast } from "@/src/utils/toast";

interface CartSummarySidebarProps {
  totalAmount: number;
  selectedCount?: number;
  onCheckout: () => void;
}

const getInitialVoucher = (): CustomerVoucherItem | null => {
  if (typeof window === "undefined") return null;
  const savedVoucher = localStorage.getItem("checkout_selected_voucher");
  if (!savedVoucher) return null;
  try {
    return JSON.parse(savedVoucher);
  } catch (e) {
    console.error("Lỗi parse voucher:", e);
    return null;
  }
};

export default function CartSummarySidebar({
  totalAmount,
  selectedCount = 0,
  onCheckout,
}: CartSummarySidebarProps) {
  const { branchId } = useBranch();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] =
    useState<CustomerVoucherItem | null>(getInitialVoucher);

  const handleOpenVoucherModal = () => {
    if (!branchId) {
      showToast.error("Vui lòng chọn siêu thị trước khi chọn mã khuyến mãi!");
      return;
    }
    setIsVoucherModalOpen(true);
  };

  const handleApplyVoucher = (voucher: CustomerVoucherItem) => {
    setAppliedVoucher(voucher);
    localStorage.setItem("checkout_selected_voucher", JSON.stringify(voucher));
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    localStorage.removeItem("checkout_selected_voucher");
  };

  const minOrderAmount = appliedVoucher?.minOrderAmount ?? 0;
  const isVoucherEligible =
    Boolean(appliedVoucher) && totalAmount > 0 && totalAmount >= minOrderAmount;
  const missingAmount = Math.max(0, minOrderAmount - totalAmount);

  const calculateDiscount = () => {
    if (!appliedVoucher || !isVoucherEligible) return 0;

    if (appliedVoucher.discountType === "PERCENT") {
      const calculated = (totalAmount * appliedVoucher.discountValue) / 100;
      if (
        appliedVoucher.maxDiscountAmount &&
        calculated > appliedVoucher.maxDiscountAmount
      ) {
        return appliedVoucher.maxDiscountAmount;
      }
      return calculated;
    }

    return appliedVoucher.discountValue;
  };

  const discountAmount = calculateDiscount();
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  return (
    <div className="space-y-4 sticky top-20">
      <div className="bg-white rounded-lg p-3.5 sm:p-5 shadow-xs border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <TicketIcon className="w-4 h-4 text-emerald-600" />
            Khuyến mãi/Evoucher
          </span>
          <button
            type="button"
            onClick={handleOpenVoucherModal}
            className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
          >
            {appliedVoucher ? "Thay đổi" : "Chọn hoặc nhập mã"}
          </button>
        </div>

        {appliedVoucher ? (
          <div className="space-y-1.5">
            <div
              className={`flex items-center justify-between p-2.5 border rounded-lg ${
                isVoucherEligible
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50/70 border-amber-200"
              }`}
            >
              <div className="min-w-0 pr-2">
                <span
                  className={`font-mono font-bold text-xs block ${
                    isVoucherEligible ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {appliedVoucher.code}
                </span>
                <span
                  className={`text-[11px] truncate block ${
                    isVoucherEligible ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {appliedVoucher.title}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveVoucher}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {!isVoucherEligible && missingAmount > 0 && (
              <p className="text-[11px] text-amber-600 font-medium">
                Mua thêm {missingAmount.toLocaleString("vi-VN")}đ để áp dụng mã
                này.
              </p>
            )}
          </div>
        ) : (
          <p className="text-[11px] sm:text-xs text-slate-400">
            {totalAmount > 0
              ? "Chọn mã giảm giá để nhận thêm ưu đãi cho đơn hàng."
              : "Vui lòng chọn sản phẩm để áp dụng khuyến mãi."}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg p-3.5 sm:p-5 shadow-xs border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2">
          Thanh toán
        </h3>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Tổng tạm tính ({selectedCount} sản phẩm)</span>
            <span className="font-bold text-slate-900">
              {totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Giảm giá Voucher</span>
              <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800">Thành tiền</span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-emerald-600">
                {finalAmount.toLocaleString("vi-VN")}đ
              </span>
              <p className="text-[10px] text-slate-400 font-normal">
                (Đã bao gồm VAT)
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onCheckout}
          className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-lg transition shadow-md active:scale-[0.99] cursor-pointer tracking-wider"
        >
          TIẾP TỤC {selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>
      </div>

      <VoucherSelectModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApplyVoucher={handleApplyVoucher}
        branchId={branchId || ""}
        orderAmount={totalAmount}
        selectedVoucherCode={appliedVoucher?.code}
      />
    </div>
  );
}
