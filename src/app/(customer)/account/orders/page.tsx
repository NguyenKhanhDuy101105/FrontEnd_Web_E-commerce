"use client";

import React, { useEffect, useState, useCallback } from "react";
import orderService, {
  OrderGroup,
  OrderSummary,
  OrderStatus,
} from "@/src/services/customer/orderService";
import { showToast } from "@/src/utils/toast";
import OrderDetailModal from "./components/OrderDetailModal";
import OrderTrackingWidget, {
  StatusCounts,
} from "./components/OrderTrackingWidget";
import Pagination from "@/src/components/common/Pagination";

const ORDER_GROUPS: { key: OrderGroup; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang đóng gói" },
  { key: "WAITING", label: "Đang vận chuyển" },
  { key: "COMPLETED", label: "Đã hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "RETURNED", label: "Trả hàng" },
];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-[11px] font-bold">
          Chờ xác nhận
        </span>
      );
    case "PROCESSING":
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-[11px] font-bold">
          Đang đóng gói
        </span>
      );
    case "READY_FOR_PICKUP":
      return (
        <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200/60 rounded-full text-[11px] font-bold">
          Sẵn sàng lấy hàng
        </span>
      );
    case "SHIPPING":
      return (
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full text-[11px] font-bold">
          Đang vận chuyển
        </span>
      );
    case "DELIVERED_PENDING_CONFIRMATION":
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300/80 rounded-full text-[11px] font-bold">
          Đã giao hàng
        </span>
      );
    case "DELIVERY_FAILED":
      return (
        <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full text-[11px] font-bold">
          Giao thất bại
        </span>
      );
    case "COMPLETED":
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[11px] font-bold">
          Đã hoàn thành
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full text-[11px] font-bold">
          Đã hủy
        </span>
      );
    case "RETURNED":
      return (
        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-full text-[11px] font-bold">
          Trả hàng
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">
          {status}
        </span>
      );
  }
};

export default function OrderManagementPage() {
  const [activeGroup, setActiveGroup] = useState<OrderGroup>("ALL");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders({
        page,
        size: 10,
        group: activeGroup,
      });

      if (res.status === "success" && res.data) {
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setOrders([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      showToast.error("Không thể tải danh sách đơn hàng!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeGroup]);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const res = await orderService.getOrders({
        page: 0,
        size: 100,
        group: "ALL",
      });
      if (res.status === "success" && res.data?.content) {
        const allList = res.data.content;
        setStatusCounts({
          pending: allList.filter((o) => o.status === "PENDING").length,
          processing: allList.filter((o) => o.status === "PROCESSING").length,
          shipping: allList.filter(
            (o) =>
              o.status === "SHIPPING" ||
              o.status === "DELIVERED_PENDING_CONFIRMATION" ||
              o.status === "READY_FOR_PICKUP",
          ).length,
          completed: allList.filter((o) => o.status === "COMPLETED").length,
        });
      }
    } catch (error) {
      console.error("Lỗi tính tổng trạng thái đơn hàng:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStatusCounts();
  }, [fetchOrders, fetchStatusCounts]);

  const handleGroupChange = (group: OrderGroup) => {
    setActiveGroup(group);
    setPage(0);
  };

  const handleConfirmReceived = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      const res = await orderService.confirmReceived(orderId);
      if (res.status === "success") {
        showToast.success("Xác nhận đã nhận hàng thành công!");
        fetchOrders();
        fetchStatusCounts();
      }
    } catch (error) {
      console.error("Lỗi xác nhận nhận hàng:", error);
      showToast.error("Xác nhận thất bại. Vui lòng thử lại!");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6 min-h-150 flex flex-col justify-between">
      <div className="space-y-6">
        <OrderTrackingWidget
          statusCounts={statusCounts}
          activeGroup={activeGroup}
          onSelectGroup={handleGroupChange}
        />

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
            {ORDER_GROUPS.map((tab) => {
              const isActive = activeGroup === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleGroupChange(tab.key)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-100 rounded-lg animate-pulse border border-slate-100"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">
                Không tìm thấy đơn hàng nào
              </p>
              <p className="text-xs text-slate-400">
                Bạn chưa có đơn hàng nào trong danh mục này.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const canConfirmReceived =
                  order.status === "DELIVERED_PENDING_CONFIRMATION";

                return (
                  <div
                    key={order.id}
                    className="border border-slate-200/80 rounded-lg p-4 hover:border-slate-300 transition bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <div className="space-x-2">
                        <span className="font-bold text-slate-800">
                          Mã đơn: #{order.orderCode}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <p className="text-slate-500">
                          Chi nhánh:{" "}
                          <span className="font-semibold text-slate-800">
                            {order.branchName}
                          </span>
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          Hình thức:{" "}
                          <span className="font-semibold text-slate-800">
                            {order.deliveryType === "DELIVERY"
                              ? "Giao hàng tận nơi"
                              : "Nhận tại cửa hàng"}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 block text-[11px]">
                          Tổng tiền
                        </span>
                        <span className="font-black text-green-700 text-sm sm:text-base">
                          {order.totalAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Xem chi tiết
                      </button>

                      {canConfirmReceived && (
                        <button
                          type="button"
                          onClick={() => handleConfirmReceived(order.id)}
                          disabled={confirmingId === order.id}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
                        >
                          {confirmingId === order.id
                            ? "Đang xử lý..."
                            : "Đã nhận được hàng"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end pt-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderUpdated={() => {
            fetchOrders();
            fetchStatusCounts();
          }}
        />
      )}
    </div>
  );
}
