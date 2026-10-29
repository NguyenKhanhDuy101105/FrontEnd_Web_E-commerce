"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TicketIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  voucherService,
  CustomerVoucherItem,
} from "@/src/services/customer/voucherService";
import { showToast } from "@/src/utils/toast";
import VoucherDetailModal from "@/src/components/common/VoucherDetailModal";

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<CustomerVoucherItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailVoucher, setDetailVoucher] =
    useState<CustomerVoucherItem | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const res = await voucherService.getVouchers({
          isAvailableOnly: true,
          page: 0,
          size: 50,
        });

        if (res && res.data && Array.isArray(res.data.content)) {
          setVouchers(res.data.content);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách voucher:", error);
        showToast.error("Không thể tải danh sách voucher & ưu đãi!");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleApplyVoucher = (voucher: CustomerVoucherItem) => {
    localStorage.setItem("checkout_selected_voucher", JSON.stringify(voucher));
    showToast.success(
      `Đã chọn mã ${voucher.code}. Đang chuyển hướng đến giỏ hàng...`,
    );
    router.push("/cart");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Voucher & Ưu đãi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách các mã giảm giá khả dụng áp dụng cho đơn hàng của bạn.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60">
          {vouchers.length} mã khả dụng
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Đang tải danh sách voucher...
        </div>
      ) : vouchers.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">
            Hiện tại không có mã giảm giá nào khả dụng trong hệ thống.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="border border-slate-200 hover:border-emerald-400 bg-white rounded-lg p-4 flex gap-3.5 items-center transition-all shadow-2xs hover:shadow-xs group"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-xl flex flex-col items-center justify-center shrink-0 border border-red-100">
                <TicketIcon className="w-7 h-7" />
                <span className="text-xs font-black text-red-600 mt-0.5">
                  {voucher.discountType === "PERCENT"
                    ? `-${voucher.discountValue}%`
                    : `-${(voucher.discountValue / 1000).toLocaleString("vi-VN")}K`}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200/60 inline-block uppercase">
                    {voucher.code}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
                  {voucher.title}
                </h3>

                {voucher.minOrderAmount ? (
                  <p className="text-[11px] text-slate-500">
                    Đơn tối thiểu{" "}
                    <span className="font-semibold text-slate-700">
                      {voucher.minOrderAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Áp dụng cho mọi đơn hàng
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  {voucher.endDate && (
                    <span>
                      HSD:{" "}
                      {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                  <span>
                    Lượt dùng: {voucher.usedCount}
                    {voucher.usageLimit ? `/${voucher.usageLimit}` : "/∞"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 border-l border-slate-100 pl-3">
                <button
                  type="button"
                  onClick={() => handleApplyVoucher(voucher)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Dùng ngay
                </button>

                <button
                  type="button"
                  onClick={() => setDetailVoucher(voucher)}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Chi tiết</span>
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VoucherDetailModal
        isOpen={!!detailVoucher}
        onClose={() => setDetailVoucher(null)}
        voucher={detailVoucher}
        onApply={(v) => {
          setDetailVoucher(null);
          handleApplyVoucher(v);
        }}
      />
    </div>
  );
}
