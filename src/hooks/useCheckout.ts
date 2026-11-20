"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "@/src/lib/axiosClient";
import { showToast } from "@/src/utils/toast";
import { calculateHaversineDistance } from "@/src/utils/distance";
import { CustomerVoucherItem } from "@/src/services/customer/voucherService";
import { cartService } from "@/src/services/customer/cartService";
import { Address } from "@/src/app/(customer)/checkout/components/shipping/AddressSelector";
import { BranchNearby } from "@/src/app/(customer)/checkout/components/shipping/BranchAndNoteSelector";
import { CartItem } from "@/src/app/(customer)/checkout/components/order-summary/OrderSummarySection";
import { OtherRecipientData } from "@/src/app/(customer)/checkout/components/shipping/OtherRecipientForm";
import {
  BranchResponseItem,
  CartItemResponse,
  OrderPayload,
} from "@/src/types/checkout";
import { orderBadgeManager } from "@/src/utils/orderBadgeEvent";
import { useCart } from "@/src/context/CartContext";
import { useBranch } from "@/src/context/BranchContext";

function calculateShippingFeeByPolicy(
  distanceKm: number,
  subTotal: number,
): number {
  let baseFee = 10000;
  if (distanceKm <= 5) {
    baseFee = 10000;
  } else if (distanceKm <= 15) {
    baseFee = 20000;
  } else if (distanceKm <= 30) {
    baseFee = 30000;
  } else {
    baseFee = 40000;
  }

  if (subTotal < 300000) {
    return baseFee;
  }

  if (subTotal <= 500000) {
    if (distanceKm <= 5) return 0;
    return Math.round(baseFee * 0.5);
  }

  if (distanceKm <= 30) {
    return 0;
  }
  return 20000;
}

export function useCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";
  const { refreshCart } = useCart();
  const { selectedBranch: contextBranch, setSelectedBranch: setContextBranch } =
    useBranch();

  const preferredContextBranchId = contextBranch?.id;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [nearbyBranches, setNearbyBranches] = useState<BranchNearby[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (isBuyNow && typeof window !== "undefined") {
      try {
        const storedItem = sessionStorage.getItem("buy_now_item");
        if (storedItem) {
          return [JSON.parse(storedItem)];
        }
      } catch (e) {
        console.error("Lỗi parse buy_now_item:", e);
      }
    }
    return [];
  });
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
    if (isBuyNow || typeof window === "undefined") return [];
    try {
      const savedIds = localStorage.getItem("checkout_selected_item_ids");
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Lỗi parse checkout item ids:", e);
    }
    return [];
  });
  const [migratedProductIds, setMigratedProductIds] = useState<string[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(true);
  const [loadingBranch, setLoadingBranch] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY",
  );
  const [recipientMode, setRecipientMode] = useState<"SELF" | "OTHER">("SELF");

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [otherRecipient, setOtherRecipient] = useState<OtherRecipientData>({
    recipientName: "",
    recipientPhone: "",
    city: "",
    district: "",
    ward: "",
    line: "",
  });

  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10-12");

  const [selectedBranch, setSelectedBranchState] =
    useState<BranchNearby | null>(() => {
      if (contextBranch) {
        return {
          id: contextBranch.id,
          name: contextBranch.name,
          address: contextBranch.address,
          phone: contextBranch.phone || "",
          distanceKm: 0,
        };
      }
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("selectedBranch");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.id) {
              return {
                id: parsed.id,
                name: parsed.name,
                address: parsed.address,
                phone: parsed.phone || "",
                distanceKm: 0,
              };
            }
          }
        } catch {
          return null;
        }
      }
      return null;
    });

  const [note, setNote] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");

  const [selectedVoucher, setSelectedVoucher] =
    useState<CustomerVoucherItem | null>(() => {
      if (typeof window === "undefined") return null;
      try {
        const savedVoucher = localStorage.getItem("checkout_selected_voucher");
        if (savedVoucher) {
          return JSON.parse(savedVoucher);
        }
      } catch (e) {
        console.error("Lỗi parse checkout_selected_voucher:", e);
      }
      return null;
    });
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);

  const handleSelectBranch = useCallback(
    async (newBranch: BranchNearby | null) => {
      if (!newBranch) {
        setSelectedBranchState(null);
        return;
      }

      if (newBranch.id === selectedBranch?.id) return;

      const currentItemsToMigrate = [...cartItems];

      setSelectedBranchState(newBranch);
      setContextBranch({
        id: newBranch.id,
        name: newBranch.name,
        address: newBranch.address,
        phone: newBranch.phone,
      } as Parameters<typeof setContextBranch>[0]);

      if (isBuyNow || currentItemsToMigrate.length === 0) {
        return;
      }

      setLoadingCart(true);
      try {
        const existingRes = await axiosClient.get("/api/cart", {
          params: { branchId: newBranch.id },
        });
        const existingItems: CartItemResponse[] =
          existingRes.data?.data?.items || [];
        const existingProductIds = new Set(
          existingItems.map((item) => item.productId || item.id || ""),
        );

        const targetProductIds: string[] = [];
        const failedNames: string[] = [];

        for (const item of currentItemsToMigrate) {
          const rawItem = item as CartItemResponse & CartItem;
          const prodId = rawItem.productId || rawItem.id || "";
          const prodName =
            rawItem.productName || rawItem.name || rawItem.title || "Sản phẩm";
          const qty = rawItem.quantity || 1;

          if (!prodId) continue;

          if (existingProductIds.has(prodId)) {
            targetProductIds.push(prodId);
            continue;
          }

          try {
            await cartService.addToCart({
              branchId: newBranch.id,
              productId: prodId,
              quantity: qty,
            });
            targetProductIds.push(prodId);
          } catch {
            failedNames.push(prodName);
          }
        }

        setMigratedProductIds(targetProductIds);
        setSelectedItemIds(targetProductIds);
        localStorage.setItem(
          "checkout_selected_item_ids",
          JSON.stringify(targetProductIds),
        );

        await refreshCart();

        if (failedNames.length > 0) {
          showToast.error(
            `Một số sản phẩm tạm hết hàng tại ${newBranch.name}: ${failedNames.join(", ")}`,
          );
        } else {
          showToast.success(
            `Đã chuyển đơn hàng sang giao từ ${newBranch.name}`,
          );
        }
      } catch (error) {
        console.error("Lỗi chuyển sản phẩm sang chi nhánh mới:", error);
        showToast.error(
          "Không thể đồng bộ giỏ hàng sang chi nhánh mới. Vui lòng thử lại!",
        );
      } finally {
        setLoadingCart(false);
      }
    },
    [selectedBranch?.id, cartItems, setContextBranch, isBuyNow, refreshCart],
  );

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddress(true);
      try {
        const response = await axiosClient.get("/api/addresses");
        const list: Address[] = response.data?.data || response.data || [];
        setAddresses(list);

        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddress(defaultAddr);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách địa chỉ:", error);
        showToast.error("Không thể tải danh sách địa chỉ giao hàng!");
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, []);

  const fetchAndCalculateBranches = useCallback(
    async (currentAddress: Address | null) => {
      setLoadingBranch(true);
      try {
        const response = await axiosClient.get("/api/branches", {
          params: { page: 0, size: 50 },
        });

        const rawData = response.data?.data;
        const branchList: BranchResponseItem[] =
          rawData?.content || (Array.isArray(rawData) ? rawData : []);

        if (branchList.length > 0) {
          const branchesWithDistance: BranchNearby[] = branchList.map((b) => {
            let distance = 0;
            if (currentAddress?.lat && currentAddress?.lng && b.lat && b.lng) {
              distance = calculateHaversineDistance(
                currentAddress.lat,
                currentAddress.lng,
                b.lat,
                b.lng,
              );
            } else {
              distance = 2.5;
            }

            return {
              id: b.id,
              name: b.name,
              address: b.address,
              phone: b.phone || "",
              distanceKm: distance,
            };
          });

          branchesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
          setNearbyBranches(branchesWithDistance);

          let targetBranchId = preferredContextBranchId;
          if (!targetBranchId && typeof window !== "undefined") {
            try {
              const saved = localStorage.getItem("selectedBranch");
              if (saved) targetBranchId = JSON.parse(saved)?.id;
            } catch {
              targetBranchId = undefined;
            }
          }

          const matchedBranch = targetBranchId
            ? branchesWithDistance.find((b) => b.id === targetBranchId)
            : undefined;

          setSelectedBranchState(matchedBranch || branchesWithDistance[0]);
        } else {
          setNearbyBranches([]);
          setSelectedBranchState(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách chi nhánh:", error);
        showToast.error("Không thể tải danh sách cơ sở giao hàng!");
      } finally {
        setLoadingBranch(false);
      }
    },
    [preferredContextBranchId],
  );

  useEffect(() => {
    fetchAndCalculateBranches(selectedAddress);
  }, [selectedAddress, fetchAndCalculateBranches]);

  const activeBranchId = selectedBranch?.id;

  useEffect(() => {
    if (!activeBranchId) return;

    const loadCheckoutItems = async () => {
      if (isBuyNow) {
        const storedItem = sessionStorage.getItem("buy_now_item");
        if (storedItem) {
          try {
            const parsed = JSON.parse(storedItem);
            setCartItems([parsed]);
            return;
          } catch (e) {
            console.error("Lỗi parse buy_now_item:", e);
          }
        }
      }

      setLoadingCart(true);
      try {
        const response = await axiosClient.get("/api/cart", {
          params: { branchId: activeBranchId },
        });

        const data = response.data?.data || {};
        const items: CartItem[] = data.items || [];

        const filterIds =
          migratedProductIds.length > 0 ? migratedProductIds : selectedItemIds;

        if (filterIds.length > 0) {
          const filteredItems = items.filter((item) => {
            const rawItem = item as CartItemResponse;
            const itemId = rawItem.itemId || rawItem.id || "";
            const productId = rawItem.productId || "";
            return filterIds.includes(itemId) || filterIds.includes(productId);
          });
          setCartItems(filteredItems);
        } else {
          setCartItems(items);
        }
      } catch (error) {
        console.error("Lỗi khi tải giỏ hàng theo chi nhánh:", error);
        showToast.error("Không thể lấy thông tin giỏ hàng cho chi nhánh này!");
      } finally {
        setLoadingCart(false);
      }
    };

    loadCheckoutItems();
  }, [activeBranchId, selectedItemIds, migratedProductIds, isBuyNow]);

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const rawItem = item as CartItemResponse;
      const itemTotal =
        rawItem.subtotal ??
        (rawItem.unitPrice ?? rawItem.price ?? rawItem.basePrice ?? 0) *
          (rawItem.quantity || 1);
      return sum + itemTotal;
    }, 0);
  }, [cartItems]);

  const distanceKm = selectedBranch?.distanceKm || 0;
  const calculatedShippingFee = useMemo(
    () => calculateShippingFeeByPolicy(distanceKm, subTotal),
    [distanceKm, subTotal],
  );
  const shippingFee = deliveryType === "PICKUP" ? 0 : calculatedShippingFee;

  const discountAmount = useMemo(() => {
    if (!selectedVoucher || subTotal === 0) return 0;
    if (
      selectedVoucher.minOrderAmount &&
      subTotal < selectedVoucher.minOrderAmount
    ) {
      return 0;
    }
    if (selectedVoucher.discountType === "PERCENT") {
      const calculated = (subTotal * selectedVoucher.discountValue) / 100;
      if (
        selectedVoucher.maxDiscountAmount &&
        calculated > selectedVoucher.maxDiscountAmount
      ) {
        return selectedVoucher.maxDiscountAmount;
      }
      return calculated;
    }
    return selectedVoucher.discountValue;
  }, [selectedVoucher, subTotal]);

  const handleApplyVoucher = (voucher: CustomerVoucherItem) => {
    setSelectedVoucher(voucher);
    localStorage.setItem("checkout_selected_voucher", JSON.stringify(voucher));
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    localStorage.removeItem("checkout_selected_voucher");
  };

  const handleCreateOrder = async () => {
    if (!selectedBranch) {
      showToast.error("Chưa chọn cơ sở giao hàng!");
      return;
    }

    if (cartItems.length === 0) {
      showToast.error("Không có sản phẩm nào được chọn để thanh toán!");
      return;
    }

    const orderPayload: OrderPayload = {
      clientRequestId:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `req_${Date.now()}`,
      branchId: selectedBranch.id,
      deliveryType,
      promotionCode: selectedVoucher?.code || null,
      note: note || "",
    };

    if (deliveryType === "DELIVERY") {
      if (recipientMode === "SELF") {
        if (!selectedAddress) {
          showToast.error("Vui lòng chọn địa chỉ nhận hàng!");
          return;
        }
        orderPayload.addressId = selectedAddress.id;
        orderPayload.recipientName = selectedAddress.recipientName;
        orderPayload.recipientPhone = selectedAddress.phone;
      } else {
        if (
          !otherRecipient.recipientName?.trim() ||
          !otherRecipient.recipientPhone?.trim() ||
          !otherRecipient.line?.trim() ||
          !otherRecipient.ward?.trim() ||
          !otherRecipient.district?.trim() ||
          !otherRecipient.city?.trim()
        ) {
          showToast.error("Vui lòng điền đầy đủ thông tin người nhận mới!");
          return;
        }

        const otherParts = [
          otherRecipient.line,
          otherRecipient.ward,
          otherRecipient.district,
          otherRecipient.city,
        ]
          .map((p) => p?.trim())
          .filter(Boolean);

        orderPayload.receiveFrom = null;
        orderPayload.receiveTo = null;
        orderPayload.recipientName = otherRecipient.recipientName.trim();
        orderPayload.recipientPhone = otherRecipient.recipientPhone.trim();
        orderPayload.shippingAddress = otherParts.join(", ");
        orderPayload.shippingLat = 21.028511;
        orderPayload.shippingLng = 105.804817;
      }
    } else {
      const [startHourStr, endHourStr] = selectedTimeSlot.split("-");
      const startHour = startHourStr ? parseInt(startHourStr, 10) : 10;
      const endHour = endHourStr ? parseInt(endHourStr, 10) : 12;

      const receiveFromDate = new Date(
        `${deliveryDate}T${startHour.toString().padStart(2, "0")}:00:00.000Z`,
      );
      const receiveToDate = new Date(
        `${deliveryDate}T${endHour.toString().padStart(2, "0")}:00:00.000Z`,
      );

      const defaultAddr = selectedAddress || addresses[0];

      orderPayload.addressId = null;
      orderPayload.receiveFrom = receiveFromDate.toISOString();
      orderPayload.receiveTo = receiveToDate.toISOString();
      orderPayload.recipientName = defaultAddr?.recipientName || "Khách hàng";
      orderPayload.recipientPhone = defaultAddr?.phone || "0987654321";
      orderPayload.shippingAddress = null;
      orderPayload.shippingLat = null;
      orderPayload.shippingLng = null;
    }

    setIsSubmitting(true);
    try {
      if (isBuyNow) {
        const buyNowItem = cartItems[0] as CartItemResponse;
        const targetProductId = buyNowItem.productId || buyNowItem.id || "";
        const targetQty = buyNowItem.quantity || 1;

        await cartService.addToCart({
          branchId: selectedBranch.id,
          productId: targetProductId,
          quantity: targetQty,
        });
      }

      const response = await axiosClient.post("/api/orders", orderPayload);
      showToast.success("Đặt hàng thành công!");
      orderBadgeManager.setHasUnread();

      await refreshCart();

      if (isBuyNow) {
        sessionStorage.removeItem("buy_now_item");
      } else {
        localStorage.removeItem("checkout_selected_item_ids");
      }
      localStorage.removeItem("checkout_selected_voucher");

      const orderData = response.data?.data || response.data;

      if (paymentMethod === "VNPAY" && orderData?.paymentUrl) {
        window.location.href = orderData.paymentUrl;
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      let errorMessage = "Đặt hàng thất bại. Vui lòng thử lại!";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        errorMessage = (error as { response: { data: { message: string } } })
          .response.data.message;
      }
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addresses,
    nearbyBranches,
    cartItems,
    loadingCart,
    loadingAddress,
    loadingBranch,
    isSubmitting,
    deliveryType,
    setDeliveryType,
    recipientMode,
    setRecipientMode,
    selectedAddress,
    setSelectedAddress,
    otherRecipient,
    setOtherRecipient,
    deliveryDate,
    setDeliveryDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    selectedBranch,
    setSelectedBranch: handleSelectBranch,
    note,
    setNote,
    paymentMethod,
    setPaymentMethod,
    selectedVoucher,
    isVoucherModalOpen,
    setIsVoucherModalOpen,
    subTotal,
    distanceKm,
    shippingFee,
    discountAmount,
    handleApplyVoucher,
    handleRemoveVoucher,
    handleCreateOrder,
    router,
  };
}
