"use client";

import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CartItem } from "@/src/services/customer/cartService";

interface CartItemRowProps {
  item: CartItem;
  isUpdating: boolean;
  onUpdateQuantity: (
    itemId: string,
    currentQty: number,
    change: number,
  ) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function CartItemRow({
  item,
  isUpdating,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps) {
  return (
    <div className="pt-4 sm:pt-6 first:pt-0 space-y-3">
      <div className="flex flex-wrap sm:flex-nowrap items-start gap-3 sm:gap-4">
        {/* Checkbox item */}
        <input
          type="checkbox"
          checked
          readOnly
          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-2 sm:mt-5 cursor-pointer shrink-0"
        />

        {/* Ảnh sản phẩm - Bo góc rounded-sm */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-sm border border-slate-100 p-1 shrink-0 overflow-hidden">
          <Image
            src={item.imageUrl || "/images/Banner1.jpeg"}
            alt={item.productName}
            fill
            className="object-contain rounded-sm"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 min-w-35 space-y-1">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
            {item.productName}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            SKU: {item.productId.slice(0, 8)}
          </p>

          {/* Đơn giá trên Mobile */}
          <div className="sm:hidden flex items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-900">
              {item.unitPrice.toLocaleString("vi-VN")}đ
            </span>
            {item.basePrice > item.unitPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                {item.basePrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
        </div>

        {/* Đơn giá trên Desktop / Tablet */}
        <div className="text-right hidden sm:block w-20 md:w-24 shrink-0">
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            {item.unitPrice.toLocaleString("vi-VN")}đ
          </span>
          {item.basePrice > item.unitPrice && (
            <p className="text-xs text-slate-400 line-through">
              {item.basePrice.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>

        {/* Bộ tăng/giảm số lượng & Nút Xóa */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-24 md:w-28 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Ô tăng giảm số lượng - Bo góc rounded-sm */}
          <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden bg-slate-50">
            <button
              type="button"
              disabled={isUpdating || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.itemId, item.quantity, -1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
            >
              -
            </button>
            <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-slate-800">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateQuantity(item.itemId, item.quantity, 1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onRemoveItem(item.itemId)}
            className="text-[11px] text-slate-400 hover:text-red-500 transition cursor-pointer flex items-center space-x-0.5"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>

          {/* Thành tiền trên Mobile */}
          <div className="sm:hidden text-right">
            <span className="text-xs font-black text-slate-900">
              {item.subtotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {/* Thành tiền trên Desktop / Tablet */}
        <div className="text-right hidden sm:block shrink-0 w-20 md:w-24">
          <span className="text-xs sm:text-sm font-black text-slate-900">
            {item.subtotal.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      {/* Ô Ghi chú sản phẩm - Bo góc rounded-lg */}
      <div className="pl-0 sm:pl-7">
        <textarea
          rows={1}
          placeholder="Ghi chú sản phẩm"
          className="w-full text-xs p-2 sm:p-2.5 rounded-sm border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-600 bg-slate-50/50 resize-none"
        />
      </div>
    </div>
  );
}
