"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import {
  InventoryCategoryGroup,
  InventoryProduct,
} from "@/src/services/store/branchInventoryService";

interface InventoryCategoryListProps {
  categories: InventoryCategoryGroup[];
  onReduceStock: (product: InventoryProduct) => void;
  onAddLot: (product: InventoryProduct) => void;
  onViewManageLots: (product: InventoryProduct) => void;
}

export default function InventoryCategoryList({
  categories,
  onReduceStock,
  onAddLot,
  onViewManageLots,
}: InventoryCategoryListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (
      categories.length > 0 &&
      (!selectedCategoryId ||
        !categories.some((c) => c.categoryId === selectedCategoryId))
    ) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  const currentCategory = categories.find(
    (c) => c.categoryId === selectedCategoryId,
  );

  const toggleGroup = (subCategoryId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [subCategoryId]: !prev[subCategoryId],
    }));
  };

  if (categories.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg border border-slate-200/80 text-xs text-slate-400">
        Không có dữ liệu danh mục hàng tồn kho.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const isActive = cat.categoryId === selectedCategoryId;

            return (
              <button
                key={cat.categoryId}
                type="button"
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
                  {(cat.totalStock || 0).toLocaleString("vi-VN")} SP
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {currentCategory?.subGroups?.map((group) => {
          const isExpanded = !!expandedGroups[group.subCategoryId];
          const products = group.products || [];

          return (
            <div
              key={group.subCategoryId}
              className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div
                onClick={() => toggleGroup(group.subCategoryId)}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button type="button" className="text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                  <TagIcon className="w-4 h-4 text-[#0d5c3a] shrink-0" />
                  <div className="flex items-center gap-1.5 truncate">
                    {group.parentCategoryName && (
                      <span className="text-xs text-slate-500 truncate hidden sm:inline">
                        {group.parentCategoryName} /
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-800 uppercase truncate">
                      {group.subCategoryName}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#0d5c3a] shrink-0 whitespace-nowrap">
                  {group.totalProducts} SP ({group.totalGroupStock} tồn)
                </span>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100">
                  {products.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Không có sản phẩm nào trong nhóm này.
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full min-w-180 text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4 whitespace-nowrap min-w-50">
                              Tên sản phẩm
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap">
                              Mã SKU
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap">
                              Đơn vị
                            </th>
                            <th className="py-2.5 px-3 text-center whitespace-nowrap">
                              Trạng thái kho
                            </th>
                            <th className="py-2.5 px-4 text-right whitespace-nowrap">
                              Số lượng tồn
                            </th>
                            <th className="py-2.5 px-4 text-center whitespace-nowrap">
                              Thao tác nghiệp vụ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {products.map((prod) => {
                            const isLowStock = prod.stockQuantity <= 10;
                            const isOutOfStock = prod.stockQuantity === 0;

                            return (
                              <tr
                                key={prod.inventoryId}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                                  {prod.productName}
                                </td>
                                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                  {prod.sku}
                                </td>
                                <td className="py-3 px-3 text-slate-500 uppercase whitespace-nowrap">
                                  {prod.unit}
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  {isOutOfStock ? (
                                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                                      Hết hàng
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                                      Sắp hết hàng
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-[#0d5c3a] text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                                      Sẵn hàng
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
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
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => onAddLot(prod)}
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold shrink-0"
                                      title="Nhập thêm lô hàng mới & Hạn sử dụng"
                                    >
                                      <PlusCircleIcon className="w-4 h-4 text-[#0d5c3a]" />
                                      <span>Nhập lô</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onViewManageLots(prod)}
                                      className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold shrink-0"
                                      title="Xem danh sách lô & Chỉnh sửa HSD"
                                    >
                                      <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                                      <span>Xem/Sửa HSD</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onReduceStock(prod)}
                                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium shrink-0"
                                      title="Báo giảm hàng tồn kho"
                                    >
                                      <PencilSquareIcon className="w-4 h-4 text-rose-500" />
                                      <span>Báo giảm</span>
                                    </button>
                                  </div>
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
