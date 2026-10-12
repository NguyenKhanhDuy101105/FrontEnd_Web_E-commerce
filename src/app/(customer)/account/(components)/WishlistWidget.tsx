"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { cartService } from "@/src/services/customer/cartService";
import { useBranch } from "@/src/context/BranchContext";
import { notifyCartUpdated } from "@/src/utils/cartEvent";
import { showToast } from "@/src/utils/toast";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  unit: string;
  image: string;
}

interface WishlistWidgetProps {
  wishlistItems?: WishlistItem[];
  isLoading?: boolean;
}

export default function WishlistWidget({
  wishlistItems: initialWishlistItems,
  isLoading: initialIsLoading,
}: WishlistWidgetProps) {
  const { branchId } = useBranch();
  const [items, setItems] = useState<WishlistItem[]>(
    initialWishlistItems || [],
  );
  const [loading, setLoading] = useState<boolean>(
    initialIsLoading !== undefined ? initialIsLoading : true,
  );

  const fetchWishlistData = useCallback(async () => {
    if (initialWishlistItems) {
      setItems(initialWishlistItems);
      setLoading(false);
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (
        res &&
        (res.status === "success" || res.status === "200" || res.data) &&
        Array.isArray(res.data)
      ) {
        const mapped: WishlistItem[] = res.data.map((item: any) => {
          const p = item.product || item;
          return {
            id: String(p.id || p.productId || item.productId),
            title: p.name || p.title || "Sản phẩm",
            price: p.displayPrice ?? p.price ?? p.basePrice ?? 0,
            unit: p.unit || "Cái",
            image: p.imageUrl || p.image || "/images/Banner1.jpeg",
          };
        });
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích ở Widget:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [initialWishlistItems]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const handleAddToCart = async (productId: string) => {
    if (!branchId) {
      showToast.error("Vui lòng chọn siêu thị trước khi thêm vào giỏ!");
      return;
    }

    try {
      const res = await cartService.addToCart({
        branchId,
        productId,
        quantity: 1,
      });

      if (res && (res.status === "success" || res.status === "200")) {
        showToast.success("Đã thêm sản phẩm vào giỏ hàng!");
        notifyCartUpdated();
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      showToast.error("Thêm vào giỏ hàng thất bại!");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-100 shadow-xs space-y-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="h-12 bg-slate-100 rounded-lg" />
        <div className="h-12 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs sm:text-sm">
          <HeartIcon className="w-4 h-4 text-red-500" />
          <h3>Yêu thích ({items.length})</h3>
        </div>
        <Link
          href="/account/wish_list"
          className="text-xs font-semibold text-slate-500 hover:text-[#0d5c3a]"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-2 max-h-29 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Chưa có sản phẩm yêu thích nào.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-50 transition-colors border border-slate-100/60 shrink-0"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="relative w-10 h-10 bg-white rounded-md overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-800 truncate max-w-32.5 sm:max-w-37.5">
                    {item.title}
                  </p>
                  <p className="text-[11px] font-bold text-[#0d5c3a]">
                    {formatCurrency(item.price)} đ / {item.unit}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(item.id)}
                className="p-1.5 text-[#0d5c3a] bg-emerald-50 hover:bg-emerald-100 active:scale-95 rounded-lg transition-all cursor-pointer shrink-0 ml-1"
                title="Thêm vào giỏ"
              >
                <ShoppingCartIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
