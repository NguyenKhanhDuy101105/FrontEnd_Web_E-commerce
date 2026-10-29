"use client";

import React from "react";
import { TicketIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CustomerVoucherItem } from "@/src/services/customer/voucherService";

interface VoucherSectionProps {
  selectedVoucher?: CustomerVoucherItem | null;
  onOpenVoucherModal: () => void;
  onRemoveVoucher?: () => void;
}

export default function VoucherSection({
  selectedVoucher,
  onOpenVoucherModal,
  onRemoveVoucher,
}: VoucherSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <TicketIcon className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="text-xs font-bold text-slate-800 shrink-0">
          Khuyến mãi/Evoucher
        </span>

        {selectedVoucher && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 truncate">
            <span className="text-[11px] font-mono font-extrabold uppercase">
              {selectedVoucher.code}
            </span>
            {onRemoveVoucher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveVoucher();
                }}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenVoucherModal}
        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer shrink-0"
      >
        {selectedVoucher ? "Thay đổi" : "Chọn hoặc nhập mã"}
      </button>
    </div>
  );
}
