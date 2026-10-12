"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ProductDiscountItem } from "@/src/services/admin/adminProductDiscountService";

interface DeleteDiscountModalProps {
  isOpen: boolean;
  discount: ProductDiscountItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export default function DeleteDiscountModal({
  isOpen,
  discount,
  loading,
  onClose,
  onConfirm,
}: DeleteDiscountModalProps) {
  if (!isOpen || !discount) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">
              Gỡ khuyến mãi sản phẩm
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn gỡ mức giảm giá{" "}
              <strong className="text-rose-600 font-extrabold">
                {discount.discountPercent * 100}%
              </strong>{" "}
              của sản phẩm{" "}
              <span className="font-bold text-slate-800">
                {discount.productName}
              </span>{" "}
              không?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(discount.id)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? "Đang gỡ..." : "Xác nhận gỡ"}
          </button>
        </div>
      </div>
    </div>
  );
}
