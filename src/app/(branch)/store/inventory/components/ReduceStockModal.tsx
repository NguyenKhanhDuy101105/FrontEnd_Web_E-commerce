"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  InventoryProduct,
  branchInventoryService,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";

interface ReduceStockModalProps {
  branchId: string;
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReduceStockModal({
  branchId,
  product,
  isOpen,
  onClose,
  onSuccess,
}: ReduceStockModalProps) {
  const [reduceQuantity, setReduceQuantity] = useState<number | "">(1);
  const [reason, setReason] = useState<string>("DAMAGED");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qtyNumber = Number(reduceQuantity);

    if (!reduceQuantity || qtyNumber <= 0) {
      showToast.error("Số lượng giảm phải lớn hơn 0!");
      return;
    }

    if (qtyNumber > product.stockQuantity) {
      showToast.error(
        `Số lượng báo giảm (${qtyNumber}) không được lớn hơn tồn kho hiện tại (${product.stockQuantity})!`,
      );
      return;
    }

    const newStockQuantity = product.stockQuantity - qtyNumber;

    setLoading(true);
    try {
      await branchInventoryService.updateInventory(branchId, {
        productId: product.productId,
        stockQuantity: newStockQuantity,
        reason: reason,
      });

      showToast.success("Đã cập nhật báo giảm tồn kho thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi giảm tồn kho:", error);
      const errMsg =
        error?.response?.data?.message || "Không thể cập nhật giảm tồn kho!";
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Báo giảm hàng tồn kho
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {product.productName} (Tồn hiện tại: {product.stockQuantity}{" "}
              {product.unit || "SP"})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Số lượng muốn giảm ({product.unit || "SP"})
            </label>
            <input
              type="number"
              min={1}
              max={product.stockQuantity}
              value={reduceQuantity}
              onChange={(e) => {
                const val = e.target.value;
                setReduceQuantity(val === "" ? "" : Number(val));
              }}
              onBlur={() => {
                if (reduceQuantity === "" || Number(reduceQuantity) < 1) {
                  setReduceQuantity(1);
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lý do báo giảm
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="DAMAGED">Hàng bị hỏng / vỡ / dập nát</option>
              <option value="EXPIRED">Hàng hết hạn sử dụng (Expired)</option>
              <option value="ADJUSTMENT">
                Điều chỉnh kiểm kê (Thất thoát / Sai lệch)
              </option>
              <option value="OTHER">Lý do khác</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Đang xử lý..." : "Xác nhận giảm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
