"use client";

import React, { useState } from "react";
import orderService, {
  OrderDetail,
} from "@/src/services/customer/orderService";
import { showToast } from "@/src/utils/toast";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatOrderCode } from "./OrderCard";

const CANCEL_REASONS = [
  "Tôi muốn thay đổi địa chỉ / số điện thoại nhận hàng",
  "Tôi muốn thay đổi sản phẩm hoặc số lượng trong đơn",
  "Tôi quên áp dụng mã giảm giá / voucher",
  "Tôi tìm thấy lựa chọn phù hợp hơn",
  "Lý do khác",
];

interface CancelOrderModalProps {
  order: { id: string; code: string };
  onClose: () => void;
  onSuccess: (updatedOrder: OrderDetail) => void;
}

export default function CancelOrderModal({
  order,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(
    CANCEL_REASONS[0],
  );
  const [customReason, setCustomReason] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const handleConfirm = async () => {
    if (isCancelling) return;

    const finalReason =
      selectedReason === "Lý do khác" ? customReason.trim() : selectedReason;

    if (!finalReason) {
      showToast.error("Vui lòng nhập lý do hủy đơn hàng!");
      return;
    }

    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(order.id, finalReason);
      if (res.status === "success") {
        showToast.success(res.message || "Đã hủy đơn hàng thành công!");
        onSuccess(res.data);
        onClose();
      }
    } catch (error: unknown) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      const errMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Không thể hủy đơn hàng lúc này. Vui lòng thử lại!";
      showToast.error(errMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      onClick={() => !isCancelling && onClose()}
      className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200/80 space-y-4"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Xác nhận hủy đơn hàng
              </h3>
              <p className="text-xs text-slate-500">
                Mã đơn:{" "}
                <span className="font-mono font-semibold text-slate-700">
                  #{formatOrderCode(order.code)}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-700">
            Vui lòng chọn lý do hủy đơn:
          </p>
          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? "border-rose-400 bg-rose-50/50 text-slate-900 font-semibold"
                    : "border-slate-200/80 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Lý do khác" && (
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn của bạn..."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Giữ lại đơn
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            {isCancelling ? "Đang hủy đơn..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}
