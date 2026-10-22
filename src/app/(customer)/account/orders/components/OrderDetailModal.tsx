"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import orderService, {
  OrderDetail,
} from "@/src/services/customer/orderService";
import { showToast } from "@/src/utils/toast";

interface OrderDetailModalProps {
  orderId: string | null;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export default function OrderDetailModal({
  orderId,
  onClose,
  onOrderUpdated,
}: OrderDetailModalProps) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirming, setConfirming] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await orderService.getOrderById(orderId);
        if (res.status === "success" && res.data) {
          setDetail(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        showToast.error("Không thể tải thông tin chi tiết đơn hàng!");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [orderId]);

  if (!orderId) return null;

  const handleConfirmReceived = async () => {
    if (!detail) return;
    setConfirming(true);
    try {
      const res = await orderService.confirmReceived(detail.id);
      if (res.status === "success") {
        showToast.success("Xác nhận đã nhận hàng thành công!");
        setDetail(res.data);
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (error) {
      console.error("Lỗi xác nhận nhận hàng:", error);
      showToast.error("Xác nhận thất bại. Vui lòng thử lại!");
    } finally {
      setConfirming(false);
    }
  };

  const canConfirmReceived =
    detail?.status === "SHIPPING" ||
    detail?.status === "DELIVERED_PENDING_CONFIRMATION";

  return (
    <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800">
              Chi tiết đơn hàng #{detail?.orderCode || "..."}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ngày đặt:{" "}
              {detail?.createdAt
                ? new Date(detail.createdAt).toLocaleString("vi-VN")
                : "..."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Đang tải chi tiết đơn hàng...
            </div>
          ) : !detail ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Không tìm thấy thông tin đơn hàng
            </div>
          ) : (
            <>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200/60 pb-1">
                  Thông tin giao hàng
                </h4>
                <div className="flex items-center gap-2 text-slate-700">
                  <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{detail.recipientName}</span>
                  <span className="text-slate-400">|</span>
                  <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{detail.recipientPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{detail.shippingAddress}</span>
                </div>
                {detail.receiveFrom && detail.receiveTo && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Khung giờ nhận:{" "}
                      {new Date(detail.receiveFrom).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" },
                      )}{" "}
                      -{" "}
                      {new Date(detail.receiveTo).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      (
                      {new Date(detail.receiveFrom).toLocaleDateString("vi-VN")}
                      )
                    </span>
                  </div>
                )}
                {detail.note && (
                  <div className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                    Ghi chú: {detail.note}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-3">
                  Sản phẩm trong đơn ({detail.items?.length || 0})
                </h4>
                <div className="border border-slate-100 rounded-lg overflow-hidden p-1">
                  <div className="max-h-52.5 overflow-y-auto divide-y divide-slate-100 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {detail.items?.map((item) => (
                      <div
                        key={item.productId}
                        className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg border border-slate-100 overflow-hidden shrink-0 bg-white">
                          <Image
                            src={item.imageUrl || "/images/Banner1.jpeg"}
                            alt={item.productName}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.unitPrice.toLocaleString("vi-VN")}đ x{" "}
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-900 shrink-0">
                          {item.totalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs pt-2">
                <div className="flex justify-between text-slate-500">
                  <span>Tiền hàng</span>
                  <span>{detail.subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span>+{detail.shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {detail.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá Voucher</span>
                    <span>
                      -{detail.discountAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Tổng thanh toán</span>
                  <span className="text-rose-600 text-base font-black">
                    {detail.totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {detail && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Đóng
            </button>

            {canConfirmReceived && (
              <button
                type="button"
                onClick={handleConfirmReceived}
                disabled={confirming}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
              >
                {confirming ? "Đang xử lý..." : "Đã nhận được hàng"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
