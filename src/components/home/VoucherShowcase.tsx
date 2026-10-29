"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  voucherService,
  CustomerVoucherItem,
} from "@/src/services/customer/voucherService";
import { showToast } from "@/src/utils/toast";

export default function VoucherShowcase() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<CustomerVoucherItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const calculateEffectiveValue = (v: CustomerVoucherItem): number => {
    if (v.discountType === "FIXED") {
      return v.discountValue || 0;
    }
    return v.maxDiscountAmount || v.discountValue || 0;
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await voucherService.getVouchers({
          page: 0,
          size: 20,
          isAvailableOnly: true,
        });

        if (res?.data?.content) {
          const sortedList = [...res.data.content].sort(
            (a, b) => calculateEffectiveValue(b) - calculateEffectiveValue(a),
          );
          setVouchers(sortedList);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách voucher:", error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleApplyVoucher = (code: string) => {
    localStorage.setItem("applied_voucher_code", code);
    showToast.success(`Đã chọn mã ${code}. Đang chuyển đến giỏ hàng...`);
    router.push("/cart");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatDiscountValue = (voucher: CustomerVoucherItem) => {
    if (voucher.discountType === "PERCENT") {
      return `Giảm ${voucher.discountValue}%`;
    }
    return `Giảm ${new Intl.NumberFormat("vi-VN").format(voucher.discountValue)} đ`;
  };

  if (!loading && vouchers.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            E-voucher khuyến mãi
          </h2>
        </div>

        {loading ? (
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none animate-pulse">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-72 sm:w-80 h-24 bg-slate-100 rounded-xl shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="flex space-x-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {vouchers.map((v) => {
              const formattedExpiry =
                v.startDate && v.endDate
                  ? `HSD: ${formatDate(v.startDate)} - ${formatDate(v.endDate)}`
                  : "HSD: Đang cập nhật";

              return (
                <div
                  key={v.id}
                  className="relative w-72 sm:w-80 h-24 bg-white border border-slate-200 rounded-xl flex items-center overflow-hidden shrink-0 snap-start hover:border-emerald-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="relative w-24 h-full bg-[#1d2b83] flex items-center justify-center p-2 shrink-0">
                    <div className="relative w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-xs">
                      <Image
                        src="/images/Logo.jpeg"
                        alt={v.title}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>
                  </div>

                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-50 border-r border-slate-200 rounded-full z-10" />
                  <div className="absolute top-1/2 left-23 -translate-y-1/2 w-3 h-3 bg-white border border-slate-200 rounded-full z-10" />

                  <div className="flex-1 p-2.5 pl-4 flex flex-col justify-between h-full overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug group-hover:text-emerald-700 transition-colors">
                          {v.title || formatDiscountValue(v)}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                        {v.description || `Nhập mã ${v.code} khi thanh toán`}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-[10px] text-slate-400 block truncate max-w-32.5">
                        {formattedExpiry}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher(v.code)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
