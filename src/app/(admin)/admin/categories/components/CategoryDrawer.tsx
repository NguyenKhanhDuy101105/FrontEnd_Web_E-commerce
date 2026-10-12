"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";
import {
  adminCategoryService,
  UpdateCategoryRequest,
} from "@/src/services/admin/adminCategoryService";
import { showToast } from "@/src/utils/toast";

interface Props {
  isOpen: boolean;
  editingItem: CategoryItem | null;
  parentId: string | null;
  parentNameDisplay: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryDrawer({
  isOpen,
  editingItem,
  parentId,
  parentNameDisplay,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
    } else {
      setName("");
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast.error("Vui lòng nhập tên danh mục!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const payload: UpdateCategoryRequest = {
          name: trimmedName,
          parentId: parentId,
        };

        await adminCategoryService.updateCategory(editingItem.id, payload);
        showToast.success("Cập nhật danh mục thành công!");
      } else if (parentId) {
        const createdRes = await adminCategoryService.createCategory({
          name: trimmedName,
          children: [],
        });

        const newCategoryId = createdRes?.data?.id;
        if (newCategoryId) {
          await adminCategoryService.updateCategory(newCategoryId, {
            name: trimmedName,
            parentId: parentId,
          });
        }
        showToast.success("Thêm mới danh mục con thành công!");
      } else {
        await adminCategoryService.createCategory({
          name: trimmedName,
          children: [],
        });
        showToast.success("Thêm mới danh mục gốc thành công!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      showToast.error("Thao tác thất bại, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Tên danh mục *
            </label>
            <input
              type="text"
              placeholder="Nhập tên danh mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Danh mục cha trực thuộc
            </label>
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs font-bold text-[#0d5c3a] truncate">
              {parentNameDisplay}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Thứ tự hiển thị (Sort Index)
            </label>
            <input
              type="number"
              defaultValue={1}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-800 font-bold"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 font-bold text-white bg-[#0d5c3a] hover:bg-[#094229] rounded-lg shadow-xs transition disabled:bg-slate-300 cursor-pointer"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
