"use client";

import React from "react";

export default function ProductTabs({ product }: { product: any }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-100">
        <h3 className="pb-3 text-xs font-bold text-emerald-600 border-b-2 border-emerald-600 inline-block">
          Thông tin sản phẩm
        </h3>
      </div>

      <div className="text-xs text-slate-700 leading-relaxed py-2 whitespace-pre-line">
        {product?.description || "Chưa có thông tin mô tả cho sản phẩm này."}
      </div>
    </div>
  );
}
