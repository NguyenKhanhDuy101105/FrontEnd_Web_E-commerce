"use client";

import { useState, useMemo } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ProductDiscountItem } from "@/src/services/admin/adminProductDiscountService";

export interface DiscountProductItem {
  id: string;
  name: string;
  sku?: string;
  unit?: string;
  basePrice?: number;
  categoryId: string;
}

export interface DiscountCategoryNode {
  id: string;
  name: string;
  children?: DiscountCategoryNode[];
}

interface ProductDiscountTableProps {
  products: DiscountProductItem[];
  categories: DiscountCategoryNode[];
  selectedL1Id: string;
  discounts: ProductDiscountItem[];
  searchTerm?: string;
  onOpenAddDiscount: (target: {
    type: "SINGLE_PRODUCT" | "CATEGORY";
    titleName: string;
    productIds: string[];
  }) => void;
  onOpenDeleteDiscount: (discount: ProductDiscountItem) => void;
  onOpenBulkDeleteDiscount: (target: {
    titleName: string;
    discounts: ProductDiscountItem[];
  }) => void;
}

const getAllSubCategoryIds = (cat: DiscountCategoryNode): string[] => {
  let ids: string[] = [cat.id];
  if (cat.children && Array.isArray(cat.children)) {
    cat.children.forEach((child: DiscountCategoryNode) => {
      ids = ids.concat(getAllSubCategoryIds(child));
    });
  }
  return ids;
};

export default function ProductDiscountTable({
  products,
  categories,
  selectedL1Id,
  discounts,
  searchTerm = "",
  onOpenAddDiscount,
  onOpenDeleteDiscount,
  onOpenBulkDeleteDiscount,
}: ProductDiscountTableProps) {
  const discountsByProductMap = useMemo(() => {
    const map = new Map<string, ProductDiscountItem[]>();
    discounts.forEach((d) => {
      const existing = map.get(d.productId) || [];
      existing.push(d);
      map.set(d.productId, existing);
    });
    return map;
  }, [discounts]);

  const currentL1 = useMemo(
    () => categories.find((c) => c.id === selectedL1Id),
    [categories, selectedL1Id],
  );

  const groupList = useMemo(() => {
    const l2Categories = currentL1?.children || [];
    const list: Array<{
      id: string;
      parentName: string;
      subName: string;
      categoryIds: string[];
    }> = [];

    l2Categories.forEach((l2: DiscountCategoryNode) => {
      if (l2.children && Array.isArray(l2.children) && l2.children.length > 0) {
        l2.children.forEach((l3: DiscountCategoryNode) => {
          list.push({
            id: l3.id,
            parentName: l2.name,
            subName: l3.name,
            categoryIds: getAllSubCategoryIds(l3),
          });
        });
      } else {
        list.push({
          id: l2.id,
          parentName: currentL1?.name || "",
          subName: l2.name,
          categoryIds: getAllSubCategoryIds(l2),
        });
      }
    });

    return list;
  }, [currentL1]);

  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>(
    {},
  );
  const [searchOverrides, setSearchOverrides] = useState<{
    term: string;
    overrides: Record<string, boolean>;
  }>({ term: "", overrides: {} });

  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length > 0;

  const toggleGroup = (groupId: string, currentExpanded: boolean) => {
    const nextState = !currentExpanded;
    if (isSearching) {
      setSearchOverrides((prev) => ({
        term: normalizedSearch,
        overrides: {
          ...(prev.term === normalizedSearch ? prev.overrides : {}),
          [groupId]: nextState,
        },
      }));
    } else {
      setManualExpanded((prev) => ({
        ...prev,
        [groupId]: nextState,
      }));
    }
  };

  if (!currentL1 || !currentL1.children || currentL1.children.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200/80 shadow-xs">
        Không có danh mục con nào trong nhóm này.
      </div>
    );
  }

  const visibleGroups = groupList
    .map((group) => {
      const groupProducts = products.filter((p) =>
        group.categoryIds.includes(p.categoryId),
      );
      return {
        ...group,
        groupProducts,
      };
    })
    .filter((group) => !isSearching || group.groupProducts.length > 0);

  return (
    <div className="space-y-3">
      {visibleGroups.map((group) => {
        const { groupProducts } = group;

        const groupDiscounts = groupProducts.flatMap(
          (p) => discountsByProductMap.get(p.id) || [],
        );
        const discountedProductsCount = groupProducts.filter(
          (p) => (discountsByProductMap.get(p.id)?.length || 0) > 0,
        ).length;

        const isExpanded = isSearching
          ? searchOverrides.term === normalizedSearch &&
            group.id in searchOverrides.overrides
            ? searchOverrides.overrides[group.id]
            : groupProducts.length > 0
          : Boolean(manualExpanded[group.id]);

        const groupTitle = `${group.parentName} / ${group.subName}`;

        return (
          <div
            key={group.id}
            className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50 transition-colors gap-2">
              <div
                onClick={() => toggleGroup(group.id, isExpanded)}
                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
              >
                <button type="button" className="text-slate-400 shrink-0">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
                <TagIcon className="w-4 h-4 text-[#0d5c3a] shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                  <span className="text-xs text-slate-500 truncate max-w-28 sm:max-w-none">
                    {group.parentName} /
                  </span>
                  <span className="text-xs font-black text-slate-800 uppercase truncate max-w-28 sm:max-w-none">
                    {group.subName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      groupProducts.length > 0
                        ? "bg-emerald-100 text-[#0d5c3a]"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span className="inline sm:hidden">
                      {isSearching
                        ? `${groupProducts.length} kq`
                        : `${groupProducts.length} sp`}
                    </span>
                    <span className="hidden sm:inline">
                      {isSearching
                        ? `${groupProducts.length} kết quả`
                        : `${groupProducts.length} sản phẩm`}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {groupDiscounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenBulkDeleteDiscount({
                        titleName: groupTitle,
                        discounts: groupDiscounts,
                      })
                    }
                    title={`Gỡ tất cả khuyến mãi (${discountedProductsCount} sản phẩm)`}
                    className="flex items-center justify-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <TrashIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    <span className="inline sm:hidden">
                      {discountedProductsCount}
                    </span>
                    <span className="hidden sm:inline">
                      Gỡ khuyến mãi ({discountedProductsCount})
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onOpenAddDiscount({
                      type: "CATEGORY",
                      titleName: groupTitle,
                      productIds: groupProducts.map((p) => p.id),
                    })
                  }
                  title="Thêm khuyến mãi"
                  className="flex items-center justify-center gap-1 text-xs font-bold text-[#0d5c3a] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 p-2 sm:px-3 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-3" />
                  <span className="hidden sm:inline">Thêm khuyến mãi</span>
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-100">
                {groupProducts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Chưa có sản phẩm nào trong nhóm này.
                  </div>
                ) : (
                  <>
                    <div className="block lg:hidden divide-y divide-slate-100 bg-slate-50/50 max-h-60 overflow-y-auto">
                      {groupProducts.map((prod: DiscountProductItem) => {
                        const prodDiscounts =
                          discountsByProductMap.get(prod.id) || [];
                        const activeDiscount = prodDiscounts[0];

                        let percentDecimal = 0;
                        if (activeDiscount) {
                          percentDecimal =
                            activeDiscount.discountPercent > 1
                              ? activeDiscount.discountPercent / 100
                              : activeDiscount.discountPercent;
                        }

                        const originalPrice = prod.basePrice || 0;
                        const finalPrice = activeDiscount
                          ? originalPrice * (1 - percentDecimal)
                          : originalPrice;

                        return (
                          <div
                            key={prod.id}
                            className="p-3.5 space-y-2 bg-white text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-snug">
                                  {prod.name}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                  <span>SKU: {prod.sku || "—"}</span>
                                  <span>•</span>
                                  <span>Đơn vị: {prod.unit || "—"}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenAddDiscount({
                                      type: "SINGLE_PRODUCT",
                                      titleName: prod.name,
                                      productIds: [prod.id],
                                    })
                                  }
                                  className="p-1.5 text-[#0d5c3a] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Thêm/Sửa giảm giá"
                                >
                                  <TagIcon className="w-4 h-4" />
                                </button>

                                {activeDiscount && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenDeleteDiscount(activeDiscount)
                                    }
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Gỡ giảm giá"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs pt-1">
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  GIÁ BÁN GỐC
                                </span>
                                <span className="font-bold text-slate-700">
                                  {originalPrice.toLocaleString("vi-VN")} đ
                                </span>
                              </div>

                              <div className="text-center">
                                <span className="text-[10px] text-slate-400 block mb-0.5">
                                  MỨC GIẢM
                                </span>
                                {activeDiscount ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    Giảm {percentDecimal * 100}%
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">
                                    Không giảm
                                  </span>
                                )}
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">
                                  GIÁ SAU GIẢM
                                </span>
                                {activeDiscount ? (
                                  <div>
                                    <span className="font-extrabold text-[#0d5c3a] text-xs block">
                                      {finalPrice.toLocaleString("vi-VN")} đ
                                    </span>
                                    <span className="text-[10px] text-slate-400 line-through block">
                                      {originalPrice.toLocaleString("vi-VN")} đ
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-slate-700">
                                    {originalPrice.toLocaleString("vi-VN")} đ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden lg:block overflow-x-auto max-h-77.5 overflow-y-auto">
                      <table className="w-full text-left text-xs text-slate-600 border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                          <tr>
                            <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50">
                              Sản phẩm
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50">
                              Mã SKU
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50">
                              Đơn vị
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50">
                              Giá bán gốc
                            </th>
                            <th className="py-2.5 px-3 text-center whitespace-nowrap bg-slate-50">
                              Mức giảm giá
                            </th>
                            <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50">
                              Giá sau giảm
                            </th>
                            <th className="py-2.5 px-3 text-center whitespace-nowrap bg-slate-50">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {groupProducts.map((prod: DiscountProductItem) => {
                            const prodDiscounts =
                              discountsByProductMap.get(prod.id) || [];
                            const activeDiscount = prodDiscounts[0];

                            let percentDecimal = 0;
                            if (activeDiscount) {
                              percentDecimal =
                                activeDiscount.discountPercent > 1
                                  ? activeDiscount.discountPercent / 100
                                  : activeDiscount.discountPercent;
                            }

                            const originalPrice = prod.basePrice || 0;
                            const finalPrice = activeDiscount
                              ? originalPrice * (1 - percentDecimal)
                              : originalPrice;

                            return (
                              <tr
                                key={prod.id}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-3 px-3">
                                  <span className="font-bold text-slate-900 block">
                                    {prod.name}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                  {prod.sku}
                                </td>
                                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                  {prod.unit}
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                                  {originalPrice.toLocaleString("vi-VN")} đ
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  {activeDiscount ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                      Giảm {percentDecimal * 100}%
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">
                                      Không giảm giá
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  {activeDiscount ? (
                                    <div className="space-y-0.5">
                                      <span className="font-extrabold text-[#0d5c3a] text-xs block">
                                        {finalPrice.toLocaleString("vi-VN")} đ
                                      </span>
                                      <span className="text-[10px] text-slate-400 line-through block">
                                        {originalPrice.toLocaleString("vi-VN")}{" "}
                                        đ
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-bold text-slate-700">
                                      {originalPrice.toLocaleString("vi-VN")} đ
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenAddDiscount({
                                          type: "SINGLE_PRODUCT",
                                          titleName: prod.name,
                                          productIds: [prod.id],
                                        })
                                      }
                                      className="p-1.5 text-[#0d5c3a] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                      title="Thêm/Sửa giảm giá"
                                    >
                                      <TagIcon className="w-4 h-4" />
                                    </button>

                                    {activeDiscount && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onOpenDeleteDiscount(activeDiscount)
                                        }
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Gỡ giảm giá"
                                      >
                                        <TrashIcon className="w-4 h-4" />
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
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isSearching && visibleGroups.length === 0 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-xs text-center space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Không có sản phẩm nào phù hợp trong danh mục
          </p>
          <p className="text-[11px] text-slate-400">
            Vui lòng chọn danh mục khác hoặc thử từ khóa tìm kiếm khác.
          </p>
        </div>
      )}
    </div>
  );
}
