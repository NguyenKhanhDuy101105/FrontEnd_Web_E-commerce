"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useWishlist } from "@/src/context/WishlistContext";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { showToast } from "@/src/utils/toast";

interface ProductInfoProps {
  product: any;
  quantity: number;
  setQuantity: (value: number | ((prev: number) => number)) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductInfo({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const { isWishlisted, addWishlistId, removeWishlistId } = useWishlist();
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);

  const brand = product.brandName || product.brand || "ĐANG CẬP NHẬT";
  const price = product.displayPrice ?? product.price ?? product.basePrice ?? 0;
  const originalPrice = product.discountPercent
    ? product.basePrice
    : product.originalPrice;

  const wishlist = isWishlisted(product.id);
  const stockQuantity = product.stockQuantity ?? 0;
  const isOutOfStock = product.isOutOfStock || stockQuantity <= 0;

  const [inputValue, setInputValue] = useState<string>(
    isOutOfStock ? "0" : String(quantity),
  );

  useEffect(() => {
    setInputValue(isOutOfStock ? "0" : String(quantity));
  }, [quantity, isOutOfStock]);

  const commitQuantity = () => {
    if (isOutOfStock) {
      setInputValue("0");
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputValue(String(quantity));
      return;
    }

    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantity(1);
      setInputValue("1");
      return;
    }

    if (parsed > stockQuantity) {
      showToast.error(
        `Số lượng tối đa có sẵn là ${stockQuantity} ${product.unit || "sản phẩm"}!`,
      );
      setQuantity(stockQuantity);
      setInputValue(String(stockQuantity));
      return;
    }

    setQuantity(parsed);
    setInputValue(String(parsed));
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
      setInputValue(isOutOfStock ? "0" : String(quantity));
      e.currentTarget.blur();
    }
  };

  const handleWishlistClick = async () => {
    if (isWishlistLoading) return;

    const nextState = !wishlist;
    setIsWishlistLoading(true);

    if (nextState) {
      addWishlistId(product.id);
    } else {
      removeWishlistId(product.id);
    }

    try {
      if (nextState) {
        const res = await wishlistService.addToWishlist(product.id);
        if (res.status === "success") {
          showToast.success("Đã thêm sản phẩm vào danh sách yêu thích!");
        } else {
          removeWishlistId(product.id);
          showToast.error(res.message || "Không thể thêm vào yêu thích!");
        }
      } else {
        const res = await wishlistService.removeFromWishlist(product.id);
        if (res.status === "success") {
          showToast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!");
        } else {
          addWishlistId(product.id);
          showToast.error(res.message || "Không thể xóa khỏi yêu thích!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh sách yêu thích:", error);
      if (nextState) {
        removeWishlistId(product.id);
      } else {
        addWishlistId(product.id);
      }
      showToast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900 leading-snug">
          {product.name}
        </h1>
        <div className="flex items-center gap-4 text-slate-500 mt-2">
          <span>
            Thương hiệu: <strong className="text-slate-800">{brand}</strong>
          </span>
          {product.sku && (
            <span>
              SKU: <strong className="text-slate-800">{product.sku}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-slate-500 block">Đơn vị:</span>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="px-4 py-1.5 border-2 border-green-600 text-green-600 font-bold rounded-lg text-xs"
          >
            {product.unit || "Cái"}
          </button>

          <button
            type="button"
            disabled={isWishlistLoading}
            onClick={handleWishlistClick}
            className="flex items-center gap-1.5 text-slate-600 hover:text-red-500 transition-colors p-1 cursor-pointer disabled:opacity-50"
            title={wishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          >
            {wishlist ? (
              <HeartSolid className="w-6 h-6 text-red-500 transition-transform active:scale-125" />
            ) : (
              <HeartOutline className="w-6 h-6 text-slate-500 hover:text-red-500 transition-transform active:scale-125" />
            )}
            <span className="text-xs font-semibold">Yêu thích</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-black text-green-700">
            {price.toLocaleString("vi-VN")} đ
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-slate-400 line-through">
              {originalPrice.toLocaleString("vi-VN")} đ
            </span>
          )}
          {product.discountPercent && (
            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 font-bold rounded text-[11px]">
              -{product.discountPercent}%
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-medium">Số lượng: </span>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600/30 transition">
            <button
              type="button"
              disabled={isOutOfStock || quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              -
            </button>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Số lượng mua"
              disabled={isOutOfStock}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={commitQuantity}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.currentTarget.select()}
              className="w-12 py-1.5 text-center font-bold text-slate-800 border-x border-slate-200 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={isOutOfStock || quantity >= stockQuantity}
              onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Sản phẩm có sẵn:{" "}
          <strong
            className={`font-semibold ${
              isOutOfStock ? "text-rose-600" : "text-slate-800"
            }`}
          >
            {isOutOfStock
              ? "Tạm hết hàng"
              : `${stockQuantity} ${product.unit || "sản phẩm"}`}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onAddToCart}
          className="w-full py-3 border border-green-600 text-green-600 hover:bg-green-50 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed font-bold rounded-lg transition cursor-pointer"
        >
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onBuyNow}
          className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-xs cursor-pointer"
        >
          {isOutOfStock ? "Tạm hết hàng" : "Mua ngay"}
        </button>
      </div>
    </div>
  );
}
