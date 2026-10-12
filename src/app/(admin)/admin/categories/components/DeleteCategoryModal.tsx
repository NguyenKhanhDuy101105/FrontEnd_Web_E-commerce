"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";
import { adminCategoryService } from "@/src/services/admin/adminCategoryService";
import { showToast } from "@/src/utils/toast";

interface Props {
  isOpen: boolean;
  category: CategoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen || !category) return null;

  const hasChildren = category.children && category.children.length > 0;

  const handleDelete = async () => {
    if (hasChildren) {
      showToast.error(
        `Danh mục "${category.name}" còn chứa ${category.children.length} danh mục con. Vui lòng xóa các danh mục con trước!`,
      );
      return;
    }

    setIsDeleting(true);
    try {
      await adminCategoryService.deleteCategory(category.id);
      showToast.success(`Đã xóa danh mục "${category.name}" thành công!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi xóa danh mục:", error);

      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        showToast.error(backendMessage);
      } else {
        showToast.error(
          "Không thể xóa danh mục này. Có thể danh mục đang có sản phẩm thuộc về!",
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 shadow-2xl p-5 space-y-4 animate-scaleUp">
        <div className="relative flex items-center justify-center pb-2 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 text-center">
            Xác nhận xóa danh mục?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Bạn có chắc chắn muốn xóa danh mục{" "}
            <span className="font-bold text-slate-800">{category.name}</span>?{" "}
            Thao tác này không thể hoàn tác.
          </p>

          {hasChildren && (
            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 font-bold mt-2 text-center">
              Danh mục này đang chứa {category.children.length} danh mục con.
            </div>
          )}
        </div>

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
            disabled={isDeleting || hasChildren}
            className="px-4 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
