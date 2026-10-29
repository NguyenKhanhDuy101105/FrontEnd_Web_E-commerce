"use client";

import React from "react";

export default function ProductReviews({ productId }: { productId: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-center">
      <h3 className="text-sm font-bold text-slate-800 text-left border-b border-slate-100 pb-3">
        Đánh giá sản phẩm
      </h3>
      <div className="py-8 space-y-3">
        <p className="text-xs text-slate-500">
          Hãy trở thành người đầu tiên đánh giá sản phẩm này
        </p>
        <button
          type="button"
          className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition"
        >
          Viết đánh giá
        </button>
      </div>
    </div>
  );
}
