"use client";

import React from "react";
import {
  OrderSummary,
  OrderStatus,
} from "@/src/services/customer/orderService";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

interface OrderCardProps {
  order: OrderSummary;
  isConfirming: boolean;
  isCancelling?: boolean;
  onViewDetail: (orderId: string) => void;
  onCancelOrder: (order: OrderSummary) => void;
  onReviewOrder: (order: { id: string; code: string }) => void;
  onConfirmReceived: (orderId: string) => void;
}

export const formatOrderCode = (code: string) => {
  if (!code) return "";
  if (code.length > 16) {
    return `${code.slice(0, 7)}...${code.slice(-5)}`;
  }
  return code;
};

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-[11px] font-bold shrink-0">
          Chờ xác nhận
        </span>
      );
    case "PROCESSING":
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-[11px] font-bold shrink-0">
          Đang đóng gói
        </span>
      );
    case "READY_FOR_PICKUP":
      return (
        <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200/60 rounded-full text-[11px] font-bold shrink-0">
          Sẵn sàng lấy hàng
        </span>
      );
    case "SHIPPING":
      return (
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full text-[11px] font-bold shrink-0">
          Đang vận chuyển
        </span>
      );
    case "DELIVERED_PENDING_CONFIRMATION":
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300/80 rounded-full text-[11px] font-bold shrink-0">
          Đã giao hàng
        </span>
      );
    case "DELIVERY_FAILED":
      return (
        <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full text-[11px] font-bold shrink-0">
          Giao thất bại
        </span>
      );
    case "COMPLETED":
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[11px] font-bold shrink-0">
          Đã hoàn thành
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full text-[11px] font-bold shrink-0">
          Đã hủy
        </span>
      );
    case "RETURNED":
      return (
        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-full text-[11px] font-bold shrink-0">
          Trả hàng
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold shrink-0">
          {status}
        </span>
      );
  }
};

export default function OrderCard({
  order,
  isConfirming,
  isCancelling = false,
  onViewDetail,
  onCancelOrder,
  onReviewOrder,
  onConfirmReceived,
}: OrderCardProps) {
  const canCancelOrder = order.status === "PENDING";

  const canConfirmReceived =
    order.status === "DELIVERED_PENDING_CONFIRMATION" ||
    order.status === "READY_FOR_PICKUP" ||
    order.status === "SHIPPING";

  const showReviewButton =
    order.status === "COMPLETED" &&
    order.canReviewOrder &&
    !order.orderReviewed;

  const showReviewedBadge = order.status === "COMPLETED" && order.orderReviewed;

  return (
    <div className="border border-slate-200/80 rounded-xl p-3.5 sm:p-4 hover:border-slate-300 transition bg-white space-y-3 shadow-2xs">
      <div className="flex items-start justify-between pb-2.5 border-b border-slate-100 gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-xs sm:text-sm">
            Mã đơn:{" "}
            <span
              className="text-slate-900 font-mono tracking-tight"
              title={`#${order.orderCode}`}
            >
              #{formatOrderCode(order.orderCode)}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-0.5">
        <div className="space-y-0.5">
          <p className="text-slate-500">
            Chi nhánh:{" "}
            <span className="font-semibold text-slate-800">
              {order.branchName}
            </span>
          </p>
          <p className="text-slate-500">
            Hình thức:{" "}
            <span className="font-semibold text-slate-800">
              {order.deliveryType === "DELIVERY"
                ? "Giao hàng tận nơi"
                : "Nhận tại cửa hàng"}
            </span>
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-50">
          <span className="text-slate-400 text-[11px]">Tổng tiền</span>
          <span className="font-black text-green-700 text-sm sm:text-base">
            {order.totalAmount.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
        {canCancelOrder && (
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => onCancelOrder(order)}
            className="px-3 sm:px-3.5 py-1.5 border border-rose-200 bg-rose-50/70 hover:bg-rose-100 disabled:opacity-50 text-rose-600 font-bold text-xs rounded-lg transition cursor-pointer"
          >
            {isCancelling ? "Đang hủy..." : "Hủy đơn"}
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewDetail(order.id)}
          className="px-3 sm:px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
        >
          Xem chi tiết
        </button>

        {showReviewButton && (
          <button
            type="button"
            onClick={() =>
              onReviewOrder({
                id: order.id,
                code: order.orderCode,
              })
            }
            className="px-3 sm:px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
          >
            Đánh giá
          </button>
        )}

        {showReviewedBadge && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200/80 font-semibold text-xs rounded-lg">
            <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
            Đã đánh giá
          </span>
        )}

        {canConfirmReceived && (
          <button
            type="button"
            onClick={() => onConfirmReceived(order.id)}
            disabled={isConfirming}
            className="px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
          >
            {isConfirming
              ? "Đang xử lý..."
              : order.status === "READY_FOR_PICKUP"
                ? "Xác nhận đã lấy hàng"
                : "Đã nhận được hàng"}
          </button>
        )}
      </div>
    </div>
  );
}
