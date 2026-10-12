"use client";

import React from "react";
import { TagIcon } from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";

interface Props {
  categories: CategoryItem[];
  selectedL1Id: string;
  selectedL2Id: string;
  selectedL3Id: string;
  onSelectL1: (id: string) => void;
  onSelectL2: (id: string) => void;
  onSelectL3: (id: string) => void;
}

export default function CategoryCascader({
  categories,
  selectedL1Id,
  selectedL2Id,
  selectedL3Id,
  onSelectL1,
  onSelectL2,
  onSelectL3,
}: Props) {
  // Danh sách Cấp 2 thuộc Cấp 1 đang chọn
  const l2List = categories.find((c) => c.id === selectedL1Id)?.children || [];

  // Danh sách Cấp 3 thuộc Cấp 2 đang chọn
  const l3List = l2List.find((c) => c.id === selectedL2Id)?.children || [];

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <label className=" font-bold text-slate-800 flex items-center gap-1.5 text-xs">
        <TagIcon className="w-4 h-4 text-[#0d5c3a]" />
        <span>Phân loại Danh mục *</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {/* Select Cấp 1 */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-500 mb-1">
            Danh mục Cấp 1
          </span>
          <select
            value={selectedL1Id}
            onChange={(e) => onSelectL1(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-800 cursor-pointer"
          >
            <option value="">-- Chọn Cấp 1 --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Cấp 2 */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-500 mb-1">
            Danh mục Cấp 2
          </span>
          <select
            value={selectedL2Id}
            disabled={!selectedL1Id || l2List.length === 0}
            onChange={(e) => onSelectL2(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">-- Chọn Cấp 2 --</option>
            {l2List.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Cấp 3 */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-500 mb-1">
            Danh mục Cấp 3
          </span>
          <select
            value={selectedL3Id}
            disabled={!selectedL2Id || l3List.length === 0}
            onChange={(e) => onSelectL3(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">-- Chọn Cấp 3 --</option>
            {l3List.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
