"use client";

import React, { useState, useRef } from "react";
import {
  XMarkIcon,
  StarIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { reviewService } from "@/src/services/customer/reviewService";
import { showToast } from "@/src/utils/toast";

interface OrderReviewModalProps {
  orderId: string;
  orderCode: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OrderReviewModal({
  orderId,
  orderCode,
  onClose,
  onSuccess,
}: OrderReviewModalProps) {
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý chọn ảnh từ máy tính & convert sang Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    if (images.length + fileList.length > 5) {
      showToast.error("Chỉ được tải lên tối đa 5 hình ảnh!");
      return;
    }

    fileList.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast.error("Vui lòng chọn file hình ảnh hợp lệ!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reviewService.createOrderReview(orderId, {
        deliveryRating,
        serviceRating,
        comment: comment.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      });

      if (res.status === "success" || res.data) {
        showToast.success("Cảm ơn bạn đã gửi đánh giá đơn hàng!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast.error(res.message || "Đánh giá thất bại. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi gửi đánh giá đơn hàng:", error);
      showToast.error(
        error?.response?.data?.message || "Không thể gửi đánh giá lúc này!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarInput = (
    value: number,
    onChange: (rating: number) => void,
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
          >
            {star <= value ? (
              <StarIcon className="w-6 h-6 text-amber-400" />
            ) : (
              <StarOutlineIcon className="w-6 h-6 text-slate-300 hover:text-amber-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Đánh giá đơn hàng #{orderCode}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chia sẻ trải nghiệm của bạn về dịch vụ và vận chuyển
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Chất lượng dịch vụ:
              </span>
              {renderStarInput(serviceRating, setServiceRating)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-xs font-bold text-slate-700">
                Tốc độ giao hàng:
              </span>
              {renderStarInput(deliveryRating, setDeliveryRating)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nhận xét chi tiết (Không bắt buộc)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ nhận xét của bạn về đơn hàng này..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Chọn ảnh thực tế */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hình ảnh đính kèm (Tối đa 5 ảnh)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex items-center gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden group bg-slate-50"
                >
                  <img
                    src={img}
                    alt={`upload-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <TrashIcon className="w-4 h-4 text-rose-400 hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer"
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold mt-1">
                    Thêm ảnh
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
