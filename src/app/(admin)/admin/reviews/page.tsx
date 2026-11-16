"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReviewTable from "@/src/app/(admin)/admin/reviews/components/ReviewTable";
import {
  adminReviewService,
  AdminReviewItem,
  ReviewType,
} from "@/src/services/admin/adminReviewService";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<ReviewType>("ALL");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminReviewService.getAdminReviews({
        keyword: keyword || undefined,
        type: type || "ALL",
        rating: rating ? Number(rating) : undefined,
        page,
        size: 10,
      });

      if (res && res.data) {
        setReviews(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách đánh giá:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, type, rating, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <ReviewTable
        reviews={reviews}
        loading={loading}
        keyword={keyword}
        type={type}
        rating={rating}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onKeywordChange={(val) => {
          setKeyword(val);
          setPage(0);
        }}
        onTypeChange={(val) => {
          setType(val);
          setPage(0);
        }}
        onRatingChange={(val) => {
          setRating(val);
          setPage(0);
        }}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
