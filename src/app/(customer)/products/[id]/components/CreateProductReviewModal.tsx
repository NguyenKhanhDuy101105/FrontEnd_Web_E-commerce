"use client";

import React, { useState } from "react";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/solid";
import { reviewService } from "@/src/services/customer/reviewService";
import { usePurchasedOrders } from "@/src/context/PurchasedOrdersContext";
import { showToast } from "@/src/utils/toast";

interface CreateProductReviewModalProps {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProductReviewModal({
  productId,
  onClose,
  onSuccess,
}: CreateProductReviewModalProps) {
  const { getOrderIdForProduct, hasPurchasedProduct, loading } =
    usePurchasedOrders();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPurchased = hasPurchasedProduct(productId);
  const matchedOrderId = getOrderIdForProduct(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchedOrderId) {
      showToast.error(
        "Bạn cần mua và hoàn thành đơn hàng chứa sản phẩm này để đánh giá!",
      );
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.createProductReview(productId, {
        orderId: matchedOrderId,
        rating,
        comment: comment.trim() || undefined,
      });

      showToast.success("Đăng đánh giá sản phẩm thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi đăng đánh giá:", error);
      const errMsg =
        error?.response?.data?.message || "Không thể gửi đánh giá!";
      showToast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-base text-slate-800">
            Viết đánh giá sản phẩm
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Đang kiểm tra lịch sử mua hàng...
          </div>
        ) : !isPurchased ? (
          <div className="p-6 text-center space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành nên chưa
              thể gửi đánh giá.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Đánh giá chất lượng
              </label>
              <div className="flex items-center gap-1 justify-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <StarIcon
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? "text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung nhận xét
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về chất lượng sản phẩm..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-green-600 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
