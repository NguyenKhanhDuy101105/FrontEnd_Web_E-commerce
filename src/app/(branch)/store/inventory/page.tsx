"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  InventoryByCategoriesData,
  InventoryProduct,
  InventorySummary,
  branchInventoryService,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";

import InventoryHeader from "./components/InventoryHeader";
import InventoryCategoryList from "./components/InventoryCategoryList";
import ReduceStockModal from "./components/ReduceStockModal";
import CreateLotModal from "./components/CreateLotModal";
import ManageLotsModal from "./components/ManageLotsModal";

export default function BranchInventoryPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [branchId, setBranchId] = useState<string>("");

  const [inventoryData, setInventoryData] =
    useState<InventoryByCategoriesData | null>(null);
  const [summaryData, setSummaryData] = useState<InventorySummary | null>(null);

  const [selectedProductForReduce, setSelectedProductForReduce] =
    useState<InventoryProduct | null>(null);
  const [isReduceModalOpen, setIsReduceModalOpen] = useState<boolean>(false);

  const [selectedProductForCreateLot, setSelectedProductForCreateLot] =
    useState<InventoryProduct | null>(null);
  const [isCreateLotModalOpen, setIsCreateLotModalOpen] =
    useState<boolean>(false);

  const [selectedProductForManageLots, setSelectedProductForManageLots] =
    useState<InventoryProduct | null>(null);
  const [isManageLotsModalOpen, setIsManageLotsModalOpen] =
    useState<boolean>(false);

  const fetchAllInventoryData = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const [byCategoryRes, summaryRes] = await Promise.all([
        branchInventoryService.getInventoryByCategories(id),
        branchInventoryService.getInventorySummary(id),
      ]);

      if (byCategoryRes?.data) {
        setInventoryData(byCategoryRes.data);
      } else {
        setInventoryData(null);
      }

      if (summaryRes?.data) {
        setSummaryData(summaryRes.data);
      } else {
        setSummaryData(null);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tồn kho chi nhánh:", error);
      showToast.error("Không thể tải thông tin hàng tồn kho!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let currentBranchId = localStorage.getItem("branchId");

    if (!currentBranchId) {
      const savedBranch = localStorage.getItem("currentBranch");
      if (savedBranch) {
        try {
          const parsed = JSON.parse(savedBranch);
          currentBranchId = parsed?.id || parsed?.branchId || "";
        } catch (e) {
          console.error("Lỗi parse currentBranch:", e);
        }
      }
    }

    if (currentBranchId) {
      setBranchId(currentBranchId);
      fetchAllInventoryData(currentBranchId);
    } else {
      setLoading(false);
      showToast.error("Không tìm thấy thông tin Chi nhánh hiện tại!");
    }
  }, [fetchAllInventoryData]);

  const handleReduceStock = (product: InventoryProduct) => {
    setSelectedProductForReduce(product);
    setIsReduceModalOpen(true);
  };

  const handleAddLot = (product: InventoryProduct) => {
    setSelectedProductForCreateLot(product);
    setIsCreateLotModalOpen(true);
  };

  const handleViewManageLots = (product: InventoryProduct) => {
    setSelectedProductForManageLots(product);
    setIsManageLotsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Quản lý hàng tồn kho
        </h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200/80">
          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0d5c3a]" />
          Đang tải dữ liệu hàng tồn kho...
        </div>
      ) : (
        <div className="space-y-5">
          <InventoryHeader
            branchName={inventoryData?.branchName}
            branchAddress={inventoryData?.branchAddress}
            summaryData={summaryData}
          />

          <InventoryCategoryList
            categories={inventoryData?.categories || []}
            onReduceStock={handleReduceStock}
            onAddLot={handleAddLot}
            onViewManageLots={handleViewManageLots}
          />
        </div>
      )}

      <ReduceStockModal
        branchId={branchId}
        product={selectedProductForReduce}
        isOpen={isReduceModalOpen}
        onClose={() => setIsReduceModalOpen(false)}
        onSuccess={() => fetchAllInventoryData(branchId)}
      />

      <CreateLotModal
        branchId={branchId}
        product={selectedProductForCreateLot}
        isOpen={isCreateLotModalOpen}
        onClose={() => setIsCreateLotModalOpen(false)}
        onSuccess={() => fetchAllInventoryData(branchId)}
      />

      <ManageLotsModal
        branchId={branchId}
        product={selectedProductForManageLots}
        isOpen={isManageLotsModalOpen}
        onClose={() => {
          setIsManageLotsModalOpen(false);
          fetchAllInventoryData(branchId);
        }}
      />
    </div>
  );
}
