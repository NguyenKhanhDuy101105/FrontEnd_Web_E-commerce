"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HeartIcon as HeartOutline,
  StarIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { showToast } from "@/src/utils/toast";
import { useWishlist } from "@/src/context/WishlistContext";
import { useCart } from "@/src/context/CartContext";

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
  const { getItemQuantity, addToCart, updateQuantity } = useCart();

  const wishlist = isWishlisted(id);
  const cartQuantity = getItemQuantity(id);

  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);
  const [isCartLoading, setIsCartLoading] = useState<boolean>(false);

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

  // Logic Thêm vào giỏ hàng
  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 🔴 Chống lan truyền sự kiện ra thẻ Link bọc ngoài

    if (isOutOfStock || isCartLoading) return;

    setIsCartLoading(true);
    try {
      // Chỉ gọi hàm addToCart của Context, KHÔNG gọi thêm prop onAddToCart nữa
      await addToCart(id, 1);
    } catch (error) {
      console.error("Lỗi khi thêm giỏ hàng:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Logic Tăng số lượng
  const handleIncreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCartLoading) return;

    setIsCartLoading(true);
    try {
      await updateQuantity(id, cartQuantity + 1);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Logic Giảm số lượng (khi giảm về 0 sẽ quay lại nút Thêm vào giỏ)
  const handleDecreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCartLoading) return;

    setIsCartLoading(true);
    try {
      await updateQuantity(id, cartQuantity - 1);
    } finally {
      setIsCartLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm transition-shadow duration-200 flex flex-col justify-between p-3.5 relative group h-full hover:shadow-md">
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
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-slate-900/80 text-white font-medium text-[10px] sm:text-xs px-2 py-0.5 rounded-md backdrop-blur-xs tracking-wide">
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
              className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 hover:text-[#0d5c3a] leading-snug flex-1 transition-colors"
            >
              {title}
            </Link>

            <button
              type="button"
              disabled={isWishlistLoading}
              onClick={handleWishlistClick}
              className="p-0.5 z-20 text-[#0d5c3a] hover:text-red-500 transition-colors cursor-pointer shrink-0 disabled:opacity-50 mt-0.5"
              title={wishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              {wishlist ? (
                <HeartSolid className="w-5 h-5 text-red-500 transition-transform active:scale-125" />
              ) : (
                <HeartOutline className="w-5 h-5 text-[#0d5c3a] stroke-[1.8] hover:text-red-500 transition-transform active:scale-125" />
              )}
            </button>
          </div>
        </div>

        {promotionBadge && !isOutOfStock && (
          <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 inline-block rounded-xs">
            {promotionBadge}
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-black text-[#0d5c3a]">
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

      {/* KHU VỰC TĂNG / GIẢM SỐ LƯỢNG HOẶC THÊM VÀO GIỎ (TÔNG MÀU XANH #0d5c3a) */}
      <div className="mt-3 shrink-0 w-full">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full py-1.5 font-bold text-xs rounded-sm border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed text-center"
          >
            Tạm hết hàng
          </button>
        ) : cartQuantity > 0 ? (
          /* GIAO DIỆN TĂNG / GIẢM SỐ LƯỢNG KHI ĐÃ CÓ TRONG GIỎ HÀNG */
          <div className="flex items-center justify-between w-full p-0.5 border border-[#0d5c3a] rounded-sm bg-white shadow-xs">
            <button
              type="button"
              disabled={isCartLoading}
              onClick={handleDecreaseQuantity}
              className="w-7 h-7 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-50 rounded-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Giảm số lượng"
            >
              <MinusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <span className="font-bold text-xs text-[#0d5c3a] px-2 select-none">
              {cartQuantity}
            </span>

            <button
              type="button"
              disabled={isCartLoading}
              onClick={handleIncreaseQuantity}
              className="w-7 h-7 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-50 rounded-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Tăng số lượng"
            >
              <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* GIAO DIỆN THÊM VÀO GIỎ HÀNG MẶC ĐỊNH */
          <button
            type="button"
            disabled={isCartLoading}
            onClick={handleAddToCartClick}
            className="w-full py-1.5 font-bold text-xs rounded-sm transition-colors border border-[#0d5c3a] text-[#0d5c3a] hover:bg-[#0d5c3a] hover:text-white cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
          >
            <ShoppingCartIcon className="w-4 h-4 stroke-2" />
            <span>{isCartLoading ? "Đang xử lý..." : "Thêm vào giỏ"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
