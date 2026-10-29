"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "@/src/lib/axiosClient";
import { showToast } from "@/src/utils/toast";
import { calculateHaversineDistance } from "@/src/utils/distance";
import { CustomerVoucherItem } from "@/src/services/customer/voucherService";

import AddressSelector, {
  Address,
} from "./components/shipping/AddressSelector";
import BranchAndNoteSelector, {
  BranchNearby,
} from "./components/shipping/BranchAndNoteSelector";
import PaymentSection from "./components/payment/PaymentSection";
import OrderSummarySection, {
  CartItem,
} from "./components/order-summary/OrderSummarySection";
import VoucherSection from "./components/voucher/VoucherSection";
import CheckoutSummarySection from "./components/voucher/CheckoutSummarySection";
import BranchPickupSection from "./components/shipping/BranchPickupSection";
import OtherRecipientForm, {
  OtherRecipientData,
} from "./components/shipping/OtherRecipientForm";
import VoucherSelectModal from "@/src/components/common/VoucherSelectModal";

interface BranchResponseItem {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

interface CartItemResponse {
  itemId?: string;
  id?: string;
  productId?: string;
  subtotal?: number;
  unitPrice?: number;
  price?: number;
  basePrice?: number;
  quantity?: number;
}

interface OrderPayload {
  clientRequestId: string;
  branchId: string;
  deliveryType: "DELIVERY" | "PICKUP";
  promotionCode: string | null;
  note: string;
  addressId?: string | null;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  shippingLat?: number | null;
  shippingLng?: number | null;
  receiveFrom?: string | null;
  receiveTo?: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [nearbyBranches, setNearbyBranches] = useState<BranchNearby[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
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
  const [selectedBranch, setSelectedBranch] = useState<BranchNearby | null>(
    null,
  );
  const [note, setNote] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");

  const [selectedVoucher, setSelectedVoucher] =
    useState<CustomerVoucherItem | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedVoucher = localStorage.getItem("checkout_selected_voucher");
    if (savedVoucher) {
      try {
        setSelectedVoucher(JSON.parse(savedVoucher));
      } catch (e) {
        console.error("Lỗi parse checkout_selected_voucher:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isBuyNow) return;

    const savedIds = localStorage.getItem("checkout_selected_item_ids");
    if (savedIds) {
      try {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedItemIds(parsed);
          return;
        }
      } catch (e) {
        console.error("Lỗi parse checkout item ids:", e);
      }
    }
  }, [isBuyNow]);

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
          setSelectedBranch(branchesWithDistance[0]);
        } else {
          setNearbyBranches([]);
          setSelectedBranch(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách chi nhánh:", error);
        showToast.error("Không thể tải danh sách cơ sở giao hàng!");
      } finally {
        setLoadingBranch(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedBranch?.id) return;

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

    const fetchCartByBranch = async () => {
      setLoadingCart(true);
      try {
        const response = await axiosClient.get("/api/cart", {
          params: { branchId: selectedBranch.id },
        });

        const data = response.data?.data || {};
        const items: CartItem[] = data.items || [];

        if (selectedItemIds.length > 0) {
          const filteredItems = items.filter((item) => {
            const rawItem = item as CartItemResponse;
            const itemId = rawItem.itemId || rawItem.id || "";
            const productId = rawItem.productId || "";
            return (
              selectedItemIds.includes(itemId) ||
              selectedItemIds.includes(productId)
            );
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

    fetchCartByBranch();
  }, [selectedBranch, selectedItemIds, isBuyNow]);

  useEffect(() => {
    fetchAndCalculateBranches(selectedAddress);
  }, [selectedAddress, fetchAndCalculateBranches]);

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

  const calculatedShippingFee =
    distanceKm > 6 ? Math.round((distanceKm - 6) * 5000) : 0;

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

      orderPayload.addressId = defaultAddr?.id || null;
      orderPayload.receiveFrom = receiveFromDate.toISOString();
      orderPayload.receiveTo = receiveToDate.toISOString();
      orderPayload.recipientName = defaultAddr?.recipientName || "Khách hàng";
      orderPayload.recipientPhone = defaultAddr?.phone || "0987654321";
      orderPayload.shippingAddress = selectedBranch.address;
      orderPayload.shippingLat = null;
      orderPayload.shippingLng = null;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosClient.post("/api/orders", orderPayload);

      showToast.success("Đặt hàng thành công!");

      if (isBuyNow) {
        sessionStorage.removeItem("buy_now_item");
      } else {
        localStorage.removeItem("checkout_selected_item_ids");
        localStorage.removeItem("checkout_selected_voucher");
      }

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

  return (
    <div className="p-4 pb-24 sm:p-6 sm:pb-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="border-b border-slate-200 bg-white px-4 pt-3 flex items-center space-x-6">
                <button
                  type="button"
                  onClick={() => setDeliveryType("DELIVERY")}
                  className={`pb-2.5 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors ${
                    deliveryType === "DELIVERY"
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Nhận hàng tại nhà
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType("PICKUP")}
                  className={`pb-2.5 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors ${
                    deliveryType === "PICKUP"
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Nhận hàng tại chi nhánh
                </button>
              </div>

              <div className="p-4 sm:p-5">
                {deliveryType === "DELIVERY" ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 border-b border-slate-100 pb-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientMode"
                          value="SELF"
                          checked={recipientMode === "SELF"}
                          onChange={() => setRecipientMode("SELF")}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        Tự đặt (Địa chỉ đã lưu)
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientMode"
                          value="OTHER"
                          checked={recipientMode === "OTHER"}
                          onChange={() => setRecipientMode("OTHER")}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        Đặt cho người khác / Địa chỉ mới
                      </label>
                    </div>

                    {recipientMode === "SELF" ? (
                      <AddressSelector
                        addresses={addresses}
                        loading={loadingAddress}
                        selectedAddressId={selectedAddress?.id || ""}
                        onSelectAddress={setSelectedAddress}
                        onAddNewAddress={() => router.push("/account/address")}
                      />
                    ) : (
                      <OtherRecipientForm
                        formData={otherRecipient}
                        onChangeFormData={setOtherRecipient}
                      />
                    )}

                    <BranchAndNoteSelector
                      branches={nearbyBranches}
                      loading={loadingBranch}
                      selectedBranchId={selectedBranch?.id || ""}
                      note={note}
                      onSelectBranch={setSelectedBranch}
                      onChangeNote={setNote}
                    />
                  </div>
                ) : (
                  <BranchPickupSection
                    branches={nearbyBranches}
                    loadingBranch={loadingBranch}
                    onSelectBranchCallback={setSelectedBranch}
                    note={note}
                    onChangeNote={setNote}
                    deliveryDate={deliveryDate}
                    selectedTimeSlot={selectedTimeSlot}
                    onChangeDate={setDeliveryDate}
                    onChangeTimeSlot={setSelectedTimeSlot}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <OrderSummarySection cartItems={cartItems} loading={loadingCart} />

            <PaymentSection
              selectedPaymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
            />

            <VoucherSection
              selectedVoucher={selectedVoucher}
              onOpenVoucherModal={() => setIsVoucherModalOpen(true)}
              onRemoveVoucher={handleRemoveVoucher}
            />

            <CheckoutSummarySection
              subTotal={subTotal}
              shippingFee={shippingFee}
              discountAmount={discountAmount}
              distanceKm={deliveryType === "PICKUP" ? 0 : distanceKm}
              isSubmitting={isSubmitting}
              onSubmitOrder={handleCreateOrder}
            />
          </div>
        </div>
      </div>

      <VoucherSelectModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApplyVoucher={handleApplyVoucher}
        branchId={selectedBranch?.id || ""}
        orderAmount={subTotal}
        selectedVoucherCode={selectedVoucher?.code}
      />
    </div>
  );
}
