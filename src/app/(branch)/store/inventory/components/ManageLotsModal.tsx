"use client";

import React, { useEffect, useState, useCallback } from "react";
import { XMarkIcon, PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  InventoryLot,
  InventoryProduct,
  branchInventoryService,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";

interface ManageLotsModalProps {
  branchId: string;
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageLotsModal({
  branchId,
  product,
  isOpen,
  onClose,
}: ManageLotsModalProps) {
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<string>("");

  const fetchLots = useCallback(async () => {
    if (!product) return;
    setLoading(true);
    try {
      const res = await branchInventoryService.getProductLots(
        branchId,
        product.productId,
      );
      setLots(res?.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách lô:", error);
      showToast.error("Không thể tải danh sách lô hàng!");
    } finally {
      setLoading(false);
    }
  }, [branchId, product]);

  useEffect(() => {
    if (isOpen && product) {
      fetchLots();
    }
  }, [isOpen, product, fetchLots]);

  if (!isOpen || !product) return null;

  const handleUpdateExpiry = async (lotId: string) => {
    if (!newExpiryDate) {
      showToast.error("Vui lòng chọn ngày hết hạn mới!");
      return;
    }

    try {
      await branchInventoryService.updateLotExpiry(branchId, lotId, {
        expiryDate: newExpiryDate,
      });
      showToast.success("Cập nhật ngày hết hạn lô hàng thành công!");
      setEditingLotId(null);
      fetchLots(); // Tải lại danh sách lô
    } catch (error) {
      console.error("Lỗi cập nhật lô hàng:", error);
      showToast.error("Cập nhật ngày hết hạn thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Danh sách lô hàng ({lots.length} lô)
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

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Đang tải danh sách lô hàng...
          </div>
        ) : lots.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có lô hàng nào được lưu.
          </div>
        ) : (
          <div className="max-h-75 overflow-y-auto space-y-2 pr-1">
            {lots.map((lot) => {
              const isEditing = editingLotId === lot.lotId;

              return (
                <div
                  key={lot.lotId}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800">
                      Số lượng: {lot.quantity} {product.unit || "SP"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ngày nhập:{" "}
                      {new Date(lot.receivedAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  {/* Chỉnh sửa Ngày Hạn Sử Dụng */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={newExpiryDate}
                          onChange={(e) => setNewExpiryDate(e.target.value)}
                          className="p-1 border border-blue-500 bg-white rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateExpiry(lot.lotId)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                          title="Lưu"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          HSD: {lot.expiryDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLotId(lot.lotId);
                            setNewExpiryDate(lot.expiryDate);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                          title="Sửa HSD"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
