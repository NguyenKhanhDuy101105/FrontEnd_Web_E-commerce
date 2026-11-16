"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

interface BranchReviewFilterProps {
  selectedType: "ALL" | "ORDER" | "PRODUCT";
  selectedRating: number | undefined;
  onTypeChange: (type: "ALL" | "ORDER" | "PRODUCT") => void;
  onRatingChange: (rating: number | undefined) => void;
}

export default function BranchReviewFilter({
  selectedType,
  selectedRating,
  onTypeChange,
  onRatingChange,
}: BranchReviewFilterProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Phân loại Tab */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => onTypeChange("ALL")}
          className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
            selectedType === "ALL"
              ? "bg-white text-emerald-800 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("ORDER")}
          className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
            selectedType === "ORDER"
              ? "bg-white text-emerald-800 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Đơn hàng
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("PRODUCT")}
          className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
            selectedType === "PRODUCT"
              ? "bg-white text-emerald-800 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sản phẩm
        </button>
      </div>

      {/* Bộ lọc số sao (5 sao -> 1 sao) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              onRatingChange(selectedRating === star ? undefined : star)
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              selectedRating === star
                ? "bg-amber-400 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{star}</span>
            <StarIcon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
