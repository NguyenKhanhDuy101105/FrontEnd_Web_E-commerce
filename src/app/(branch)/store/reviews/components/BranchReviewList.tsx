"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

export interface ReviewItem {
  id: string;
  customerName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  type?: "ORDER" | "PRODUCT";
  productName?: string;
  productImage?: string;
  orderId?: string;
}

interface BranchReviewListProps {
  reviews: ReviewItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function BranchReviewList({
  reviews,
  loading,
  page,
  totalPages,
  onPageChange,
}: BranchReviewListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-xs text-slate-400 animate-pulse shadow-xs">
        Đang tải danh sách đánh giá...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-xs text-slate-500 shadow-xs">
        Chưa có đánh giá nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Khối danh sách có chiều cao cố định và thanh cuộn dọc */}
      <div className="max-h-[520px] overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 space-y-4 custom-scrollbar pr-2">
        {reviews.map((item) => (
          <div key={item.id} className="pt-4 first:pt-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800">
                  {item.customerName || "Khách hàng mua tại chi nhánh"}
                </span>
                {item.type && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      item.type === "ORDER"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-blue-50 text-blue-700 border border-blue-200/60"
                    }`}
                  >
                    {item.type === "ORDER" ? "Đánh giá đơn" : "Đánh giá SP"}
                  </span>
                )}
              </div>
              {item.createdAt && (
                <span className="text-[11px] text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${
                    star <= item.rating ? "text-amber-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>

            {item.productName && (
              <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs w-fit">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-5 h-5 object-contain rounded"
                  />
                )}
                <span className="font-semibold text-slate-700">
                  {item.productName}
                </span>
              </div>
            )}

            {item.comment && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.comment}
              </p>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs bg-slate-50/50">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer font-medium"
          >
            Trước
          </button>
          <span className="text-slate-500 font-medium">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer font-medium"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
