"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import BranchCard, { BranchInventorySummary } from "./components/BranchCard";
import InventoryDetailView from "./components/InventoryDetailView";
import {
  adminInventoryService,
  BranchInventoryByCategoryData,
} from "@/src/services/admin/adminInventoryService";
import { showToast } from "@/src/utils/toast";

export default function AdminInventoryPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Danh sách các chi nhánh cho màn hình danh sách Cards
  const [branches, setBranches] = useState<BranchInventorySummary[]>([]);

  // Chi nhánh & dữ liệu tồn kho phân cấp danh mục đang được chọn
  const [selectedBranchSummary, setSelectedBranchSummary] =
    useState<BranchInventorySummary | null>(null);
  const [branchInventoryData, setBranchInventoryData] =
    useState<BranchInventoryByCategoryData | null>(null);

  // 💥 1. Call API mới: /api/admin/branches/inventory/summary
  const fetchInventorySummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryService.getInventorySummary();

      if (res && res.data && Array.isArray(res.data)) {
        // Ánh xạ dữ liệu từ API Summary sang format của BranchCard
        const mappedBranches: BranchInventorySummary[] = res.data.map(
          (item) => ({
            id: item.branchId,
            name: item.branchName,
            address: item.branchAddress,
            phone: item.branchPhone,
            totalStockQuantity: item.totalStock,
          }),
        );
        setBranches(mappedBranches);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tổng quan tồn kho:", error);
      showToast.error("Không thể tải danh sách tồn kho chi nhánh!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventorySummary();
  }, [fetchInventorySummary]);

  // 💥 2. Call API mới: /api/admin/branches/{branchId}/inventory/by-categories
  const handleSelectBranch = async (branch: BranchInventorySummary) => {
    setSelectedBranchSummary(branch);
    setDetailLoading(true);
    try {
      const res = await adminInventoryService.getBranchInventoryByCategories(
        branch.id,
      );
      if (res && res.data) {
        setBranchInventoryData(res.data);
      } else {
        setBranchInventoryData(null);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết tồn kho theo danh mục:", error);
      showToast.error("Không thể tải chi tiết tồn kho của chi nhánh!");
      setBranchInventoryData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      {/* Header Trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản lý hàng tồn kho
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi và kiểm soát hàng tồn kho theo từng danh mục của chuỗi siêu
            thị
          </p>
        </div>
      </div>

      {/* Trang Thái Loading Chính */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200/80">
          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0d5c3a]" />
          Đang tải dữ liệu hàng tồn kho...
        </div>
      ) : selectedBranchSummary ? (
        /* Màn hình XEM CHI TIẾT KHO CHI NHÁNH THEO DANH MỤC */
        detailLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200/80">
            <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0d5c3a]" />
            Đang tải dữ liệu tồn kho của {selectedBranchSummary.name}...
          </div>
        ) : (
          <InventoryDetailView
            branchSummary={selectedBranchSummary}
            inventoryData={branchInventoryData}
            onBack={() => {
              setSelectedBranchSummary(null);
              setBranchInventoryData(null);
            }}
          />
        )
      ) : (
        /* Màn hình DANH SÁCH CARDS CHI NHÁNH */
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <BuildingStorefrontIcon className="w-4 h-4 text-[#0d5c3a]" />
            <span>Danh sách các chi nhánh ({branches.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <BranchCard key={b.id} branch={b} onSelect={handleSelectBranch} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
