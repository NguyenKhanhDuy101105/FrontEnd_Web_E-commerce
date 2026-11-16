"use client";

import React from "react";
import { StarIcon, ShoppingBagIcon, TagIcon } from "@heroicons/react/24/solid";

interface BranchSummaryProps {
  summary?: {
    averageOrderRating: number;
    averageProductRating: number;
    totalOrderReviews: number;
    totalProductReviews: number;
  };
}

export default function BranchReviewSummaryCards({
  summary,
}: BranchSummaryProps) {
  const avgOrder = summary?.averageOrderRating ?? 0;
  const avgProduct = summary?.averageProductRating ?? 0;
  const totalOrder = summary?.totalOrderReviews ?? 0;
  const totalProduct = summary?.totalProductReviews ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Đánh giá Đơn hàng (Dịch vụ & Giao hàng) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <ShoppingBagIcon className="w-4 h-4 text-emerald-600" />
            Đánh giá Đơn hàng & Dịch vụ
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {avgOrder.toFixed(1)}
            </span>
            <div className="flex items-center text-amber-400">
              <StarIcon className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs text-slate-400">
              ({totalOrder.toLocaleString("vi-VN")} lượt đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* Đánh giá Sản phẩm */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <TagIcon className="w-4 h-4 text-blue-600" />
            Đánh giá Chất lượng Sản phẩm
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {avgProduct.toFixed(1)}
            </span>
            <div className="flex items-center text-amber-400">
              <StarIcon className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs text-slate-400">
              ({totalProduct.toLocaleString("vi-VN")} lượt đánh giá)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
