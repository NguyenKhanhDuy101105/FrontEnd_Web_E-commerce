"use client";

import React from "react";
import { CheckIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  line: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

interface AddressSelectorProps {
  addresses: Address[];
  loading?: boolean;
  selectedAddressId: string;
  onSelectAddress: (address: Address) => void;
  onAddNewAddress?: () => void;
}

export default function AddressSelector({
  addresses,
  loading = false,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: AddressSelectorProps) {
  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
        Đang tải danh sách địa chỉ...
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-800">
          Thông tin nhận hàng
        </h3>
        <Link
          href="/account/address"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
        >
          Sửa thông tin
        </Link>
      </div>

      <div className="max-h-68.75 overflow-y-auto pr-1.5 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-0.5">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;

            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr)}
                className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer bg-white min-h-27.5 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "border-emerald-600 bg-white shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-7 h-7 bg-emerald-600 rounded-bl-xl flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                )}

                <div className="pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1">
                    <span>{addr.recipientName}</span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium mb-1">
                    {addr.phone}
                  </p>

                  <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                    {addr.line}, {addr.ward}, {addr.district}, {addr.city}
                  </p>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddNewAddress}
            className="flex flex-col items-center justify-center min-h-27.5 p-3.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-600 transition-all cursor-pointer"
          >
            <PlusIcon className="w-5 h-5 mb-1 text-slate-400" />
            <span className="text-xs font-semibold">Thêm địa chỉ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
