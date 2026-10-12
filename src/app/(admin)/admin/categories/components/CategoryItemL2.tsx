"use client";

import React from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";
import CategoryItemL3 from "./CategoryItemL3";

interface Props {
  category: CategoryItem;
  index: number;
  l1Name: string;
  l1Id: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onAddChild: (parent: CategoryItem, parentName: string) => void;
  onEdit: (item: CategoryItem, path: string, parentId: string | null) => void;
  onDelete: (id: string, name: string) => void;
}

export default function CategoryItemL2({
  category,
  index,
  l1Name,
  l1Id,
  expandedIds,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
}: Props) {
  const isExpanded = expandedIds.has(category.id);
  const l3List = category.children || [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleExpand(category.id)}
            className="p-0.5 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronRightIcon className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="text-xs font-bold text-slate-800">
            {index + 1}. {category.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddChild(category, l1Name)}
            className="px-2 py-0.5 text-[11px] font-bold text-[#0d5c3a] bg-white border border-emerald-200 hover:bg-emerald-50 rounded-md transition cursor-pointer"
          >
            + Thêm L3
          </button>

          <button
            onClick={() => onEdit(category, l1Name, l1Id)}
            className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
          >
            <PencilSquareIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(category.id, category.name)}
            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && l3List.length > 0 && (
        <div className="pl-6 space-y-1.5">
          {l3List.map((l3) => (
            <CategoryItemL3
              key={l3.id}
              category={l3}
              l2Id={category.id}
              parentPath={`${l1Name} > ${category.name}`}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
