"use client";

import React from "react";
import { TicketIcon } from "@heroicons/react/24/outline";

interface VoucherSectionProps {
  selectedVoucherCode?: string;
  onOpenVoucherModal: () => void;
}

export default function VoucherSection({
  selectedVoucherCode,
  onOpenVoucherModal,
}: VoucherSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TicketIcon className="w-5 h-5 text-green-600" />
        <span className="text-xs font-bold text-slate-800">
          Khuyến mãi/Evoucher
        </span>
        {selectedVoucherCode && (
          <span className="text-[11px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            {selectedVoucherCode}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenVoucherModal}
        className="text-xs font-semibold text-green-800 hover:underline cursor-pointer"
      >
        {selectedVoucherCode ? "Thay đổi" : "Chọn hoặc nhập mã"}
      </button>
    </div>
  );
}
