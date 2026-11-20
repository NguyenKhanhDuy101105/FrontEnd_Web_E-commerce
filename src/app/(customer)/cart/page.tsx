"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBagIcon,
  HomeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useBranch } from "@/src/context/BranchContext";
import { useCart } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";
import {
  incompatibilityService,
  IncompatibilityWarning,
} from "@/src/services/customer/incompatibilityService";
import CartItemRow from "./(components)/CartItemRow";
import CartSummarySidebar from "./(components)/CartSummarySidebar";
import ClearCartConfirmModal from "./(components)/ClearCartConfirmModal";

export default function CartPage() {
  const router = useRouter();
  const { branchId, selectedBranch } = useBranch();
  const { cartItems, totalQuantity, updateQuantity, refreshCart, isLoading } =
    useCart();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isClearingCart, setIsClearingCart] = useState<boolean>(false);

  const [warnings, setWarnings] = useState<IncompatibilityWarning[]>([]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItemIds((prev) => {
        if (prev.length === 0) {
          return cartItems.map((item) => item.itemId);
        }
        return prev.filter((id) =>
          cartItems.some((item) => item.itemId === id),
        );
      });
    } else {
      setSelectedItemIds([]);
    }
  }, [cartItems]);

  const checkIncompatibilities = useCallback(async () => {
    const selectedProducts = cartItems.filter((item) =>
      selectedItemIds.includes(item.itemId),
    );

    const productIds = Array.from(
      new Set(selectedProducts.map((item) => item.productId)),
    );

    if (productIds.length < 2) {
      setWarnings([]);
      return;
    }

    try {
      const res = await incompatibilityService.checkCartIncompatibilities({
        productIds,
      });

      const data = res?.data || res;
      if (data?.hasConflict && Array.isArray(data?.warnings)) {
        setWarnings(data.warnings);
      } else {
        setWarnings([]);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra kỵ nhau của sản phẩm:", error);
      setWarnings([]);
    }
  }, [cartItems, selectedItemIds]);

  useEffect(() => {
    checkIncompatibilities();
  }, [checkIncompatibilities]);

  const isAllSelected = useMemo(() => {
    return cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  }, [cartItems, selectedItemIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cartItems.map((item) => item.itemId));
    }
  };

  const handleToggleSelectItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const selectedTotalAmount = useMemo(() => {
    return cartItems
      .filter((item) => selectedItemIds.includes(item.itemId))
      .reduce(
        (sum, item) => sum + (item.subtotal || item.unitPrice * item.quantity),
        0,
      );
  }, [cartItems, selectedItemIds]);

  const handleUpdateQuantity = async (
    itemId: string,
    currentQty: number,
    change: number,
  ) => {
    const targetItem = cartItems.find((i) => i.itemId === itemId);
    if (!targetItem) return;

    const newQty = currentQty + change;
    setUpdatingItemId(itemId);
    try {
      await updateQuantity(targetItem.productId, newQty);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const targetItem = cartItems.find((i) => i.itemId === itemId);
    if (!targetItem) return;

    setUpdatingItemId(itemId);
    try {
      await updateQuantity(targetItem.productId, 0);
      setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleConfirmClearCart = async () => {
    if (cartItems.length === 0 || isClearingCart) return;

    const itemsToDelete = [...cartItems];
    setIsClearModalOpen(false);
    setSelectedItemIds([]);
    setIsClearingCart(true);

    try {
      await Promise.all(
        itemsToDelete.map((item) => updateQuantity(item.productId, 0)),
      );
      showToast.success("Đã xóa toàn bộ sản phẩm trong giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
      showToast.error("Có lỗi xảy ra khi xóa giỏ hàng. Vui lòng thử lại!");
    } finally {
      setIsClearingCart(false);
    }
  };
  const handleGoToCheckout = () => {
    if (selectedItemIds.length === 0) {
      showToast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    localStorage.setItem(
      "checkout_selected_item_ids",
      JSON.stringify(selectedItemIds),
    );
    router.push("/checkout");
  };

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case "DANGEROUS":
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full border bg-purple-100 text-purple-800 border-purple-200">
            Mức độ: Nguy hiểm
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full border bg-rose-100 text-rose-800 border-rose-200">
            Mức độ: Cao
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full border bg-amber-100 text-amber-800 border-amber-200">
            Mức độ: Trung bình
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200">
            Mức độ: Thấp (Nhẹ)
          </span>
        );
    }
  };

  if (!branchId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-600 font-medium">
        Vui lòng chọn siêu thị để xem giỏ hàng.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <nav className="text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-4 flex items-center space-x-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 transition font-bold"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">Giỏ hàng</span>
        </nav>

        {isLoading && cartItems.length === 0 ? (
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
        ) : cartItems.length === 0 ? (
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
                  disabled={isClearingCart}
                  onClick={() => setIsClearModalOpen(true)}
                  className="text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isClearingCart ? "Đang xóa..." : "Xóa tất cả"}
                </button>
              </div>

              {warnings.length > 0 && (
                <div className="space-y-3">
                  {warnings.map((warn) => (
                    <div
                      key={warn.id}
                      className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {warn.title}
                            </h4>
                            {renderSeverityBadge(warn.severity)}
                          </div>

                          {warn.conflictingProducts &&
                            warn.conflictingProducts.length > 0 && (
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                <span className="text-[11px] font-semibold text-slate-600">
                                  Sản phẩm kỵ nhau:
                                </span>
                                {warn.conflictingProducts.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center gap-1.5 bg-white border border-amber-200/80 px-2 py-1 rounded-lg text-xs"
                                  >
                                    {p.imageUrl && (
                                      <div className="relative w-4 h-4 shrink-0">
                                        <Image
                                          src={p.imageUrl}
                                          alt={p.name}
                                          fill
                                          sizes="16px"
                                          unoptimized
                                          className="object-contain rounded"
                                        />
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-800">
                                      {p.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {warn.effect && (
                            <p className="text-xs text-amber-900 leading-relaxed pt-1">
                              <span className="font-semibold">Tác hại:</span>{" "}
                              {warn.effect}
                            </p>
                          )}

                          {warn.recommendation && (
                            <p className="text-xs text-slate-700 leading-relaxed">
                              <span className="font-semibold text-emerald-800">
                                Khuyên dùng:
                              </span>{" "}
                              {warn.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-lg p-3.5 sm:p-6 shadow-xs border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs sm:text-sm">
                  <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="truncate max-w-50 sm:max-w-none">
                      {selectedBranch?.name || "UrbanMart"} (
                      {selectedItemIds.length}/{cartItems.length} chọn)
                    </span>
                  </label>

                  <div className="hidden sm:flex items-center space-x-12 pr-2 font-semibold text-slate-500">
                    <span>Đơn giá</span>
                    <span>Số lượng</span>
                    <span>Thành tiền</span>
                  </div>
                </div>

                <div className="max-h-115 overflow-y-auto space-y-4 sm:space-y-6 divide-y divide-slate-100 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.itemId}
                      item={item}
                      isSelected={selectedItemIds.includes(item.itemId)}
                      onToggleSelect={() => handleToggleSelectItem(item.itemId)}
                      isUpdating={updatingItemId === item.itemId}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 pt-0 lg:pt-11">
              <CartSummarySidebar
                totalAmount={selectedTotalAmount}
                selectedCount={selectedItemIds.length}
                onCheckout={handleGoToCheckout}
              />
            </div>
          </div>
        )}
      </div>

      <ClearCartConfirmModal
        isOpen={isClearModalOpen}
        itemCount={cartItems.length}
        branchName={selectedBranch?.name}
        isClearing={isClearingCart}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearCart}
      />
    </div>
  );
}
