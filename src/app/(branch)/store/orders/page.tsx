"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  branchOrderService,
  BranchOrderSummary,
  BranchOrderStatus,
} from "@/src/services/store/branchOrderService";
import BranchHeader from "./components/BranchHeader";
import BranchMetricsCards from "./components/BranchMetricsCards";
import BranchFilterToolbar from "./components/BranchFilterToolbar";
import BranchOrderTable from "./components/BranchOrderTable";
import BranchOrderDetailModal from "./components/BranchOrderDetailModal";
import { showToast } from "@/src/utils/toast";

const STATUSES: BranchOrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "SHIPPING",
  "DELIVERY_FAILED",
  "COMPLETED",
  "CANCELLED",
];

export default function BranchOrderManagementPage() {
  // 1. LẤY BRANCH_ID TỪ LOCALSTORAGE / AUTH CONTEXT (THAY CHO USEPARAMS)
  const [branchId, setBranchId] = useState<string>("");

  useEffect(() => {
    // Lấy branchId lưu trong localStorage khi nhân viên đăng nhập thành công
    const storedBranchId =
      localStorage.getItem("branchId") ||
      "02a024ec-18dc-42b1-8f85-37d893e99581"; // Fallback ID test từ Swagger
    setBranchId(storedBranchId);
  }, []);

  // State Lọc & Phân trang
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExpressOnly, setIsExpressOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  // State Data từ API
  const [orders, setOrders] = useState<BranchOrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Dynamic Status Counts từ API
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // State Modal Chi tiết
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Tải đếm số lượng cho từng Tab trạng thái
  const fetchStatusCounts = useCallback(async () => {
    if (!branchId) return;
    try {
      const totalRes = await branchOrderService.getBranchOrders(branchId, {
        size: 1,
      });
      const countsMap: Record<string, number> = {
        ALL: totalRes?.data?.totalElements || 0,
      };

      const results = await Promise.allSettled(
        STATUSES.map((st) =>
          branchOrderService.getBranchOrders(branchId, { status: st, size: 1 }),
        ),
      );

      STATUSES.forEach((st, index) => {
        const res = results[index];
        if (res.status === "fulfilled" && res.value?.data) {
          countsMap[st] = res.value.data.totalElements || 0;
        } else {
          countsMap[st] = 0;
        }
      });

      setStatusCounts(countsMap);
    } catch (err) {
      console.error("Lỗi khi tải số liệu thống kê đơn:", err);
    }
  }, [branchId]);

  // Tải danh sách đơn chính
  const fetchOrders = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await branchOrderService.getBranchOrders(branchId, {
        status:
          activeTab === "ALL" ? undefined : (activeTab as BranchOrderStatus),
        page,
        size: 15,
      });

      if (res?.data) {
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      showToast.error("Không thể tải danh sách đơn hàng từ chi nhánh!");
    } finally {
      setLoading(false);
    }
  }, [branchId, activeTab, page]);

  useEffect(() => {
    if (branchId) {
      fetchOrders();
      fetchStatusCounts();
    }
  }, [branchId, fetchOrders, fetchStatusCounts]);

  // Tính tổng doanh thu
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Chi Nhánh */}
        <BranchHeader />

        {/* 5 Thẻ Metrics KPI Dynamic */}
        <BranchMetricsCards
          totalOrders={statusCounts["ALL"] || totalElements}
          pendingCount={statusCounts["PENDING"] || 0}
          processingCount={statusCounts["PROCESSING"] || 0}
          readyCount={statusCounts["READY_FOR_PICKUP"] || 0}
          totalRevenue={totalRevenue}
          isLoading={loading}
        />

        {/* Thanh Lọc Trạng Thái & Search */}
        <BranchFilterToolbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setPage(0);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isExpressOnly={isExpressOnly}
          onToggleExpress={() => setIsExpressOnly(!isExpressOnly)}
          statusCounts={statusCounts}
        />

        {/* Bảng Dữ Liệu Tích Hợp API */}
        <BranchOrderTable
          branchId={branchId}
          orders={orders}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          onSelectOrder={(id) => {
            setSelectedOrderId(id);
            setIsDetailOpen(true);
          }}
          onRefresh={() => {
            fetchOrders();
            fetchStatusCounts();
          }}
        />

        {/* Modal Chi Tiết & Tác Vụ */}
        <BranchOrderDetailModal
          branchId={branchId}
          orderId={selectedOrderId}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedOrderId(null);
          }}
          onRefresh={() => {
            fetchOrders();
            fetchStatusCounts();
          }}
        />
      </div>
    </div>
  );
}
