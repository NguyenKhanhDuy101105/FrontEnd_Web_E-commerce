"use client";

import React, { useState } from "react";
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
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
            >
              -
            </button>
            <span className="px-4 py-1.5 font-bold text-slate-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Sản phẩm có sẵn:{" "}
          <strong className="text-slate-800 font-semibold">
            {stockQuantity} {product.unit || "sản phẩm"}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3">
        <button
          type="button"
          onClick={onAddToCart}
          className="w-full py-3 border border-green-600 text-green-600 hover:bg-green-50 font-bold rounded-lg transition cursor-pointer"
        >
          Thêm vào giỏ hàng
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition shadow-xs cursor-pointer"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
