"use client";

import React, { useEffect, useState, useCallback } from "react";
import { branchReviewService } from "@/src/services/store/branchReviewService";
import BranchReviewSummaryCards from "./components/BranchReviewSummaryCards";
import BranchReviewFilter from "./components/BranchReviewFilter";
import BranchReviewList, { ReviewItem } from "./components/BranchReviewList";

export default function BranchReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<{
    averageOrderRating: number;
    averageProductRating: number;
    totalOrderReviews: number;
    totalProductReviews: number;
  }>();
  const [loading, setLoading] = useState<boolean>(true);

  const [type, setType] = useState<"ALL" | "ORDER" | "PRODUCT">("ALL");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await branchReviewService.getBranchReviews({
        type,
        rating,
        page,
        size: 10,
      });

      const data = res?.data || res;
      setReviews(data?.content || []);
      setTotalPages(data?.totalPages || 0);

      if (data?.branchSummary) {
        setSummary(data.branchSummary);
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá chi nhánh:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [type, rating, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleTypeChange = (newType: "ALL" | "ORDER" | "PRODUCT") => {
    setType(newType);
    setPage(0);
  };

  const handleRatingChange = (newRating: number | undefined) => {
    setRating(newRating);
    setPage(0);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Đánh giá chi nhánh
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý nhận xét và ý kiến phản hồi của khách hàng về dịch vụ & sản
          phẩm
        </p>
      </div>

      <BranchReviewSummaryCards summary={summary} />

      <BranchReviewFilter
        selectedType={type}
        selectedRating={rating}
        onTypeChange={handleTypeChange}
        onRatingChange={handleRatingChange}
      />

      <BranchReviewList
        reviews={reviews}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
