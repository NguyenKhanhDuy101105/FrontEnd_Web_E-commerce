"use client";

import React from "react";
import AddressSelector from "./components/shipping/AddressSelector";
import BranchAndNoteSelector from "./components/shipping/BranchAndNoteSelector";
import PaymentSection from "./components/payment/PaymentSection";
import OrderSummarySection from "./components/order-summary/OrderSummarySection";
import VoucherSection from "./components/voucher/VoucherSection";
import CheckoutSummarySection from "./components/voucher/CheckoutSummarySection";
import BranchPickupSection from "./components/shipping/BranchPickupSection";
import OtherRecipientForm from "./components/shipping/OtherRecipientForm";
import VoucherSelectModal from "@/src/components/common/VoucherSelectModal";
import { useCheckout } from "@/src/hooks/useCheckout";

export default function CheckoutPage() {
  const {
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
    setSelectedBranch,
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
  } = useCheckout();

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
