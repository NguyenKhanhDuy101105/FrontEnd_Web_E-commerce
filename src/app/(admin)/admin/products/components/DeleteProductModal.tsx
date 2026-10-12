"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ProductItem } from "./ProductTable";
import { adminProductService } from "@/src/services/admin/adminProductService";
import { showToast } from "@/src/utils/toast";

interface Props {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminProductService.deleteProduct(product.id);
      showToast.success("Xóa sản phẩm thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      showToast.error("Không thể xóa sản phẩm, vui lòng thử lại!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 shadow-2xl p-5 space-y-4">
        {/* Header Modal: Tiêu đề ở giữa, Nút X bên phải */}
        <div className="relative flex items-center justify-center pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 text-center">
            Xác nhận xóa sản phẩm?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung cảnh báo */}
        <div className="space-y-1.5 text-center">
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Bạn có chắc chắn muốn xóa sản phẩm{" "}
            <span className="font-bold text-slate-800">{product.name}</span>{" "}
            (SKU:{" "}
            <span className="font-bold text-slate-800">{product.sku}</span>)?
            Thao tác này không thể hoàn tác.
          </p>
        </div>

        {/* Nút thao tác */}
        <div className="pt-2 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
