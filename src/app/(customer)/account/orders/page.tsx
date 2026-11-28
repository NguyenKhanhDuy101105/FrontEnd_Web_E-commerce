"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import orderService, {
  OrderGroup,
  OrderSummary,
  OrderDetail,
} from "@/src/services/customer/orderService";
import { showToast } from "@/src/utils/toast";
import OrderDetailModal from "./components/OrderDetailModal";
import OrderReviewModal from "./components/OrderReviewModal";
import OrderTrackingWidget, {
  StatusCounts,
} from "./components/OrderTrackingWidget";
import OrderCard from "./components/OrderCard";
import CancelOrderModal from "./components/CancelOrderModal";
import Pagination from "@/src/components/common/Pagination";
import { orderBadgeManager } from "@/src/utils/orderBadgeEvent";

const ORDER_GROUPS: { key: OrderGroup; label: string }[] = [
  { key: "ALL", label: "Đơn hàng hiện tại" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang đóng gói" },
  { key: "WAITING", label: "Đang vận chuyển" },
  { key: "COMPLETED", label: "Lịch sử mua hàng" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "RETURNED", label: "Trả hàng" },
];

export default function OrderManagementPage() {
  const [activeGroup, setActiveGroup] = useState<OrderGroup>("ALL");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    processing: 0,
    shipping: 0,
    deliveredPending: 0,
    completed: 0,
  });

  useEffect(() => {
    orderBadgeManager.clearUnread();
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders({
        page,
        size: 20,
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
            (o) => o.status === "SHIPPING" || o.status === "READY_FOR_PICKUP",
          ).length,
          deliveredPending: allList.filter(
            (o) => o.status === "DELIVERED_PENDING_CONFIRMATION",
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

  const displayedOrders = useMemo(() => {
    if (activeGroup === "ALL") {
      return orders.filter(
        (o) =>
          o.status !== "COMPLETED" &&
          o.status !== "CANCELLED" &&
          o.status !== "RETURNED",
      );
    }
    return orders;
  }, [orders, activeGroup]);

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

  const handleCancelSuccess = (updatedOrder: OrderDetail) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o,
      ),
    );
    fetchOrders();
    fetchStatusCounts();
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
          ) : displayedOrders.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">
                Không tìm thấy đơn hàng nào
              </p>
              <p className="text-xs text-slate-400">
                {activeGroup === "ALL"
                  ? "Bạn hiện tại không có đơn hàng nào đang trong quá trình xử lý."
                  : "Bạn chưa có đơn hàng nào trong danh mục này."}
              </p>
            </div>
          ) : (
            <div className="max-h-92.5 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
              {displayedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isConfirming={confirmingId === order.id}
                  isCancelling={cancellingOrder?.id === order.id}
                  onViewDetail={setSelectedOrderId}
                  onCancelOrder={(o) =>
                    setCancellingOrder({ id: o.id, code: o.orderCode })
                  }
                  onReviewOrder={setReviewingOrder}
                  onConfirmReceived={handleConfirmReceived}
                />
              ))}
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

      {cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          onClose={() => setCancellingOrder(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {reviewingOrder && (
        <OrderReviewModal
          orderId={reviewingOrder.id}
          orderCode={reviewingOrder.code}
          onClose={() => setReviewingOrder(null)}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
