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
  const [branchId, setBranchId] = useState<string>("");

  useEffect(() => {
    const storedBranchId =
      localStorage.getItem("branchId") ||
      "02a024ec-18dc-42b1-8f85-37d893e99581";
    setBranchId(storedBranchId);
  }, []);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);

  const [orders, setOrders] = useState<BranchOrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

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
          branchOrderService.getBranchOrders(branchId, {
            status: st,
            size: st === "COMPLETED" ? 100 : 1,
          }),
        ),
      );

      STATUSES.forEach((st, index) => {
        const res = results[index];
        if (res.status === "fulfilled" && res.value?.data) {
          countsMap[st] = res.value.data.totalElements || 0;

          if (st === "COMPLETED") {
            const completedOrders = res.value.data.content || [];
            const revenue = completedOrders
              .filter((item) => item.status === "COMPLETED")
              .reduce((sum, item) => sum + (item.totalAmount || 0), 0);
            setTotalRevenue(revenue);
          }
        } else {
          countsMap[st] = 0;
          if (st === "COMPLETED") {
            setTotalRevenue(0);
          }
        }
      });

      setStatusCounts(countsMap);
    } catch (err) {
      console.error("Lỗi khi tải số liệu thống kê đơn:", err);
    }
  }, [branchId]);

  const fetchOrders = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const trimmedSearch = searchQuery.trim();
      const res = await branchOrderService.getBranchOrders(branchId, {
        status:
          activeTab === "ALL" ? undefined : (activeTab as BranchOrderStatus),
        page: trimmedSearch ? 0 : page,
        size: trimmedSearch ? 100 : 15,
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
  }, [branchId, activeTab, page, searchQuery]);

  useEffect(() => {
    if (branchId) {
      fetchOrders();
      fetchStatusCounts();
    }
  }, [branchId, fetchOrders, fetchStatusCounts]);

  const filteredOrders = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((order) =>
      (order.orderCode || "").toLowerCase().includes(keyword),
    );
  }, [orders, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <BranchHeader />

        <BranchMetricsCards
          totalOrders={statusCounts["ALL"] || totalElements}
          pendingCount={statusCounts["PENDING"] || 0}
          processingCount={statusCounts["PROCESSING"] || 0}
          readyCount={statusCounts["READY_FOR_PICKUP"] || 0}
          totalRevenue={totalRevenue}
          isLoading={loading}
        />

        <BranchFilterToolbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setPage(0);
          }}
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setPage(0);
          }}
          statusCounts={statusCounts}
        />

        <BranchOrderTable
          branchId={branchId}
          orders={filteredOrders}
          loading={loading}
          page={isSearching ? 0 : page}
          totalPages={isSearching ? 1 : totalPages}
          totalElements={isSearching ? filteredOrders.length : totalElements}
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
