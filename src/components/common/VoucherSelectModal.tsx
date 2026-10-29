"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  TicketIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  voucherService,
  CustomerVoucherItem,
} from "@/src/services/customer/voucherService";
import { showToast } from "@/src/utils/toast";
import { getBestVoucher, isVoucherEligible } from "@/src/utils/voucherHelper";
import VoucherDetailModal from "./VoucherDetailModal";

interface VoucherSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher: (voucher: CustomerVoucherItem) => void;
  branchId: string;
  orderAmount?: number;
  selectedVoucherCode?: string;
}

export default function VoucherSelectModal({
  isOpen,
  onClose,
  onApplyVoucher,
  branchId,
  orderAmount = 0,
  selectedVoucherCode,
}: VoucherSelectModalProps) {
  const [vouchers, setVouchers] = useState<CustomerVoucherItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>("");
  const [applyingCode, setApplyingCode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const [detailVoucher, setDetailVoucher] =
    useState<CustomerVoucherItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const res = await voucherService.getVouchers({
          isAvailableOnly: true,
          page: 0,
          size: 50,
        });

        if (res && res.data && Array.isArray(res.data.content)) {
          const list = res.data.content;
          setVouchers(list);

          // Tự động tìm & áp dụng voucher tối ưu nhất nếu người dùng chưa chọn mã nào
          if (!selectedVoucherCode && orderAmount > 0) {
            const best = getBestVoucher(list, orderAmount);
            if (best) {
              onApplyVoucher(best);
            }
          }
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
  }, [isOpen]);

  // Lọc chỉ giữ lại danh sách các voucher khả dụng
  const eligibleVouchers = useMemo(() => {
    return vouchers.filter((v) => isVoucherEligible(v, orderAmount));
  }, [vouchers, orderAmount]);

  if (!isOpen || !mounted) return null;

  const handleApplyInputCode = async () => {
    if (!inputCode.trim()) return;

    setApplyingCode(true);
    try {
      const res = await voucherService.applyVoucher({
        code: inputCode.trim(),
        branchId: branchId || "",
      });

      if (res && (res.status === "success" || res.data)) {
        const matched = vouchers.find(
          (v) => v.code.toUpperCase() === inputCode.trim().toUpperCase(),
        );

        if (matched) {
          onApplyVoucher(matched);
        } else {
          onApplyVoucher({
            id: "",
            code: res.data.code,
            title: `Mã giảm giá ${res.data.code}`,
            discountType: "FIXED",
            discountValue: res.data.discountAmount,
            startDate: "",
            endDate: "",
            usedCount: 0,
            isActive: true,
            createdAt: "",
            updatedAt: "",
          });
        }

        showToast.success("Áp dụng mã giảm giá thành công!");
        onClose();
      } else {
        showToast.error(res.message || "Không thể áp dụng mã giảm giá này!");
      }
    } catch (error: unknown) {
      console.error("Lỗi áp dụng mã:", error);

      let errorMessage = "Không thể áp dụng mã giảm giá này!";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        errorMessage = (error as { response: { data: { message: string } } })
          .response.data.message;
      }

      showToast.error(errorMessage);
    } finally {
      setApplyingCode(false);
    }
  };

  const handleSelectVoucherItem = async (voucher: CustomerVoucherItem) => {
    setApplyingCode(true);
    try {
      const res = await voucherService.applyVoucher({
        code: voucher.code,
        branchId: branchId || "",
      });

      if (res && (res.status === "success" || res.data)) {
        onApplyVoucher(voucher);
        showToast.success("Áp dụng mã giảm giá thành công!");
        setDetailVoucher(null);
        onClose();
      } else {
        showToast.error(res.message || "Không thể áp dụng mã giảm giá này!");
      }
    } catch (error: unknown) {
      console.error("Lỗi chọn mã giảm giá:", error);

      let errorMessage = "Không thể áp dụng mã giảm giá này!";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        errorMessage = (error as { response: { data: { message: string } } })
          .response.data.message;
      }

      showToast.error(errorMessage);
    } finally {
      setApplyingCode(false);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Khuyến mãi và mã giảm giá
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 pb-4 space-y-4">
            <div className="flex gap-2">
              <select className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500 font-medium text-slate-700">
                <option value="urbanmart">UrbanMart Online</option>
              </select>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Mã giảm giá/phiếu mua hàng"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500 uppercase font-mono font-bold"
                />
                <button
                  type="button"
                  disabled={!inputCode.trim() || applyingCode}
                  onClick={handleApplyInputCode}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {applyingCode ? "Đang xử lý..." : "Áp dụng"}
                </button>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-800 pt-1">
              Mua sản phẩm với giá ưu đãi
            </h4>
          </div>

          <div className="px-6 pb-4 max-h-80 overflow-y-auto space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Đang tải mã giảm giá...
              </div>
            ) : eligibleVouchers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Hiện không có mã giảm giá nào phù hợp với đơn hàng của bạn.
              </div>
            ) : (
              eligibleVouchers.map((voucher) => {
                const isSelected = selectedVoucherCode === voucher.code;

                return (
                  <div
                    key={voucher.id}
                    className={`border rounded-xl p-3.5 flex gap-3.5 items-center transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40"
                        : "border-slate-200 hover:border-emerald-300 bg-white"
                    }`}
                  >
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <TicketIcon className="w-6 h-6" />
                      <span className="text-[10px] font-black text-red-600 mt-0.5">
                        {voucher.discountType === "PERCENT"
                          ? `-${voucher.discountValue}%`
                          : `-${(voucher.discountValue / 1000).toLocaleString("vi-VN")}K`}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200/60 inline-block uppercase">
                          {voucher.code}
                        </span>
                        <span className="text-xs font-bold text-red-600">
                          {voucher.discountType === "PERCENT"
                            ? `Giảm ${voucher.discountValue}%`
                            : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
                        {voucher.title}
                      </p>

                      {voucher.minOrderAmount && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Đơn tối thiểu{" "}
                          <span className="font-semibold text-slate-700">
                            {voucher.minOrderAmount.toLocaleString("vi-VN")}đ
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={applyingCode}
                        onClick={() => handleSelectVoucherItem(voucher)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isSelected ? "Đã chọn" : "Áp dụng"}
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
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Xem thêm</span>
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <VoucherDetailModal
        isOpen={!!detailVoucher}
        onClose={() => setDetailVoucher(null)}
        voucher={detailVoucher}
        onApply={handleSelectVoucherItem}
        applyingCode={applyingCode}
      />
    </>,
    document.body,
  );
}
