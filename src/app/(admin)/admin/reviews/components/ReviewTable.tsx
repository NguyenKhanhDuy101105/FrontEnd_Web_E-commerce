"use client";

import React from "react";
import { StarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import {
  AdminReviewItem,
  ReviewType,
} from "@/src/services/admin/adminReviewService";

interface ReviewTableProps {
  reviews: AdminReviewItem[];
  loading: boolean;
  keyword: string;
  type: ReviewType;
  rating: string;
  page: number;
  totalPages: number;
  totalElements: number;
  onKeywordChange: (val: string) => void;
  onTypeChange: (val: ReviewType) => void;
  onRatingChange: (val: string) => void;
  onPageChange: (newPage: number) => void;
}

export default function ReviewTable({
  reviews,
  loading,
  keyword,
  type,
  rating,
  page,
  totalPages,
  totalElements,
  onKeywordChange,
  onTypeChange,
  onRatingChange,
  onPageChange,
}: ReviewTableProps) {
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= score ? "text-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quản lý đánh giá & phản hồi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số:{" "}
            <span className="font-semibold text-slate-700">
              {totalElements}
            </span>{" "}
            đánh giá
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, tên khách hàng..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as ReviewType)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Tất cả loại đánh giá</option>
          <option value="ORDER">Đánh giá đơn hàng</option>
          <option value="PRODUCT">Đánh giá sản phẩm</option>
        </select>

        <select
          value={rating}
          onChange={(e) => onRatingChange(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Tất cả số sao</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
            <tr>
              <th className="p-3.5">Khách hàng</th>
              <th className="p-3.5">Chi nhánh</th>
              <th className="p-3.5">Loại</th>
              <th className="p-3.5 text-center">Đánh giá</th>
              <th className="p-3.5">Nội dung nhận xét</th>
              <th className="p-3.5">Hình ảnh</th>
              <th className="p-3.5 text-right">Ngày gửi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-slate-400 animate-pulse"
                >
                  Đang tải danh sách đánh giá...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Không tìm thấy đánh giá nào.
                </td>
              </tr>
            ) : (
              reviews.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">
                      {item.customerName || "Khách hàng"}
                    </span>
                    {item.orderCode && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Đơn: #{item.orderCode}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">
                    {item.branchName || "Chi nhánh"}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.reviewType === "PRODUCT"
                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}
                    >
                      {item.reviewType === "PRODUCT" ? "Sản phẩm" : "Đơn hàng"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-col items-center gap-0.5">
                      {renderStars(item.rating || item.serviceRating || 5)}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {item.rating
                          ? `${item.rating}/5`
                          : `DV: ${item.serviceRating}★ | GH: ${item.deliveryRating}★`}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    {item.targetName && (
                      <p
                        className="font-semibold text-slate-800 text-[11px] truncate"
                        title={item.targetName}
                      >
                        {item.targetName}
                      </p>
                    )}
                    <p
                      className="text-slate-600 line-clamp-2 mt-0.5"
                      title={item.comment}
                    >
                      {item.comment || "Không có nội dung nhận xét."}
                    </p>
                  </td>
                  <td className="p-3.5">
                    {item.images && item.images.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {item.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="review"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                        {item.images.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{item.images.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        Không có
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[11px] text-slate-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Trang {page + 1} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
