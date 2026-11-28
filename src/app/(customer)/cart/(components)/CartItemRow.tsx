"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CartItem } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";

interface CartItemRowProps {
  item: CartItem;
  isSelected?: boolean;
  onToggleSelect?: () => void;
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
  isSelected = true,
  onToggleSelect,
  isUpdating,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps) {
  const maxStock = item.stock;
  const isOutOfStock = typeof maxStock === "number" && maxStock <= 0;
  const isOverStock =
    typeof maxStock === "number" && maxStock > 0 && item.quantity > maxStock;
  const isAtMaxStock =
    typeof maxStock === "number" && maxStock > 0 && item.quantity >= maxStock;
  const isUnselectable = isOutOfStock || isOverStock;

  const [inputValue, setInputValue] = useState<string>(String(item.quantity));

  useEffect(() => {
    setInputValue(String(item.quantity));
  }, [item.quantity]);

  const commitQuantityChange = () => {
    if (isOutOfStock) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputValue(String(item.quantity));
      return;
    }

    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue(String(item.quantity));
      return;
    }

    const upperLimit =
      typeof maxStock === "number" && maxStock > 0 ? maxStock : 999;

    if (typeof maxStock === "number" && parsed > maxStock) {
      showToast.error(`Số lượng tối đa có sẵn tại chi nhánh là ${maxStock}!`);
    }

    const clampedQty = Math.min(parsed, upperLimit);
    setInputValue(String(clampedQty));

    const diff = clampedQty - item.quantity;
    if (diff !== 0) {
      onUpdateQuantity(item.itemId, item.quantity, diff);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || /^\d+$/.test(raw)) {
      setInputValue(raw);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setInputValue(String(item.quantity));
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className={`pt-4 sm:pt-6 first:pt-0 space-y-3 ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-start gap-3 sm:gap-4">
        <input
          type="checkbox"
          disabled={isUnselectable}
          checked={!isUnselectable && isSelected}
          onChange={onToggleSelect}
          title={
            isOutOfStock
              ? "Sản phẩm đã hết hàng"
              : isOverStock
                ? "Số lượng vượt quá tồn kho chi nhánh"
                : "Chọn sản phẩm"
          }
          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-2 sm:mt-5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        />

        <Link
          href={`/products/${item.productId}`}
          className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-sm border border-slate-100 p-1 shrink-0 overflow-hidden block group"
        >
          <Image
            src={item.imageUrl || "/images/Banner1.jpeg"}
            alt={item.productName}
            fill
            className="object-contain rounded-sm group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        <div className="flex-1 min-w-35 space-y-1">
          <Link
            href={`/products/${item.productId}`}
            className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-emerald-600 transition-colors block"
          >
            {item.productName}
          </Link>
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            SKU: {item.productId.slice(0, 8)}
          </p>

          {typeof maxStock === "number" && (
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-[10px] sm:text-[11px] font-medium ${
                  isOutOfStock || isOverStock
                    ? "text-rose-600 font-semibold"
                    : isAtMaxStock
                      ? "text-amber-600"
                      : "text-slate-400"
                }`}
              >
                {isOutOfStock
                  ? "Hết hàng tại chi nhánh hiện tại"
                  : isOverStock
                    ? `Chỉ còn ${maxStock} sản phẩm tại chi nhánh này`
                    : isAtMaxStock
                      ? `Đã đạt tối đa tồn kho (${maxStock})`
                      : `Còn ${maxStock} sản phẩm`}
              </p>

              {isOverStock && typeof maxStock === "number" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    onUpdateQuantity(
                      item.itemId,
                      item.quantity,
                      maxStock - item.quantity,
                    )
                  }
                  className="text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Đặt về {maxStock}
                </button>
              )}
            </div>
          )}

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

        <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-24 md:w-28 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden bg-slate-50 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition">
            <button
              type="button"
              disabled={isUpdating || isOutOfStock || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.itemId, item.quantity, -1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              -
            </button>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Số lượng sản phẩm"
              disabled={isUpdating || isOutOfStock}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={commitQuantityChange}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.currentTarget.select()}
              className="w-9 sm:w-10 h-7 text-center text-xs sm:text-sm font-bold text-slate-800 bg-white border-x border-slate-200 outline-none disabled:opacity-50"
            />
            <button
              type="button"
              disabled={isUpdating || isOutOfStock || isAtMaxStock}
              onClick={() => onUpdateQuantity(item.itemId, item.quantity, 1)}
              title={
                isOutOfStock
                  ? "Sản phẩm đã hết hàng"
                  : isAtMaxStock
                    ? "Đã đạt giới hạn tồn kho"
                    : "Tăng số lượng"
              }
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
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

          <div className="sm:hidden text-right">
            <span className="text-xs font-black text-slate-900">
              {item.subtotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="text-right hidden sm:block shrink-0 w-20 md:w-24">
          <span className="text-xs sm:text-sm font-black text-slate-900">
            {item.subtotal.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>
    </div>
  );
}
