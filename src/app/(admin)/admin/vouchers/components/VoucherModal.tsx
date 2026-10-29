"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  adminVoucherService,
  SaveVoucherRequest,
  VoucherItem,
  DiscountType,
} from "@/src/services/admin/adminVoucherService";
import { showToast } from "@/src/utils/toast";

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucherToEdit?: VoucherItem | null;
}

export default function VoucherModal({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
}: VoucherModalProps) {
  const isEdit = Boolean(voucherToEdit);

  const [formData, setFormData] = useState<SaveVoucherRequest>({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENT",
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderAmount: 0,
    startDate: "",
    endDate: "",
    usageLimit: undefined,
    userLimit: 1,
    isActive: true,
    conditions: {
      isFirstOrder: false,
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (voucherToEdit) {
      setFormData({
        code: voucherToEdit.code,
        title: voucherToEdit.title,
        description: voucherToEdit.description || "",
        discountType: voucherToEdit.discountType,
        discountValue: voucherToEdit.discountValue,
        maxDiscountAmount: voucherToEdit.maxDiscountAmount,
        minOrderAmount: voucherToEdit.minOrderAmount || 0,
        startDate: voucherToEdit.startDate
          ? new Date(voucherToEdit.startDate).toISOString().slice(0, 16)
          : "",
        endDate: voucherToEdit.endDate
          ? new Date(voucherToEdit.endDate).toISOString().slice(0, 16)
          : "",
        usageLimit: voucherToEdit.usageLimit,
        userLimit: voucherToEdit.userLimit || 1,
        isActive: voucherToEdit.isActive,
        conditions: {
          isFirstOrder: voucherToEdit.conditions?.isFirstOrder || false,
        },
      });
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        discountType: "PERCENT",
        discountValue: 0,
        maxDiscountAmount: undefined,
        minOrderAmount: 0,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        usageLimit: undefined,
        userLimit: 1,
        isActive: true,
        conditions: {
          isFirstOrder: false,
        },
      });
    }
  }, [voucherToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: SaveVoucherRequest = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? Number(formData.minOrderAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit
          ? Number(formData.usageLimit)
          : undefined,
        userLimit: formData.userLimit ? Number(formData.userLimit) : undefined,
      };

      if (isEdit && voucherToEdit) {
        const res = await adminVoucherService.updateVoucher(
          voucherToEdit.id,
          payload,
        );
        if (res.status === "success" || res.data) {
          showToast.success("Cập nhật Voucher thành công!");
          onSuccess();
          onClose();
        }
      } else {
        const res = await adminVoucherService.createVoucher(payload);
        if (res.status === "success" || res.data) {
          showToast.success("Tạo mới Voucher thành công!");
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu Voucher:", error);
      showToast.error("Không thể lưu Voucher. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {isEdit ? "Cập nhật Voucher" : "Thêm mới Voucher"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="VD: KHUYENMAI50K"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên chương trình <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Giảm 50K cho đơn hàng từ 200K"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập điều kiện hoặc mô tả ngắn gọn về ưu đãi..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại giảm giá
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as DiscountType,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="PERCENT">Theo phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (đ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.discountValue || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giảm tối đa (đ)
              </label>
              <input
                type="number"
                min={0}
                disabled={formData.discountType === "FIXED"}
                value={formData.maxDiscountAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscountAmount: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder={
                  formData.discountType === "FIXED"
                    ? "Không áp dụng"
                    : "Không giới hạn"
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá trị đơn hàng tối thiểu (đ)
              </label>
              <input
                type="number"
                min={0}
                value={formData.minOrderAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderAmount: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tổng lượt dùng
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Vô hạn"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lượt/Khách hàng
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.userLimit || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userLimit: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.conditions?.isFirstOrder || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      isFirstOrder: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">
                Chỉ dành cho đơn hàng đầu tiên
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">
                Kích hoạt ngay
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading
                ? "Đang xử lý..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
