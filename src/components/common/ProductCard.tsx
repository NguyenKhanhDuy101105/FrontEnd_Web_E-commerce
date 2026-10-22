"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HeartIcon as HeartOutline,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { showToast } from "@/src/utils/toast";
import { useWishlist } from "@/src/context/WishlistContext";
import { useCart } from "@/src/context/CartContext";

export interface ProductProps {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  unit?: string;
  stockQuantity?: number;
  inStock?: boolean;
  isWishlisted?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string, isWishlisted: boolean) => void;
}

export default function ProductCard({
  id,
  slug,
  title,
  brand = "URBANMART",
  image,
  price,
  originalPrice,
  discountPercent,
  unit = "Cái",
  stockQuantity,
  inStock,
  onAddToCart,
  onToggleWishlist,
}: ProductProps) {
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

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isCartLoading) return;

    setIsCartLoading(true);
    try {
      await addToCart(id, 1);
    } catch (error) {
      console.error("Lỗi khi thêm giỏ hàng:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Logic tăng số lượng
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

  // Logic giảm số lượng (khi giảm về 0 sẽ tự hiện lại nút Thêm vào giỏ)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  return (
    <div className="group relative w-full h-full bg-white rounded-lg border border-slate-100 p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <Link href={`/product/${slug}`} className="flex-1 flex flex-col">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white mb-2 shrink-0">
          {discountPercent && !isOutOfStock && (
            <div className="absolute top-0 right-0 z-10 bg-red-500 text-white font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded-bl-md">
              -{discountPercent}%
            </div>
          )}

          <Image
            src={image}
            alt={title}
            fill
            className={`object-contain p-1 transition-transform duration-300 ease-out ${
              isOutOfStock ? "opacity-75" : "group-hover:scale-105"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {isOutOfStock && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-slate-900/80 text-white font-medium text-[10px] sm:text-xs px-2 py-0.5 rounded-md backdrop-blur-xs tracking-wide">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-400 uppercase truncate pr-1">
            {brand}
          </span>

          <button
            type="button"
            disabled={isWishlistLoading}
            onClick={handleWishlistClick}
            className="text-[#0d5c3a] hover:text-[#094229] transition-colors p-0.5 cursor-pointer shrink-0 z-10 disabled:opacity-50"
            title={wishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          >
            {wishlist ? (
              <HeartSolid className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 transition-transform active:scale-125" />
            ) : (
              <HeartOutline className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d5c3a] stroke-[1.8] transition-transform active:scale-125" />
            )}
          </button>
        </div>

        <h3 className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-[#0d5c3a] transition-colors flex-1">
          {title}
        </h3>

        <div className="mb-2.5">
          <div className="flex items-baseline space-x-1">
            <span className="text-sm sm:text-base font-bold text-[#0d5c3a]">
              {formatCurrency(price)}{" "}
              <span className="underline decoration-1">đ</span>
            </span>
            {unit && (
              <span className="text-[10px] sm:text-xs text-slate-400 font-normal">
                /{unit}
              </span>
            )}
          </div>

          {originalPrice && (
            <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs mt-0.5">
              <span className="line-through text-slate-400 font-medium">
                {formatCurrency(originalPrice)} đ
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* KHU VỰC NÚT THAO TÁC GIỎ HÀNG (DÙNG MÀU XANH #0d5c3a CHUẨN ĐỒNG BỘ) */}
      <div className="shrink-0 w-full">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full py-1.5 sm:py-2 px-2 border border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg text-center cursor-not-allowed"
          >
            Tạm hết hàng
          </button>
        ) : cartQuantity > 0 ? (
          /* GIAO DIỆN TĂNG / GIẢM SỐ LƯỢNG KHI SẢN PHẨM ĐÃ CÓ TRONG GIỎ HÀNG */
          <div className="flex items-center justify-between w-full p-1 border border-[#0d5c3a] rounded-lg bg-white shadow-xs">
            <button
              type="button"
              disabled={isCartLoading}
              onClick={handleDecreaseQuantity}
              className="w-7 h-7 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-50 rounded-md transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Giảm số lượng"
            >
              <MinusIcon className="w-4 h-4 stroke-[2.5]" />
            </button>

            <span className="font-bold text-xs sm:text-sm text-[#0d5c3a] px-2 select-none">
              {cartQuantity}
            </span>

            <button
              type="button"
              disabled={isCartLoading}
              onClick={handleIncreaseQuantity}
              className="w-7 h-7 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-50 rounded-md transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Tăng số lượng"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* GIAO DIỆN CHƯA CÓ TRONG GIỎ HÀNG -> NÚT THÊM VÀO GIỎ MẶC ĐỊNH */
          <button
            type="button"
            disabled={isCartLoading}
            onClick={handleAddToCartClick}
            className="w-full py-1.5 sm:py-2 px-2 border border-[#0d5c3a] text-[#0d5c3a] hover:bg-emerald-50/60 font-bold text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <ShoppingCartIcon className="w-4 h-4 stroke-2" />
            <span>{isCartLoading ? "Đang xử lý..." : "Thêm vào giỏ"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
