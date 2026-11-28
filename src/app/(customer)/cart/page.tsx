"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBagIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useBranch } from "@/src/context/BranchContext";
import { useCart, CartItem } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";
import {
  incompatibilityService,
  IncompatibilityWarning,
} from "@/src/services/customer/incompatibilityService";
import CartItemRow from "./(components)/CartItemRow";
import CartSummarySidebar from "./(components)/CartSummarySidebar";
import ClearCartConfirmModal from "./(components)/ClearCartConfirmModal";

const DESIRED_QTY_STORAGE_KEY = "cart_desired_quantities";

const readDesiredQuantities = (): Record<string, number> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DESIRED_QTY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeDesiredQuantities = (map: Record<string, number>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DESIRED_QTY_STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

export default function CartPage() {
  const router = useRouter();
  const { branchId, selectedBranch } = useBranch();
  const {
    cartItems,
    totalQuantity,
    updateQuantity,
    clearCart,
    refreshCart,
    isLoading,
  } = useCart();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isSyncingBranch, setIsSyncingBranch] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isClearingCart, setIsClearingCart] = useState<boolean>(false);
  const [warnings, setWarnings] = useState<IncompatibilityWarning[]>([]);
  const [outOfStockAtBranchMap, setOutOfStockAtBranchMap] = useState<
    Record<string, boolean>
  >({});

  const lastSyncedBranchRef = useRef<string | null>(null);
  const isSyncRunningRef = useRef<boolean>(false);
  const updateQuantityRef = useRef(updateQuantity);
  const refreshCartRef = useRef(refreshCart);
  const branchNameRef = useRef(selectedBranch?.name);

  useEffect(() => {
    updateQuantityRef.current = updateQuantity;
    refreshCartRef.current = refreshCart;
    branchNameRef.current = selectedBranch?.name;
  }, [updateQuantity, refreshCart, selectedBranch?.name]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Đồng bộ số lượng mong muốn ban đầu cho các item đã hợp lệ với chi nhánh hiện tại
  useEffect(() => {
    if (!branchId || isLoading || isSyncRunningRef.current) return;
    const savedMap = readDesiredQuantities();
    let hasChanged = false;

    cartItems.forEach((item) => {
      if (
        (!item.branchId || item.branchId === branchId) &&
        !outOfStockAtBranchMap[item.productId] &&
        !savedMap[item.productId] &&
        item.quantity > 0
      ) {
        savedMap[item.productId] = item.quantity;
        hasChanged = true;
      }
    });

    if (hasChanged) {
      writeDesiredQuantities(savedMap);
    }
  }, [branchId, cartItems, isLoading, outOfStockAtBranchMap]);

  useEffect(() => {
    if (!branchId || isLoading || cartItems.length === 0) return;
    if (isSyncRunningRef.current) return;

    const mismatchedItems = cartItems.filter(
      (item) =>
        (item.branchId && item.branchId !== branchId) ||
        Boolean(outOfStockAtBranchMap[item.productId]),
    );

    if (mismatchedItems.length === 0) {
      lastSyncedBranchRef.current = branchId;
      return;
    }

    if (lastSyncedBranchRef.current === branchId) return;

    lastSyncedBranchRef.current = branchId;
    isSyncRunningRef.current = true;

    const syncAndClampStockForBranch = async () => {
      setIsSyncingBranch(true);
      const targetBranchName = branchNameRef.current || "chi nhánh này";
      const desiredMap = readDesiredQuantities();
      const nextOutOfStockMap: Record<string, boolean> = {};

      try {
        for (const item of mismatchedItems) {
          const desiredQty = desiredMap[item.productId] || item.quantity;
          if (!desiredMap[item.productId] && item.quantity > 0) {
            desiredMap[item.productId] = item.quantity;
            writeDesiredQuantities(desiredMap);
          }

          try {
            await updateQuantityRef.current(item.productId, desiredQty, {
              silent: true,
            });
            nextOutOfStockMap[item.productId] = false;
          } catch (err: unknown) {
            const errMsg =
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "";
            const stockMatch = errMsg.match(/(\d+)/);
            const parsedStock = stockMatch ? parseInt(stockMatch[1], 10) : NaN;

            let resolvedQty = 0;

            if (
              !isNaN(parsedStock) &&
              parsedStock > 0 &&
              parsedStock < desiredQty
            ) {
              try {
                await updateQuantityRef.current(item.productId, parsedStock, {
                  silent: true,
                });
                resolvedQty = parsedStock;
              } catch {}
            }

            if (resolvedQty === 0 && desiredQty > 1) {
              let low = 1;
              let high = desiredQty - 1;
              while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                try {
                  await updateQuantityRef.current(item.productId, mid, {
                    silent: true,
                  });
                  resolvedQty = mid;
                  low = mid + 1;
                } catch {
                  high = mid - 1;
                }
              }
            }

            if (resolvedQty > 0) {
              nextOutOfStockMap[item.productId] = false;
              showToast.error(
                `Xin lỗi, sản phẩm "${item.productName}" tại ${targetBranchName} chỉ còn ${resolvedQty} sản phẩm. Số lượng đã được điều chỉnh về ${resolvedQty}.`,
              );
            } else {
              // Giữ nguyên sản phẩm trong giỏ, không xóa về 0 để khôi phục khi quay lại chi nhánh cũ
              nextOutOfStockMap[item.productId] = true;
              showToast.error(
                `Xin lỗi, sản phẩm "${item.productName}" hiện đã hết hàng tại ${targetBranchName}.`,
              );
            }
          }
        }

        setOutOfStockAtBranchMap(nextOutOfStockMap);
        await refreshCartRef.current();
      } catch (error) {
        console.error("Lỗi đồng bộ tồn kho theo chi nhánh:", error);
      } finally {
        isSyncRunningRef.current = false;
        setIsSyncingBranch(false);
      }
    };

    syncAndClampStockForBranch();
  }, [branchId, cartItems, isLoading, outOfStockAtBranchMap]);

  const effectiveCartItems: CartItem[] = useMemo(() => {
    return cartItems.map((item) => {
      if (outOfStockAtBranchMap[item.productId]) {
        return {
          ...item,
          stock: 0,
        };
      }
      return item;
    });
  }, [cartItems, outOfStockAtBranchMap]);

  const availableItems = useMemo(() => {
    return effectiveCartItems.filter(
      (item) => typeof item.stock !== "number" || item.stock > 0,
    );
  }, [effectiveCartItems]);

  const effectiveSelectedItemIds = useMemo(() => {
    if (availableItems.length === 0) return [];
    if (selectedItemIds === null) {
      return availableItems.map((item) => item.itemId);
    }
    return selectedItemIds.filter((id) =>
      availableItems.some((item) => item.itemId === id),
    );
  }, [availableItems, selectedItemIds]);

  const selectedProductIds = useMemo(() => {
    const selectedProducts = effectiveCartItems.filter((item) =>
      effectiveSelectedItemIds.includes(item.itemId),
    );
    return Array.from(new Set(selectedProducts.map((item) => item.productId)));
  }, [effectiveCartItems, effectiveSelectedItemIds]);

  useEffect(() => {
    if (selectedProductIds.length < 2) return;

    let isCancelled = false;

    const fetchWarnings = async () => {
      try {
        const res = await incompatibilityService.checkCartIncompatibilities({
          productIds: selectedProductIds,
        });

        if (isCancelled) return;
        const data = res?.data || res;
        if (data?.hasConflict && Array.isArray(data?.warnings)) {
          setWarnings(data.warnings);
        } else {
          setWarnings([]);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra kỵ nhau của sản phẩm:", error);
        if (!isCancelled) {
          setWarnings([]);
        }
      }
    };

    fetchWarnings();

    return () => {
      isCancelled = true;
    };
  }, [selectedProductIds]);

  const displayedWarnings = useMemo(() => {
    return selectedProductIds.length < 2 ? [] : warnings;
  }, [selectedProductIds.length, warnings]);

  const isAllSelected = useMemo(() => {
    return (
      availableItems.length > 0 &&
      effectiveSelectedItemIds.length === availableItems.length
    );
  }, [availableItems, effectiveSelectedItemIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(availableItems.map((item) => item.itemId));
    }
  };

  const handleToggleSelectItem = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const current =
        prev === null ? availableItems.map((item) => item.itemId) : prev;
      return current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
    });
  };

  const selectedTotalAmount = useMemo(() => {
    return effectiveCartItems
      .filter((item) => effectiveSelectedItemIds.includes(item.itemId))
      .reduce(
        (sum, item) => sum + (item.subtotal || item.unitPrice * item.quantity),
        0,
      );
  }, [effectiveCartItems, effectiveSelectedItemIds]);

  const handleUpdateQuantity = async (
    itemId: string,
    currentQty: number,
    change: number,
  ) => {
    const targetItem = effectiveCartItems.find((i) => i.itemId === itemId);
    if (!targetItem) return;

    const newQty = currentQty + change;
    setUpdatingItemId(itemId);
    try {
      await updateQuantity(targetItem.productId, newQty);

      const desiredMap = readDesiredQuantities();
      if (newQty <= 0) {
        delete desiredMap[targetItem.productId];
      } else {
        desiredMap[targetItem.productId] = newQty;
      }
      writeDesiredQuantities(desiredMap);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const targetItem = effectiveCartItems.find((i) => i.itemId === itemId);
    if (!targetItem) return;

    setUpdatingItemId(itemId);
    try {
      await updateQuantity(targetItem.productId, 0);

      const desiredMap = readDesiredQuantities();
      delete desiredMap[targetItem.productId];
      writeDesiredQuantities(desiredMap);

      setOutOfStockAtBranchMap((prev) => {
        const next = { ...prev };
        delete next[targetItem.productId];
        return next;
      });

      setSelectedItemIds((prev) =>
        prev === null ? null : prev.filter((id) => id !== itemId),
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleConfirmClearCart = async () => {
    if (effectiveCartItems.length === 0 || isClearingCart) return;

    setIsClearModalOpen(false);
    setIsClearingCart(true);

    try {
      await clearCart();
      writeDesiredQuantities({});
      setOutOfStockAtBranchMap({});
      setSelectedItemIds([]);
    } catch {
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleGoToCheckout = () => {
    if (!branchId) {
      showToast.error("Vui lòng chọn siêu thị giao hàng trước khi thanh toán!");
      return;
    }

    if (effectiveSelectedItemIds.length === 0) {
      showToast.error(
        "Vui lòng chọn ít nhất 1 sản phẩm còn hàng để thanh toán!",
      );
      return;
    }

    localStorage.setItem(
      "checkout_selected_item_ids",
      JSON.stringify(effectiveSelectedItemIds),
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

        {isLoading && effectiveCartItems.length === 0 ? (
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
        ) : effectiveCartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-xs border border-slate-100 space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Giỏ hàng của bạn đang trống
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Hãy chọn thêm các sản phẩm chất lượng từ cửa hàng{" "}
              {selectedBranch?.name || "UrbanMart"}.
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
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
                    Giỏ hàng ({totalQuantity})
                  </h1>
                  {isSyncingBranch && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      Đang đồng bộ tồn kho...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isClearingCart}
                  onClick={() => setIsClearModalOpen(true)}
                  className="text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isClearingCart ? "Đang xóa..." : "Xóa tất cả"}
                </button>
              </div>

              {displayedWarnings.length > 0 && (
                <div className="space-y-3">
                  {displayedWarnings.map((warn) => (
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
                      disabled={availableItems.length === 0 || isSyncingBranch}
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                    />
                    <span className="truncate max-w-50 sm:max-w-none">
                      {selectedBranch?.name || "UrbanMart"} (
                      {effectiveSelectedItemIds.length}/{availableItems.length}{" "}
                      chọn)
                    </span>
                  </label>

                  <div className="hidden sm:flex items-center space-x-12 pr-2 font-semibold text-slate-500">
                    <span>Đơn giá</span>
                    <span>Số lượng</span>
                    <span>Thành tiền</span>
                  </div>
                </div>

                <div className="max-h-115 overflow-y-auto space-y-4 sm:space-y-6 divide-y divide-slate-100 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {effectiveCartItems.map((item) => (
                    <CartItemRow
                      key={item.itemId}
                      item={item}
                      isSelected={effectiveSelectedItemIds.includes(
                        item.itemId,
                      )}
                      onToggleSelect={() => handleToggleSelectItem(item.itemId)}
                      isUpdating={
                        updatingItemId === item.itemId || isSyncingBranch
                      }
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
                selectedCount={effectiveSelectedItemIds.length}
                onCheckout={handleGoToCheckout}
              />
            </div>
          </div>
        )}
      </div>

      <ClearCartConfirmModal
        isOpen={isClearModalOpen}
        itemCount={effectiveCartItems.length}
        isClearing={isClearingCart}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearCart}
      />
    </div>
  );
}
