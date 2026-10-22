"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

export interface PaymentOption {
  id: string;
  title: string;
  description?: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "COD",
    title: "Thanh toán khi nhận hàng",
  },
  {
    id: "VNPAY",
    title: "Thanh toán VNPAY-QR",
    description: "Thanh toán VNPAY-QR",
  },
];

interface PaymentSectionProps {
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (id: string) => void;
}

export default function PaymentSection({
  selectedPaymentMethod,
  onSelectPaymentMethod,
}: PaymentSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          Phương thức thanh toán
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Thông tin thanh toán của bạn sẽ luôn được bảo mật
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedPaymentMethod === option.id;

          return (
            <div
              key={option.id}
              onClick={() => onSelectPaymentMethod(option.id)}
              className={`relative p-3.5 rounded-lg border transition-all cursor-pointer bg-white flex flex-col justify-center min-h-16 ${
                isSelected
                  ? "border-green-600 ring-1 ring-green-600 shadow-xs"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-6 h-6 bg-green-600 rounded-bl-lg flex items-center justify-center">
                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <p className="text-xs font-bold text-slate-900 leading-snug">
                {option.title}
              </p>

              {option.description && (
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {option.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
