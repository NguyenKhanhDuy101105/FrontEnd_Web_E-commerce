"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  InventoryProduct,
  branchInventoryService,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";

interface CreateLotModalProps {
  branchId: string;
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLotModal({
  branchId,
  product,
  isOpen,
  onClose,
  onSuccess,
}: CreateLotModalProps) {
  const [quantity, setQuantity] = useState<number | "">(10);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) {
      showToast.error("Vui lòng chọn ngày hết hạn!");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      showToast.error("Số lượng lô hàng phải lớn hơn 0!");
      return;
    }

    setSubmitting(true);
    try {
      await branchInventoryService.createLot(branchId, {
        productId: product.productId,
        quantity: Number(quantity),
        expiryDate: expiryDate,
      });
      showToast.success("Nhập lô hàng mới thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi tạo lô hàng:", error);
      showToast.error("Không thể nhập lô hàng. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Nhập lô hàng mới
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {product.productName}
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
              Số lượng nhập lô ({product.unit || "SP"})
            </label>
            <input
              type="number"
              min={1}
              value={quantity === 0 ? "" : quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === "" ? "" : Number(val));
              }}
              onBlur={() => {
                if (!quantity || Number(quantity) < 1) {
                  setQuantity(1);
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d5c3a]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ngày hết hạn (Expiry Date)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d5c3a]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#0d5c3a] text-white font-bold hover:bg-[#094229] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Đang lưu..." : "Xác nhận nhập lô"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
