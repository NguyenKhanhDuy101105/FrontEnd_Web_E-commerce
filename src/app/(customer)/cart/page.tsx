"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useBranch } from "@/src/context/BranchContext";
import { cartService, CartData } from "@/src/services/customer/cartService";
import { showToast } from "@/src/utils/toast";
import CartItemRow from "./(components)/CartItemRow";
import CartSummarySidebar from "./(components)/CartSummarySidebar";
import { notifyCartUpdated } from "@/src/utils/cartEvent";

export default function CartPage() {
  const { branchId, selectedBranch } = useBranch();

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    try {
      const res = await cartService.getCart(branchId);
      if (res.status === "success" && res.data) {
        setCart(res.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (
    itemId: string,
    currentQty: number,
    change: number,
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    setUpdatingItemId(itemId);
    try {
      const res = await cartService.updateCartItem(itemId, {
        quantity: newQty,
      });
      if (res.status === "success" && res.data) {
        setCart(res.data);
        notifyCartUpdated(); // 💥 Gọi event cập nhật Header tức thì
      }
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      showToast.error("Không thể cập nhật số lượng!");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItemId(itemId);
    try {
      const res = await cartService.removeCartItem(itemId);
      if (res.status === "success") {
        showToast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        notifyCartUpdated();
        fetchCart();
      }
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      showToast.error("Xóa sản phẩm thất bại!");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!branchId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?"))
      return;

    setLoading(true);
    try {
      const res = await cartService.clearCart(branchId);
      if (res.status === "success") {
        showToast.success("Đã xóa tất cả sản phẩm!");
        notifyCartUpdated();
        fetchCart();
      }
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng:", error);
      showToast.error("Không thể xóa giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  if (!branchId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-600 font-medium">
        Vui lòng chọn siêu thị để xem giỏ hàng.
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  const totalQuantity =
    cart?.totalQuantity ??
    items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="bg-slate-50 min-h-screen py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <nav className="text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-4 flex items-center space-x-1">
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-800 transition"
          >
            Trang chủ
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">Giỏ hàng</span>
        </nav>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-slate-200 animate-pulse rounded-md w-1/3 mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 rounded-lg animate-pulse h-32 sm:h-36 border border-slate-100"
                />
              ))}
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-lg animate-pulse h-60 sm:h-64 border border-slate-100" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-xs border border-slate-100 space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Giỏ hàng của bạn đang trống
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Hãy chọn thêm các sản phẩm chất lượng từ cửa hàng{" "}
              {selectedBranch?.name || ""}.
            </p>
            <Link
              href="/"
              className="inline-block px-5 sm:px-6 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
                  Giỏ hàng ({totalQuantity})
                </h1>

                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="bg-white rounded-lg p-3.5 sm:p-6 shadow-xs border border-slate-100 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="truncate max-w-50 sm:max-w-none">
                      {selectedBranch?.name || "UrbanMart"}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center space-x-12 pr-2 font-semibold text-slate-500">
                    <span>Đơn giá</span>
                    <span>Số lượng</span>
                    <span>Thành tiền</span>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 divide-y divide-slate-100">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.itemId}
                      item={item}
                      isUpdating={updatingItemId === item.itemId}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 pt-0 lg:pt-11">
              <CartSummarySidebar totalAmount={totalAmount} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
