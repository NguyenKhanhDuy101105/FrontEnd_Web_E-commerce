"use client";

import React, { useState } from "react";
import {
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  BranchOrderSummary,
  BranchOrderStatus,
  branchOrderService,
} from "@/src/services/store/branchOrderService";
import { showToast } from "@/src/utils/toast";
import ReasonModal from "./ReasonModal";

interface BranchOrderTableProps {
  branchId: string;
  orders: BranchOrderSummary[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onSelectOrder: (orderId: string) => void;
  onRefresh: () => void;
}

export default function BranchOrderTable({
  branchId,
  orders,
  loading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onSelectOrder,
  onRefresh,
}: BranchOrderTableProps) {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [reasonModalState, setReasonModalState] = useState<{
    type: "CANCEL" | "FAILED";
    orderId: string;
  } | null>(null);

  const handleExecute = async (
    orderId: string,
    apiFn: () => Promise<unknown>,
    msg: string,
  ) => {
    setActionLoadingId(orderId);
    try {
      await apiFn();
      showToast.success(msg);
      onRefresh();
    } catch (error) {
      console.error("Lỗi điều phối:", error);
      showToast.error("Thao tác thất bại!");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!reasonModalState) return;
    const { type, orderId } = reasonModalState;
    setActionLoadingId(orderId);
    try {
      if (type === "CANCEL") {
        await branchOrderService.cancelOrder(branchId, orderId, { reason });
        showToast.success("Đã hủy đơn hàng!");
      } else {
        await branchOrderService.reportDeliveryFailed(branchId, orderId, {
          reason,
        });
        showToast.success("Đã báo cáo giao thất bại!");
      }
      setReasonModalState(null);
      onRefresh();
    } catch (error) {
      console.error("Lỗi:", error);
      showToast.error("Thực hiện thất bại!");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status: BranchOrderStatus) => {
    const config: Record<
      BranchOrderStatus,
      { bg: string; text: string; label: string }
    > = {
      PENDING: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        label: "• CHỜ XÁC NHẬN",
      },
      PROCESSING: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "• ĐANG SOẠN HÀNG",
      },
      READY_FOR_PICKUP: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        label: "• CHỜ LẤY HÀNG",
      },
      SHIPPING: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        label: "• ĐANG GIAO HÀNG",
      },
      DELIVERY_FAILED: {
        bg: "bg-rose-100",
        text: "text-rose-700",
        label: "• GIAO THẤT BẠI",
      },
      DELIVERED_PENDING_CONFIRMATION: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        label: "• CHỜ XÁC NHẬN GIAO",
      },
      RETURNED: {
        bg: "bg-slate-100",
        text: "text-slate-600",
        label: "• TRẢ HÀNG",
      },
      COMPLETED: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "✓ HOÀN THÀNH",
      },
      CANCELLED: {
        bg: "bg-slate-100",
        text: "text-slate-500",
        label: "• ĐÃ HỦY ĐƠN",
      },
    };

    const item = config[status] || {
      bg: "bg-slate-100",
      text: "text-slate-600",
      label: status,
    };

    return (
      <span
        className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full whitespace-nowrap inline-block ${item.bg} ${item.text}`}
      >
        {item.label}
      </span>
    );
  };

  const renderActionButtons = (order: BranchOrderSummary) => {
    const isLoadingThis = actionLoadingId === order.id;

    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        {order.status === "PENDING" && (
          <>
            <button
              disabled={isLoadingThis}
              onClick={() =>
                handleExecute(
                  order.id,
                  () => branchOrderService.confirmOrder(branchId, order.id),
                  "Đã duyệt đơn!",
                )
              }
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <CheckIcon className="w-3.5 h-3.5 stroke-3" /> Xác nhận
            </button>

            <button
              disabled={isLoadingThis}
              onClick={() =>
                setReasonModalState({
                  type: "CANCEL",
                  orderId: order.id,
                })
              }
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              Hủy đơn
            </button>
          </>
        )}

        {order.status === "PROCESSING" && (
          <button
            disabled={isLoadingThis}
            onClick={() =>
              handleExecute(
                order.id,
                () =>
                  branchOrderService.completePreparation(branchId, order.id),
                "Đã chuẩn bị xong!",
              )
            }
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <CheckIcon className="w-3.5 h-3.5 stroke-3" /> Hoàn tất đóng gói
          </button>
        )}

        {order.status === "READY_FOR_PICKUP" && (
          <button
            disabled={isLoadingThis}
            onClick={() =>
              handleExecute(
                order.id,
                () => branchOrderService.handoverOrder(branchId, order.id),
                "Đã bàn giao cho Shipper!",
              )
            }
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            Bàn giao Shipper
          </button>
        )}

        {order.status === "DELIVERY_FAILED" && (
          <button
            disabled={isLoadingThis}
            onClick={() =>
              handleExecute(
                order.id,
                () => branchOrderService.retryDelivery(branchId, order.id),
                "Đã chuyển giao lại!",
              )
            }
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 stroke-3" /> Giao lại
          </button>
        )}

        <button
          onClick={() => onSelectOrder(order.id)}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer whitespace-nowrap"
        >
          Chi tiết
        </button>

        <button className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer">
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="block lg:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              Đang tải danh sách đơn hàng từ server...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              Không tìm thấy đơn hàng nào tại chi nhánh.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3 bg-white text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectOrder(order.id)}
                        className="font-extrabold text-slate-800 hover:text-emerald-700 text-sm cursor-pointer"
                      >
                        #{order.orderCode}
                      </button>
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div>{renderStatusBadge(order.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block mb-0.5">
                      HÌNH THỨC
                    </span>
                    {order.deliveryType === "DELIVERY" ? (
                      <span className="px-2 py-0.5 font-bold bg-blue-50 text-blue-700 rounded-full inline-block">
                        Giao tận nơi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 font-bold bg-amber-50 text-amber-700 rounded-full inline-block">
                        Click & Collect
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">
                      THANH TOÁN
                    </span>
                    <span
                      className={`px-2 py-0.5 font-bold rounded-full inline-block ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100/60">
                  <div>
                    <span className="text-slate-400 text-[10px] block">
                      TỔNG TIỀN
                    </span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {order.totalAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div>{renderActionButtons(order)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-4 whitespace-nowrap">
                  MÃ ĐƠN & THỜI GIAN
                </th>
                <th className="p-3.5 whitespace-nowrap">HÌNH THỨC</th>
                <th className="p-3.5 whitespace-nowrap">TỔNG TIỀN</th>
                <th className="p-3.5 whitespace-nowrap">THANH TOÁN</th>
                <th className="p-3.5 whitespace-nowrap">TRẠNG THÁI ĐƠN</th>
                <th className="p-3.5 text-right pr-4 whitespace-nowrap">
                  HÀNH ĐỘNG ĐIỀU PHỐI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-400 font-medium"
                  >
                    Đang tải danh sách đơn hàng từ server...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-400 font-medium"
                  >
                    Không tìm thấy đơn hàng nào tại chi nhánh.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="p-3.5 pl-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="font-extrabold text-slate-800 hover:text-emerald-700 text-xs cursor-pointer"
                        >
                          #{order.orderCode}
                        </button>
                        <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                      </div>
                      <div className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {order.deliveryType === "DELIVERY" ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full">
                          Giao tận nơi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-full">
                          Click & Collect
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-extrabold text-emerald-700 text-xs whitespace-nowrap">
                      {order.totalAmount.toLocaleString("vi-VN")} đ
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {renderStatusBadge(order.status)}
                    </td>

                    <td className="p-3.5 text-right pr-4 whitespace-nowrap">
                      {renderActionButtons(order)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3.5 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Hiển thị tổng số{" "}
              <strong className="text-slate-800">{totalElements}</strong> đơn
            </div>

            <div className="flex items-center gap-1 font-bold">
              <button
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <span className="px-3 py-1 bg-emerald-800 text-white rounded-lg">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => onPageChange(page + 1)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <ReasonModal
        isOpen={!!reasonModalState}
        title={
          reasonModalState?.type === "CANCEL"
            ? "Xác nhận hủy đơn"
            : "Báo giao thất bại"
        }
        description="Nhập lý do thực hiện tác vụ này."
        onClose={() => setReasonModalState(null)}
        onSubmit={handleReasonSubmit}
      />
    </>
  );
}
