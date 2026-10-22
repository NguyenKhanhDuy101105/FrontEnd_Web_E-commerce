"use client";

interface CartSummarySidebarProps {
  totalAmount: number;
  selectedCount?: number;
  onCheckout: () => void;
}

export default function CartSummarySidebar({
  totalAmount,
  selectedCount = 0,
  onCheckout,
}: CartSummarySidebarProps) {
  return (
    <div className="space-y-4 sticky top-20">
      <div className="bg-white rounded-lg p-3.5 sm:p-5 shadow-xs border border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            Khuyến mãi/Evoucher
          </span>
          <button
            type="button"
            className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
          >
            Chọn hoặc nhập mã
          </button>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400">
          Đơn hàng chưa đủ điều kiện áp dụng khuyến mãi. Vui lòng mua thêm để áp
          dụng.
        </p>
      </div>

      <div className="bg-white rounded-lg p-3.5 sm:p-5 shadow-xs border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2">
          Thanh toán
        </h3>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Tổng tạm tính ({selectedCount} sản phẩm)</span>
            <span className="font-bold text-slate-900">
              {totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800">Thành tiền</span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-emerald-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
              <p className="text-[10px] text-slate-400 font-normal">
                (Đã bao gồm VAT)
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onCheckout}
          className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-lg transition shadow-md active:scale-[0.99] cursor-pointer tracking-wider"
        >
          TIẾP TỤC {selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>
      </div>
    </div>
  );
}
