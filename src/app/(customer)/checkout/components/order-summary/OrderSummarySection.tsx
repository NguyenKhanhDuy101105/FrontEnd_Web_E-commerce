"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  discountPercent?: number;
  subtotal: number;
}

interface OrderSummarySectionProps {
  cartItems: CartItem[];
  loading?: boolean;
}

export default function OrderSummarySection({
  cartItems,
  loading = false,
}: OrderSummarySectionProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-900">Thông tin đơn hàng</h3>
        <Link
          href="/cart"
          className="text-xs font-semibold text-green-600 hover:underline cursor-pointer"
        >
          Chỉnh sửa
        </Link>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Đang cập nhật giỏ hàng theo chi nhánh...
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Chưa có sản phẩm nào trong giỏ hàng.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-72.5 overflow-y-auto pr-1.5 custom-scrollbar">
          {cartItems.map((item) => (
            <div
              key={item.itemId || item.productId}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 shrink-0 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <Image
                    src={item.imageUrl || "/images/placeholder.png"}
                    alt={item.productName}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.productName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Số lượng {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-900 block">
                  {item.unitPrice?.toLocaleString("vi-VN")}đ
                </span>
                {item.basePrice > item.unitPrice && (
                  <span className="text-[10px] text-slate-400 line-through">
                    {item.basePrice?.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
