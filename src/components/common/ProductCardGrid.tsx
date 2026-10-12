"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HeartIcon as HeartOutline,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { showToast } from "@/src/utils/toast";
import { useWishlist } from "@/src/context/WishlistContext";

export interface ProductGridProps {
  id: string;
  title: string;
  brand?: string;
  image: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  rating?: number;
  promotionBadge?: string;
  stockQuantity?: number;
  inStock?: boolean;
  isWishlisted?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string, isWishlisted: boolean) => void;
}

export default function ProductCardGrid({
  id,
  title,
  brand = "URBANMART",
  image,
  price,
  originalPrice,
  unit = "Kg",
  rating = 5.0,
  promotionBadge,
  stockQuantity,
  inStock,
  onAddToCart,
  onToggleWishlist,
}: ProductGridProps) {
  const { isWishlisted, addWishlistId, removeWishlistId } = useWishlist();

  const wishlist = isWishlisted(id);
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);

  const isOutOfStock =
    inStock !== undefined
      ? !inStock
      : stockQuantity !== undefined
        ? stockQuantity <= 0
        : false;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistLoading) return;

    const nextState = !wishlist;
    setIsWishlistLoading(true);

    if (nextState) {
      addWishlistId(id);
    } else {
      removeWishlistId(id);
    }

    try {
      if (nextState) {
        const res = await wishlistService.addToWishlist(id);
        if (res.status === "success") {
          showToast.success("Đã thêm sản phẩm vào danh sách yêu thích!");
        } else {
          removeWishlistId(id);
          showToast.error(res.message || "Không thể thêm vào yêu thích!");
        }
      } else {
        const res = await wishlistService.removeFromWishlist(id);
        if (res.status === "success") {
          showToast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!");
        } else {
          addWishlistId(id);
          showToast.error(res.message || "Không thể xóa khỏi yêu thích!");
        }
      }

      if (onToggleWishlist) {
        onToggleWishlist(id, nextState);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh sách yêu thích:", error);

      if (nextState) {
        removeWishlistId(id);
      } else {
        addWishlistId(id);
      }
      showToast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onAddToCart) onAddToCart(id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm transition-shadow duration-200 flex flex-col justify-between p-3.5 relative group h-full">
      <div>
        <div className="relative w-full aspect-square bg-white mb-3 overflow-hidden rounded-sm">
          <Image
            src={image || "/images/Banner1.jpeg"}
            alt={title}
            fill
            className={`object-contain transition-transform duration-300 ${
              isOutOfStock ? "opacity-70" : "group-hover:scale-105"
            }`}
          />

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
              <span className="bg-black/75 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-md backdrop-blur-[1px]">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {brand}
          </span>

          <div className="flex items-start justify-between gap-1 min-h-9">
            <Link
              href={`/products/${id}`}
              className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 hover:text-blue-700 leading-snug flex-1"
            >
              {title}
            </Link>

            <button
              type="button"
              disabled={isWishlistLoading}
              onClick={handleWishlistClick}
              className="p-0.5 z-20 text-blue-900 hover:text-red-500 transition-colors cursor-pointer shrink-0 disabled:opacity-50 mt-0.5"
              title={wishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              {wishlist ? (
                <HeartSolid className="w-5 h-5 text-blue-900 fill-blue-900 transition-transform active:scale-125" />
              ) : (
                <HeartOutline className="w-5 h-5 text-blue-900 stroke-[1.8] hover:text-red-500 transition-transform active:scale-125" />
              )}
            </button>
          </div>
        </div>

        {promotionBadge && !isOutOfStock && (
          <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 inline-block">
            {promotionBadge}
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-black text-blue-900">
            {price.toLocaleString("vi-VN")} đ
          </span>
          {unit && <span className="text-xs text-slate-500">/{unit}</span>}
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-slate-400 line-through block w-full">
              {originalPrice.toLocaleString("vi-VN")} đ
            </span>
          )}
        </div>

        {rating && (
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <span className="font-bold text-slate-700">
              {rating.toFixed(1)}
            </span>
            <StarIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleAddToCartClick}
        className={`w-full mt-3 py-1.5 font-bold text-xs rounded-sm transition-colors ${
          isOutOfStock
            ? "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            : "border border-blue-800 text-blue-900 hover:bg-blue-800 hover:text-white cursor-pointer"
        }`}
      >
        {isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
      </button>
    </div>
  );
}
