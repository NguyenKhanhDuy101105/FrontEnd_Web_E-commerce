"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";
import { adminProductService } from "@/src/services/admin/adminProductService";

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  unit: string;
  basePrice: number;
  imageUrl: string;
  status: string;
}

interface ProductTableProps {
  categories: CategoryItem[];
  selectedL1Id: string;
  searchTerm: string;
  refreshKey: number;
  onEdit: (item: ProductItem) => void;
  onDelete: (item: ProductItem) => void;
  onRestore: (item: ProductItem) => void;
  onAddProductToCategory: (categoryId: string) => void;
}

interface CategoryGroupItem {
  targetCategory: CategoryItem;
  displayName: string;
}

/**
 * Component hiển thị từng Accordion nhóm sản phẩm (Tối ưu Responsive)
 */
function CategoryGroupSection({
  targetCategory,
  displayName,
  searchTerm,
  refreshKey,
  onEdit,
  onDelete,
  onRestore,
  onAddProductToCategory,
}: {
  targetCategory: CategoryItem;
  displayName: string;
  searchTerm: string;
  refreshKey: number;
  onEdit: (item: ProductItem) => void;
  onDelete: (item: ProductItem) => void;
  onRestore: (item: ProductItem) => void;
  onAddProductToCategory: (categoryId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchProductsByCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductService.getProductsByCategoryId(
        targetCategory.id,
        { page: 0, size: 100 },
      );

      if (res && res.data && Array.isArray(res.data.content)) {
        setProducts(res.data.content as unknown as ProductItem[]);
        setTotalCount(res.data.totalElements ?? res.data.content.length);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error(
        `Lỗi tải sản phẩm cho danh mục ${targetCategory.name}:`,
        error,
      );
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [targetCategory.id]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [fetchProductsByCategory, refreshKey]);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setIsExpanded(true);
    }
  }, [searchTerm]);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Accordion Header - Responsive */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-white hover:bg-slate-50/50 transition border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 stroke-2" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 stroke-2" />
            )}
          </button>

          <div className="flex items-center gap-2 min-w-0 truncate">
            <span
              className="text-xs font-bold text-slate-800 truncate"
              title={displayName}
            >
              {displayName}
            </span>

            {loading ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 animate-pulse shrink-0">
                ...
              </span>
            ) : (
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                  totalCount > 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-rose-50 text-rose-600 border border-rose-200/60"
                }`}
              >
                {totalCount} sản phẩm
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddProductToCategory(targetCategory.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-[#0d5c3a] bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition cursor-pointer shrink-0 ml-auto sm:ml-0"
        >
          <PlusIcon className="w-3.5 h-3.5 stroke-3" />
          <span className="hidden xs:inline">Thêm vào nhóm này</span>
          <span className="xs:hidden">Thêm</span>
        </button>
      </div>

      {/* Nội dung danh sách sản phẩm khi MỞ - Responsive Table */}
      {isExpanded && (
        <div className="p-2 sm:p-3.5">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <ArrowPathIcon className="w-4 h-4 animate-spin text-[#0d5c3a]" />
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              Danh mục này chưa có sản phẩm nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                    <th className="py-2.5 px-2 sm:px-3">Sản phẩm</th>
                    <th className="py-2.5 px-2 sm:px-3 hidden sm:table-cell">
                      Mã SKU
                    </th>
                    <th className="py-2.5 px-2 sm:px-3 text-center sm:text-left">
                      Đơn vị
                    </th>
                    <th className="py-2.5 px-2 sm:px-3">Giá bán</th>
                    <th className="py-2.5 px-2 sm:px-3 hidden md:table-cell">
                      Trạng thái
                    </th>
                    <th className="py-2.5 px-2 sm:px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.map((p) => {
                    const isInactive = p.status === "INACTIVE";
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition group"
                      >
                        {/* Cột Sản phẩm (Hình ảnh + Tên gọn gàng + Mô tả ẩn/hiện) */}
                        <td className="py-2.5 px-2 sm:px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.imageUrl || "/images/placeholder.png"}
                              alt={p.name}
                              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg border border-slate-200/80 bg-slate-50 p-0.5 shrink-0"
                            />
                            <div className="min-w-0 max-w-[180px] xs:max-w-[220px] sm:max-w-[280px] md:max-w-[320px]">
                              <h4
                                className="font-bold text-slate-900 truncate text-xs sm:text-xs"
                                title={p.name}
                              >
                                {p.name}
                              </h4>
                              {p.description && (
                                <p
                                  className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5 hidden xs:block"
                                  title={p.description}
                                >
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Mã SKU (Ẩn ở mobile hẹp) */}
                        <td className="py-2.5 px-2 sm:px-3 font-mono font-semibold text-slate-600 hidden sm:table-cell">
                          {p.sku || "—"}
                        </td>

                        {/* Đơn vị tính */}
                        <td className="py-2.5 px-2 sm:px-3 text-center sm:text-left">
                          <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600 rounded whitespace-nowrap">
                            {p.unit || "Cái"}
                          </span>
                        </td>

                        {/* Giá bán gốc */}
                        <td className="py-2.5 px-2 sm:px-3 font-extrabold text-[#0d5c3a] whitespace-nowrap">
                          {p.basePrice?.toLocaleString("vi-VN")} đ
                        </td>

                        {/* Trạng thái (Ẩn ở màn hình trung bình) */}
                        <td className="py-2.5 px-2 sm:px-3 hidden md:table-cell">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full inline-block whitespace-nowrap ${
                              isInactive
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {isInactive ? "Đã dừng" : "Đang bán"}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="py-2.5 px-2 sm:px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isInactive ? (
                              <button
                                onClick={() => onRestore(p)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                                title="Khôi phục"
                              >
                                <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => onEdit(p)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                                  title="Chỉnh sửa"
                                >
                                  <PencilSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => onDelete(p)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                                  title="Xóa"
                                >
                                  <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              </>
                            )}
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
}

export default function ProductTable({
  categories,
  selectedL1Id,
  searchTerm,
  refreshKey,
  onEdit,
  onDelete,
  onRestore,
  onAddProductToCategory,
}: ProductTableProps) {
  const selectedL1 = categories.find((c) => c.id === selectedL1Id);

  if (!selectedL1 || !selectedL1.children || selectedL1.children.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200/80">
        Không có danh mục con nào trong nhóm này.
      </div>
    );
  }

  const targetGroups: CategoryGroupItem[] = [];

  selectedL1.children.forEach((l2) => {
    if (l2.children && l2.children.length > 0) {
      l2.children.forEach((l3) => {
        targetGroups.push({
          targetCategory: l3,
          displayName: `${l2.name} / ${l3.name}`,
        });
      });
    } else {
      targetGroups.push({
        targetCategory: l2,
        displayName: l2.name,
      });
    }
  });

  return (
    <div className="space-y-3.5">
      {targetGroups.map(({ targetCategory, displayName }) => (
        <CategoryGroupSection
          key={targetCategory.id}
          targetCategory={targetCategory}
          displayName={displayName}
          searchTerm={searchTerm}
          refreshKey={refreshKey}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onAddProductToCategory={onAddProductToCategory}
        />
      ))}
    </div>
  );
}
