"use client";

import React, { useState } from "react";
import {
  PhotoIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TagIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  unit: string;
  basePrice: number;
  imageUrl: string | null;
  status?: string;
}

interface Props {
  products: ProductItem[];
  categories: CategoryItem[];
  selectedL1Id: string;
  onEdit: (item: ProductItem) => void;
  onDelete: (item: ProductItem) => void;
  onRestore: (item: ProductItem) => void; // 💥 Thêm prop khôi phục sản phẩm
  onAddProductToCategory?: (categoryId: string, categoryName: string) => void;
}

interface CategoryGroupNode {
  id: string;
  name: string;
  path: string;
  products: ProductItem[];
}

export default function ProductTable({
  products,
  categories,
  selectedL1Id,
  onEdit,
  onDelete,
  onRestore,
  onAddProductToCategory,
}: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const currentL1 = categories.find((c) => c.id === selectedL1Id);

  const getSubCategoryNodes = (
    l1Category?: CategoryItem,
  ): CategoryGroupNode[] => {
    if (!l1Category || !l1Category.children) return [];

    const nodes: CategoryGroupNode[] = [];

    for (const l2 of l1Category.children) {
      const l3List = l2.children || [];

      if (l3List.length > 0) {
        for (const l3 of l3List) {
          nodes.push({
            id: l3.id,
            name: l3.name,
            path: `${l2.name} / ${l3.name}`,
            products: products.filter((p) => p.categoryId === l3.id),
          });
        }
      } else {
        nodes.push({
          id: l2.id,
          name: l2.name,
          path: l2.name,
          products: products.filter((p) => p.categoryId === l2.id),
        });
      }
    }

    return nodes;
  };

  const categoryGroups = getSubCategoryNodes(currentL1);

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const isGroupExpanded = (groupId: string) => expandedGroups.has(groupId);

  if (!currentL1) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-lg border border-slate-200/80">
        Vui lòng chọn danh mục để xem sản phẩm.
      </div>
    );
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-lg border border-slate-200/80">
        Danh mục {currentL1.name} chưa có danh mục con nào.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categoryGroups.map((group) => {
        const isOpen = isGroupExpanded(group.id);
        const hasProducts = group.products.length > 0;
        const pathSegments = group.path.split(" / ");

        return (
          <div
            key={group.id}
            className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden transition"
          >
            {/* Header nhóm Danh mục con */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50/90 border-b border-slate-200/70 select-none">
              <div
                className="flex items-center gap-2.5 cursor-pointer min-w-0"
                onClick={() => toggleExpand(group.id)}
              >
                <button
                  type="button"
                  className="text-slate-500 p-1 rounded-lg hover:bg-slate-200 transition"
                >
                  {isOpen ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>

                <div className="p-1.5 bg-emerald-50 text-[#0d5c3a] rounded-md shrink-0">
                  <TagIcon className="w-4 h-4" />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;
                    return (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <span className="text-slate-300 font-bold">/</span>
                        )}
                        <span
                          className={`${
                            isLast
                              ? "font-extrabold text-slate-900 uppercase"
                              : "font-semibold text-slate-500"
                          }`}
                        >
                          {segment}
                        </span>
                      </React.Fragment>
                    );
                  })}

                  <span
                    className={`ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      hasProducts
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {group.products.length} sản phẩm
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onAddProductToCategory &&
                  onAddProductToCategory(group.id, group.name)
                }
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#0d5c3a] bg-white border border-emerald-200 hover:bg-emerald-50 rounded-md transition cursor-pointer shrink-0"
              >
                <PlusIcon className="w-3.5 h-3.5 stroke-3" />
                <span className="hidden sm:inline">Thêm vào nhóm này</span>
              </button>
            </div>

            {/* Nội dung danh sách sản phẩm */}
            {isOpen && (
              <div>
                {!hasProducts ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5">
                    <ExclamationCircleIcon className="w-4 h-4 text-amber-500" />
                    Danh mục này chưa có sản phẩm nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] bg-slate-50/40">
                          <th className="py-2.5 px-3.5">Sản phẩm</th>
                          <th className="py-2.5 px-3.5">Mã SKU</th>
                          <th className="py-2.5 px-3.5">Thương hiệu</th>
                          <th className="py-2.5 px-3.5">Đơn vị</th>
                          <th className="py-2.5 px-3.5">Giá bán gốc</th>
                          {/* 💥 Thêm tiêu đề cột Trạng thái */}
                          <th className="py-2.5 px-3.5">Trạng thái</th>
                          <th className="py-2.5 px-3.5 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {group.products.map((item) => {
                          const isActive =
                            !item.status || item.status === "ACTIVE";

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50/80 transition"
                            >
                              <td className="py-3 px-3.5 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <PhotoIcon className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3.5 font-bold text-slate-600">
                                {item.sku}
                              </td>

                              <td className="py-3 px-3.5 text-slate-600">
                                {item.brandName || "—"}
                              </td>

                              <td className="py-3 px-3.5 text-slate-600">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                                  {item.unit}
                                </span>
                              </td>

                              <td className="py-3 px-3.5 font-extrabold text-slate-900">
                                {item.basePrice.toLocaleString("vi-VN")} đ
                              </td>

                              {/* 💥 Cột Trạng thái */}
                              <td className="py-3 px-3.5">
                                <span
                                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                                    isActive
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {isActive ? "Đang bán" : "Đã ngừng bán"}
                                </span>
                              </td>

                              {/* Cột Thao tác */}
                              <td className="py-3 px-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Nếu đang bán thì hiện nút Sửa & Xóa, nếu đã ngừng bán thì hiện nút Khôi phục */}
                                  {isActive ? (
                                    <>
                                      <button
                                        onClick={() => onEdit(item)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                        title="Chỉnh sửa"
                                      >
                                        <PencilSquareIcon className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => onDelete(item)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                        title="Xóa / Ngừng bán"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => onRestore(item)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      title="Khôi phục sản phẩm"
                                    >
                                      <ArrowPathIcon className="w-4 h-4" />
                                    </button>
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
      })}
    </div>
  );
}
