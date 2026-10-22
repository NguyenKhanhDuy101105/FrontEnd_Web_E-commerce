"use client";

import React from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { InventorySummary } from "@/src/services/store/branchInventoryService";

interface InventoryHeaderProps {
  branchName?: string;
  branchAddress?: string;
  summaryData: InventorySummary | null;
}

export default function InventoryHeader({
  branchName,
  branchAddress,
  summaryData,
}: InventoryHeaderProps) {
  const totalStock =
    summaryData?.totalAvailableQuantity ??
    summaryData?.totalOnHandQuantity ??
    0;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 text-[#0d5c3a] rounded-lg">
          <BuildingStorefrontIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {summaryData?.branchName || branchName || "Chi nhánh"}
          </h2>
          <p className="text-xs text-slate-500">{branchAddress || "---"}</p>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xs text-slate-500 block">Tổng kho chi nhánh</span>
        <span className="text-base font-black text-[#0d5c3a]">
          {totalStock.toLocaleString("vi-VN")} SP
        </span>
      </div>
    </div>
  );
}
