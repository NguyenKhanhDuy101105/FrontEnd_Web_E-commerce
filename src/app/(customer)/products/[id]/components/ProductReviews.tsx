"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { reviewService } from "@/src/services/customer/reviewService";
import CreateProductReviewModal from "./CreateProductReviewModal";

interface ReviewItem {
  id: string;
  customerName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(
    undefined,
  );
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await reviewService.getProductReviews(productId, {
        rating: selectedRating,
        page,
        size: 10,
      });
      const data = res?.data || res;
      setReviews(data?.content || []);
      setAverageRating(data?.averageRating || 0);
      setTotalReviews(data?.totalReviews || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá sản phẩm:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, selectedRating, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">
              Đánh giá sản phẩm
            </h3>
            {totalReviews > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200/60 rounded-full text-xs font-bold text-amber-700">
                <span>{averageRating.toFixed(1)}</span>
                <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 font-normal">
                  ({totalReviews} đánh giá)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {[5, 4, 3, 2, 1].map((filterStar) => (
              <button
                key={filterStar}
                type="button"
                onClick={() => {
                  setSelectedRating(
                    selectedRating === filterStar ? undefined : filterStar,
                  );
                  setPage(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  selectedRating === filterStar
                    ? "bg-amber-400 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{filterStar}</span>
                <StarIcon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl transition cursor-pointer self-start sm:self-auto shadow-xs"
        >
          Viết đánh giá
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Đang tải đánh giá...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-xs text-slate-500">
            Hãy trở thành người đầu tiên đánh giá sản phẩm này
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {reviews.map((item) => (
            <div key={item.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  {item.customerName || "Khách hàng"}
                </span>
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

              {item.comment && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {item.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
          >
            Trước
          </button>
          <span className="text-slate-500">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
          >
            Sau
          </button>
        </div>
      )}

      {isOpenModal && (
        <CreateProductReviewModal
          productId={productId}
          onClose={() => setIsOpenModal(false)}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
}
