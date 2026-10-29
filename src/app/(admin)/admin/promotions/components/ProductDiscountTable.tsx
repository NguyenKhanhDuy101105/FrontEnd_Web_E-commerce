"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ProductDiscountItem } from "@/src/services/admin/adminProductDiscountService";

interface ProductDiscountTableProps {
  products: any[];
  categories: any[];
  selectedL1Id: string;
  discounts: ProductDiscountItem[];
  onOpenAddDiscount: (target: {
    type: "SINGLE_PRODUCT" | "CATEGORY";
    titleName: string;
    productIds: string[];
  }) => void;
  onOpenDeleteDiscount: (discount: ProductDiscountItem) => void;
}

export default function ProductDiscountTable({
  products,
  categories,
  selectedL1Id,
  discounts,
  onOpenAddDiscount,
  onOpenDeleteDiscount,
}: ProductDiscountTableProps) {
  const discountMap = new Map<string, ProductDiscountItem>();
  discounts.forEach((d) => discountMap.set(d.productId, d));

  const currentL1 = categories.find((c) => c.id === selectedL1Id);

  const getAllSubCategoryIds = (cat: any): string[] => {
    let ids: string[] = [cat.id];
    if (cat.children && Array.isArray(cat.children)) {
      cat.children.forEach((child: any) => {
        ids = ids.concat(getAllSubCategoryIds(child));
      });
    }
    return ids;
  };

  const l2Categories = currentL1?.children || [];
  const groupList: Array<{
    id: string;
    parentName: string;
    subName: string;
    categoryIds: string[];
  }> = [];

  l2Categories.forEach((l2: any) => {
    if (l2.children && Array.isArray(l2.children) && l2.children.length > 0) {
      l2.children.forEach((l3: any) => {
        groupList.push({
          id: l3.id,
          parentName: l2.name,
          subName: l3.name,
          categoryIds: getAllSubCategoryIds(l3),
        });
      });
    } else {
      groupList.push({
        id: l2.id,
        parentName: currentL1?.name || "",
        subName: l2.name,
        categoryIds: getAllSubCategoryIds(l2),
      });
    }
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="space-y-3">
      {groupList.map((group) => {
        const groupProducts = products.filter((p) =>
          group.categoryIds.includes(p.categoryId),
        );
        const isExpanded = !!expandedGroups[group.id];

        return (
          <div
            key={group.id}
            className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50 transition-colors gap-2">
              <div
                onClick={() => toggleGroup(group.id)}
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0d5c3a] whitespace-nowrap shrink-0">
                    <span className="inline sm:hidden">
                      {groupProducts.length} sp
                    </span>
                    <span className="hidden sm:inline">
                      {groupProducts.length} sản phẩm
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenAddDiscount({
                    type: "CATEGORY",
                    titleName: `${group.parentName} / ${group.subName}`,
                    productIds: groupProducts.map((p) => p.id),
                  })
                }
                title="Thêm khuyến mãi"
                className="flex items-center justify-center gap-1 text-xs font-bold text-[#0d5c3a] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 p-2 sm:px-3 sm:py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                <PlusIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-3" />
                <span className="hidden sm:inline">Thêm khuyến mãi</span>
              </button>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-100">
                {groupProducts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Chưa có sản phẩm nào trong nhóm này.
                  </div>
                ) : (
                  <>
                    {/* Giao diện dạng Card cho Mobile & Tablet (< lg) */}
                    <div className="block lg:hidden divide-y divide-slate-100 bg-slate-50/50">
                      {groupProducts.map((prod: any) => {
                        const activeDiscount = discountMap.get(prod.id);

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
                            className="p-3.5 space-y-2.5 bg-white text-xs"
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

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
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

                    {/* Giao diện dạng Bảng cho Desktop (>= lg) */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 whitespace-nowrap">
                              Sản phẩm
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap">
                              Mã SKU
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap">
                              Đơn vị
                            </th>
                            <th className="py-2.5 px-3 whitespace-nowrap">
                              Giá bán gốc
                            </th>
                            <th className="py-2.5 px-3 text-center whitespace-nowrap">
                              Mức giảm giá
                            </th>
                            <th className="py-2.5 px-3 text-right whitespace-nowrap">
                              Giá sau giảm
                            </th>
                            <th className="py-2.5 px-3 text-center whitespace-nowrap">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {groupProducts.map((prod: any) => {
                            const activeDiscount = discountMap.get(prod.id);

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
    </div>
  );
}
