"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBagIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useCart } from "@/src/context/CartContext";

export default function CartMenu() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const { isAuthenticated } = useAuthGuard();
  const { cartItems, totalQuantity, totalAmount, isLoading } = useCart();

  const handleGoToCart = () => {
    setIsHovered(false);
    if (isAuthenticated) {
      router.push("/cart");
    } else {
      router.push("/auth/login?redirect=/cart");
    }
  };

  return (
    <div
      className="relative py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleGoToCart}
        className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors relative focus:outline-none cursor-pointer"
        title="Giỏ hàng"
      >
        <ShoppingBagIcon className="w-6 h-6" />

        {isAuthenticated && totalQuantity > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            {totalQuantity}
          </span>
        )}
      </button>

      {isHovered && (
        <div className="absolute right-0 top-full w-80 pt-0.5 z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
            {isAuthenticated ? (
              isLoading && cartItems.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-slate-400">Đang tải giỏ hàng...</p>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1.5 divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    {cartItems.map((item) => (
                      <div
                        key={item.itemId || item.productId}
                        className="flex items-center space-x-3 pt-3 first:pt-0"
                      >
                        <div className="relative w-14 h-14 bg-slate-50 border rounded-sm border-slate-200 shrink-0 p-1">
                          <Image
                            src={item.imageUrl || "/images/Banner1.jpeg"}
                            alt={item.productName}
                            fill
                            className="object-contain"
                          />
                        </div>

                        <div className="flex-1 overflow-hidden text-left">
                          <h5 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                            {item.productName}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Số lượng {item.quantity}
                          </p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">
                            {item.unitPrice.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-semibold text-slate-700">
                      Tổng tiền ({totalQuantity}) sản phẩm
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {totalAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoToCart}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Xem giỏ hàng
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBagIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-slate-600">
                    Giỏ hàng của bạn đang trống
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBagIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Giỏ hàng của bạn
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 px-2">
                    Vui lòng đăng nhập để thêm và xem sản phẩm trong giỏ hàng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGoToCart}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
