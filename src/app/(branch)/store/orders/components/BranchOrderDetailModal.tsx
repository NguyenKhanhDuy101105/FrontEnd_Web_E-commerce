"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CheckIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  branchOrderService,
  BranchOrderDetail,
} from "@/src/services/store/branchOrderService";
import { showToast } from "@/src/utils/toast";
import ReasonModal from "./ReasonModal";
import OrderPackingChecklist from "./OrderPackingChecklist";

interface BranchOrderDetailModalProps {
  branchId: string;
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function BranchOrderDetailModal({
  branchId,
  orderId,
  isOpen,
  onClose,
  onRefresh,
}: BranchOrderDetailModalProps) {
  const [detail, setDetail] = useState<BranchOrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [reasonModalType, setReasonModalType] = useState<
    "CANCEL" | "FAILED" | null
  >(null);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const fetchDetail = useCallback(async () => {
    if (!branchId || !orderId) return;
    setLoading(true);
    try {
      const res = await branchOrderService.getBranchOrderById(
        branchId,
        orderId,
      );
      if (res?.data) {
        setDetail(res.data);
        setCheckedItems({});
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng:", error);
      showToast.error("Không thể lấy thông tin chi tiết đơn hàng!");
    } finally {
      setLoading(false);
    }
  }, [branchId, orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetail();
    } else {
      setDetail(null);
      setCheckedItems({});
    }
  }, [isOpen, orderId, fetchDetail]);

  const handleToggleCheck = (productId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleToggleCheckAll = () => {
    if (!detail?.items) return;
    const allChecked = detail.items.every((i) => checkedItems[i.productId]);
    const newStatus: Record<string, boolean> = {};

    if (!allChecked) {
      detail.items.forEach((i) => {
        newStatus[i.productId] = true;
      });
    }
    setCheckedItems(newStatus);
  };

  const isAllItemsPacked = useMemo(() => {
    if (!detail?.items || detail.items.length === 0) return false;
    return detail.items.every((i) => checkedItems[i.productId]);
  }, [detail?.items, checkedItems]);

  const packedCount = useMemo(() => {
    if (!detail?.items) return 0;
    return detail.items.filter((i) => checkedItems[i.productId]).length;
  }, [detail?.items, checkedItems]);

  if (!isOpen || !orderId) return null;

  const handleExecuteAction = async (
    actionFn: () => Promise<unknown>,
    successMessage: string,
  ) => {
    setActionLoading(true);
    try {
      await actionFn();
      showToast.success(successMessage);
      onRefresh();
      fetchDetail();
    } catch (error) {
      console.error("Lỗi thao tác:", error);
      showToast.error("Thao tác thất bại. Vui lòng thử lại!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!reasonModalType) return;
    setActionLoading(true);
    try {
      if (reasonModalType === "CANCEL") {
        await branchOrderService.cancelOrder(branchId, orderId, { reason });
        showToast.success("Đã hủy đơn hàng thành công!");
      } else {
        await branchOrderService.reportDeliveryFailed(branchId, orderId, {
          reason,
        });
        showToast.success("Đã báo cáo giao hàng thất bại!");
      }
      setReasonModalType(null);
      onRefresh();
      fetchDetail();
    } catch (error) {
      console.error("Lỗi gửi lý do:", error);
      showToast.error("Xử lý thất bại. Vui lòng thử lại!");
    } finally {
      setActionLoading(false);
    }
  };

  const isProcessingStatus = detail?.status === "PROCESSING";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl relative space-y-5 z-102 my-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800">
                  {detail ? `Đơn hàng #${detail.orderCode}` : "Đang tải..."}
                </h2>
                {detail && (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                    {detail.deliveryType === "DELIVERY"
                      ? "Giao tận nơi"
                      : "Nhận tại cửa hàng"}
                  </span>
                )}
              </div>
              {detail && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Tạo lúc: {new Date(detail.createdAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {loading || !detail ? (
            <div className="py-16 text-center text-slate-400 font-medium text-xs">
              Đang tải chi tiết đơn hàng...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-lg border border-slate-100 text-xs">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <UserIcon className="w-4 h-4 text-emerald-600" /> Khách hàng
                  </h3>
                  <p className="text-slate-800 font-bold">
                    {detail.recipientName}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {detail.recipientPhone}
                  </p>
                  <p className="text-slate-600 flex items-start gap-1 leading-relaxed">
                    <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    {detail.shippingAddress || "N/A"}
                  </p>
                </div>

                <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Thanh toán
                  </h3>
                  <p className="text-slate-700">
                    Phương thức:{" "}
                    <span className="font-bold text-slate-800">
                      {detail.paymentMethod}
                    </span>
                  </p>
                  <p className="text-slate-700">
                    Trạng thái:{" "}
                    <span
                      className={`font-bold ${
                        detail.paymentStatus === "PAID"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {detail.paymentStatus}
                    </span>
                  </p>
                  {detail.note && (
                    <p className="text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/80 mt-1">
                      Ghi chú: &quot;{detail.note}&quot;
                    </p>
                  )}
                </div>
              </div>

              <OrderPackingChecklist
                items={detail.items || []}
                isProcessingStatus={isProcessingStatus}
                checkedItems={checkedItems}
                onToggleCheck={handleToggleCheck}
                onToggleCheckAll={handleToggleCheckAll}
              />

              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Tạm tính:</span>
                  <span>{detail.subtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển:</span>
                  <span>{detail.shippingFee.toLocaleString("vi-VN")} đ</span>
                </div>
                {detail.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá:</span>
                    <span>
                      -{detail.discountAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-2 border-t border-slate-100">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-emerald-700 text-base">
                    {detail.totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-2.5 justify-end">
                {detail.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => setReasonModalType("CANCEL")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      Hủy đơn
                    </button>
                    <button
                      onClick={() =>
                        handleExecuteAction(
                          () =>
                            branchOrderService.confirmOrder(branchId, orderId),
                          "Đã xác nhận đơn hàng thành công!",
                        )
                      }
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 stroke-3" /> Xác nhận đơn
                    </button>
                  </>
                )}

                {isProcessingStatus && (
                  <button
                    onClick={() =>
                      handleExecuteAction(
                        () =>
                          branchOrderService.completePreparation(
                            branchId,
                            orderId,
                          ),
                        "Đã hoàn tất chuẩn bị hàng!",
                      )
                    }
                    disabled={actionLoading || !isAllItemsPacked}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    {isAllItemsPacked
                      ? "Hoàn tất đóng gói"
                      : `Đóng gói (${packedCount}/${detail.items?.length || 0})`}
                  </button>
                )}

                {detail.status === "READY_FOR_PICKUP" && (
                  <button
                    onClick={() =>
                      handleExecuteAction(
                        () =>
                          branchOrderService.handoverOrder(branchId, orderId),
                        "Đã bàn giao đơn hàng cho Shipper!",
                      )
                    }
                    disabled={actionLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <TruckIcon className="w-4 h-4" /> Bàn giao Shipper
                  </button>
                )}

                {detail.status === "SHIPPING" && (
                  <>
                    <button
                      onClick={() => setReasonModalType("FAILED")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition cursor-pointer border border-amber-200 disabled:opacity-50"
                    >
                      Báo giao thất bại
                    </button>
                    <button
                      onClick={() =>
                        handleExecuteAction(
                          () =>
                            branchOrderService.handoverOrder(branchId, orderId),
                          "Đã chuyển đơn sang trạng thái chờ khách nhận hàng!",
                        )
                      }
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 stroke-3" /> Xác nhận đã
                      giao
                    </button>
                  </>
                )}

                {detail.status === "DELIVERY_FAILED" && (
                  <button
                    onClick={() =>
                      handleExecuteAction(
                        () =>
                          branchOrderService.retryDelivery(branchId, orderId),
                        "Đã chuyển trạng thái thử giao lại!",
                      )
                    }
                    disabled={actionLoading}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowPathIcon className="w-4 h-4 stroke-3" /> Thử giao lại
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ReasonModal
        isOpen={!!reasonModalType}
        title={
          reasonModalType === "CANCEL"
            ? "Xác nhận hủy đơn hàng"
            : "Báo cáo giao hàng thất bại"
        }
        description={
          reasonModalType === "CANCEL"
            ? "Vui lòng nhập lý do hủy đơn hàng này từ phía chi nhánh."
            : "Vui lòng nhập lý do không thể giao hàng thành công."
        }
        isSubmitting={actionLoading}
        onClose={() => setReasonModalType(null)}
        onSubmit={handleReasonSubmit}
      />
    </>
  );
}
