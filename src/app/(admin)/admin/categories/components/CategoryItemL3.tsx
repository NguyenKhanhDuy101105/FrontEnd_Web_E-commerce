"use client";

import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";

interface Props {
  category: CategoryItem;
  l2Id: string;
  parentPath: string;
  onEdit: (item: CategoryItem, path: string, parentId: string | null) => void;
  onDelete: (id: string, name: string) => void;
}

export default function CategoryItemL3({
  category,
  l2Id,
  parentPath,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center justify-between p-2 text-xs bg-white rounded-lg border border-slate-100 hover:shadow-2xs transition">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#0d5c3a]" />
        <span className="font-medium text-slate-700">{category.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(category, parentPath, l2Id)}
          className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
          title="Chỉnh sửa"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(category.id, category.name)}
          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
          title="Xóa"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
