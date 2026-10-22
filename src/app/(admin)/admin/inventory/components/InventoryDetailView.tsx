"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { BranchInventorySummary } from "./BranchCard";
import { BranchInventoryByCategoryData } from "@/src/services/admin/adminInventoryService";

interface InventoryDetailViewProps {
  branchSummary: BranchInventorySummary;
  inventoryData: BranchInventoryByCategoryData | null;
  onBack: () => void;
}

export default function InventoryDetailView({
  branchSummary,
  inventoryData,
  onBack,
}: InventoryDetailViewProps) {
  const categories = inventoryData?.categories || [];

  // Tab Danh mục Cấp 1 đang chọn (Mặc định chọn tab đầu tiên)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  // Lấy danh mục Cấp 1 hiện tại
  const currentCategory = categories.find(
    (c) => c.categoryId === selectedCategoryId,
  );

  const toggleGroup = (subCategoryId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [subCategoryId]: !prev[subCategoryId],
    }));
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Chi Nhánh & Tổng Tồn Kho */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Quay lại danh sách chi nhánh"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-[#0d5c3a] rounded-lg">
              <BuildingStorefrontIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {inventoryData?.branchName || branchSummary.name}
              </h2>
              <p className="text-xs text-slate-500">
                {inventoryData?.branchAddress || branchSummary.address}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">
            Tổng kho chi nhánh
          </span>
          <span className="text-base font-black text-[#0d5c3a]">
            {(
              inventoryData?.totalBranchStock ??
              branchSummary.totalStockQuantity
            ).toLocaleString("vi-VN")}{" "}
            SP
          </span>
        </div>
      </div>

      {/* 2. Ô Tìm Kiếm Sản Phẩm */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm trong kho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium"
          />
        </div>
      </div>

      {/* 3. Thanh Tabs Danh Mục Cấp 1 */}
      {categories.length > 0 && (
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const isActive = cat.categoryId === selectedCategoryId;

              return (
                <button
                  key={cat.categoryId}
                  onClick={() => setSelectedCategoryId(cat.categoryId)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-between border ${
                    isActive
                      ? "bg-[#0d5c3a] text-white border-[#0d5c3a] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{cat.categoryName}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 shrink-0 ${
                      isActive
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.totalStock.toLocaleString("vi-VN")} SP
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Danh Sách Accordion Nhóm Danh Mục Con (subGroups) */}
      <div className="space-y-3">
        {currentCategory?.subGroups.map((group) => {
          // Lọc danh sách sản phẩm theo từ khóa tìm kiếm
          const filteredProducts = group.products.filter((prod) =>
            prod.productName.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          const isExpanded = !!expandedGroups[group.subCategoryId];

          return (
            <div
              key={group.subCategoryId}
              className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleGroup(group.subCategoryId)}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <button type="button" className="text-slate-400">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                  <TagIcon className="w-4 h-4 text-[#0d5c3a]" />
                  <div className="flex items-center gap-2">
                    {group.parentCategoryName && (
                      <span className="text-xs text-slate-500">
                        {group.parentCategoryName} /
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-800 uppercase">
                      {group.subCategoryName}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#0d5c3a]">
                  {group.totalProducts} sản phẩm ({group.totalGroupStock} SP)
                </span>
              </div>

              {/* Bảng Danh Sách Sản Phẩm Tồn Kho */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Không có sản phẩm nào trong nhóm này.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4">Tên sản phẩm</th>
                            <th className="py-2.5 px-3">Mã SKU</th>
                            <th className="py-2.5 px-3">Đơn vị</th>
                            <th className="py-2.5 px-3 text-center">
                              Trạng thái kho
                            </th>
                            <th className="py-2.5 px-4 text-right">
                              Số lượng tồn
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredProducts.map((prod) => {
                            const isLowStock = prod.stockQuantity <= 10;
                            const isOutOfStock = prod.stockQuantity === 0;

                            return (
                              <tr
                                key={prod.inventoryId}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {prod.productName}
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  {prod.sku}
                                </td>
                                <td className="py-3 px-3 text-slate-500 uppercase">
                                  {prod.unit}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {isOutOfStock ? (
                                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                      Hết hàng
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                      Sắp hết hàng
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-[#0d5c3a] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                      Sẵn hàng
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span
                                    className={`font-black text-xs ${
                                      isOutOfStock
                                        ? "text-rose-600"
                                        : isLowStock
                                          ? "text-amber-600"
                                          : "text-[#0d5c3a]"
                                    }`}
                                  >
                                    {prod.stockQuantity.toLocaleString("vi-VN")}{" "}
                                    {prod.unit || "SP"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
