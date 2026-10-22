"use client";

import React from "react";
import { BranchOrderItem } from "@/src/services/store/branchOrderService";

interface OrderPackingChecklistProps {
  items: BranchOrderItem[];
  isProcessingStatus: boolean;
  checkedItems: Record<string, boolean>;
  onToggleCheck: (productId: string) => void;
  onToggleCheckAll: () => void;
}

export default function OrderPackingChecklist({
  items,
  isProcessingStatus,
  checkedItems,
  onToggleCheck,
  onToggleCheckAll,
}: OrderPackingChecklistProps) {
  const totalItems = items.length;
  const checkedCount = items.filter((i) => checkedItems[i.productId]).length;
  const isAllChecked = totalItems > 0 && checkedCount === totalItems;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">
          Sản phẩm ({totalItems})
        </h3>

        {isProcessingStatus && totalItems > 0 && (
          <button
            type="button"
            onClick={onToggleCheckAll}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            {isAllChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
        )}
      </div>

      <div className="border border-slate-100 rounded-lg overflow-hidden p-1">
        <div className="max-h-52.5 overflow-y-auto divide-y divide-slate-100 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {items.map((item, idx) => {
            const isChecked = !!checkedItems[item.productId];

            return (
              <div
                key={item.productId || idx}
                onClick={() => {
                  if (isProcessingStatus) onToggleCheck(item.productId);
                }}
                className={`p-3 flex items-center justify-between text-xs transition-colors ${
                  isProcessingStatus ? "cursor-pointer select-none" : ""
                } ${isChecked ? "bg-emerald-50/40" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center space-x-3">
                  {isProcessingStatus && (
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCheck(item.productId)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                    />
                  )}

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.productName}
                    className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0"
                  />

                  <div>
                    <p
                      className={`font-bold transition-all ${
                        isChecked && isProcessingStatus
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {item.productName}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      SKU: {item.sku}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-slate-500 text-[11px]">
                    {item.quantity} {item.unit} x{" "}
                    {item.unitPrice.toLocaleString("vi-VN")} đ
                  </p>
                  <p className="font-extrabold text-emerald-700 text-xs mt-0.5">
                    {item.totalPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
