"use client";

import React from "react";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export interface BranchInventorySummary {
  id: string;
  name: string;
  address: string;
  phone?: string;
  totalStockQuantity: number;
}

interface BranchCardProps {
  branch: BranchInventorySummary;
  onSelect: (branch: BranchInventorySummary) => void;
}

export default function BranchCard({ branch, onSelect }: BranchCardProps) {
  return (
    <div
      onClick={() => onSelect(branch)}
      className="bg-white rounded-lg p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0d5c3a]/40 transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-[#0d5c3a] rounded-xl group-hover:bg-[#0d5c3a] group-hover:text-white transition-colors shrink-0">
              <BuildingStorefrontIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0d5c3a] transition-colors line-clamp-1">
                {branch.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {branch.phone || "Chi nhánh chính thức"}
              </p>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-[#0d5c3a] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{branch.address}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ArchiveBoxIcon className="w-4 h-4 text-[#0d5c3a]" />
          <span>Tổng hàng tồn kho:</span>
        </div>
        <span className="text-sm font-black text-[#0d5c3a] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          {branch.totalStockQuantity.toLocaleString("vi-VN")} SP
        </span>
      </div>
    </div>
  );
}
