"use client";

import { useState } from "react";
import { XMarkIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
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

const VOUCHER_CODE_REGEX = /^[A-Z0-9_]+$/;
const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 20;

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDateStr = (): string => {
  return formatLocalDate(new Date());
};

const formatLocalDateTime = (date: Date): string => {
  const datePart = formatLocalDate(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart}T${hours}:${minutes}`;
};

const getNowDateTimeStr = (): string => {
  return formatLocalDateTime(new Date());
};

const getFutureDateTimeStr = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return formatLocalDateTime(date);
};

const parseIsoToLocalDateTimeStr = (isoString?: string): string => {
  if (!isoString) return "";
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "";
  return formatLocalDateTime(parsed);
};

interface VoucherFormState {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  minOrderAmount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  userLimit: string;
  isActive: boolean;
  isFirstOrder: boolean;
}

const buildInitialFormState = (
  voucher?: VoucherItem | null,
): VoucherFormState => {
  if (voucher) {
    return {
      code: voucher.code || "",
      title: voucher.title || "",
      description: voucher.description || "",
      discountType: voucher.discountType || "PERCENT",
      discountValue:
        voucher.discountValue !== undefined && voucher.discountValue !== null
          ? String(voucher.discountValue)
          : "",
      maxDiscountAmount:
        voucher.maxDiscountAmount !== undefined &&
        voucher.maxDiscountAmount !== null
          ? String(voucher.maxDiscountAmount)
          : "",
      minOrderAmount:
        voucher.minOrderAmount !== undefined && voucher.minOrderAmount !== null
          ? String(voucher.minOrderAmount)
          : "",
      startDate:
        parseIsoToLocalDateTimeStr(voucher.startDate) || getNowDateTimeStr(),
      endDate:
        parseIsoToLocalDateTimeStr(voucher.endDate) || getFutureDateTimeStr(7),
      usageLimit:
        voucher.usageLimit !== undefined && voucher.usageLimit !== null
          ? String(voucher.usageLimit)
          : "",
      userLimit:
        voucher.userLimit !== undefined && voucher.userLimit !== null
          ? String(voucher.userLimit)
          : "1",
      isActive: Boolean(voucher.isActive),
      isFirstOrder: Boolean(voucher.conditions?.isFirstOrder),
    };
  }

  return {
    code: "",
    title: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    startDate: getNowDateTimeStr(),
    endDate: getFutureDateTimeStr(7),
    usageLimit: "",
    userLimit: "1",
    isActive: true,
    isFirstOrder: false,
  };
};

interface FormErrors {
  code?: string;
  title?: string;
  discountValue?: string;
  maxDiscountAmount?: string;
  minOrderAmount?: string;
  usageLimit?: string;
  userLimit?: string;
  startDate?: string;
  endDate?: string;
}

export default function VoucherModal({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
}: VoucherModalProps) {
  const isEdit = Boolean(voucherToEdit);
  const todayDateStr = getTodayDateStr();
  const todayMinDateTime = `${todayDateStr}T00:00`;

  const [formData, setFormData] = useState<VoucherFormState>(() =>
    buildInitialFormState(voucherToEdit),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [prevModalKey, setPrevModalKey] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const currentModalKey = `${isOpen}-${voucherToEdit?.id || "create"}`;
  if (currentModalKey !== prevModalKey) {
    setPrevModalKey(currentModalKey);
    if (isOpen) {
      setFormData(buildInitialFormState(voucherToEdit));
      setErrors({});
    }
  }

  if (!isOpen) return null;

  const validateForm = (data: VoucherFormState): FormErrors => {
    const nextErrors: FormErrors = {};
    const upperCode = data.code.toUpperCase();
    const trimmedTitle = data.title.trim();
    const currentToday = getTodayDateStr();

    if (!upperCode.trim()) {
      nextErrors.code = "Vui lòng nhập mã Voucher";
    } else if (!VOUCHER_CODE_REGEX.test(upperCode)) {
      nextErrors.code = "Mã voucher chỉ gồm chữ, số, gạch dưới";
    } else if (
      upperCode.length < MIN_CODE_LENGTH ||
      upperCode.length > MAX_CODE_LENGTH
    ) {
      nextErrors.code = "Mã voucher từ 4 đến 20 ký tự";
    }

    if (!trimmedTitle) {
      nextErrors.title = "Vui lòng nhập tên chương trình";
    }

    const discountVal = Number(data.discountValue);
    const minOrderVal =
      data.minOrderAmount.trim() === "" ? 0 : Number(data.minOrderAmount);

    if (
      data.discountValue.trim() === "" ||
      Number.isNaN(discountVal) ||
      discountVal <= 0
    ) {
      nextErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    } else if (data.discountType === "PERCENT" && discountVal > 100) {
      nextErrors.discountValue =
        "Giá trị giảm theo phần trăm không được vượt quá 100%";
    } else if (data.discountType === "FIXED" && discountVal > minOrderVal) {
      nextErrors.discountValue =
        "Giá trị giảm không được lớn hơn giá trị đơn hàng tối thiểu";
    }

    if (
      data.minOrderAmount.trim() !== "" &&
      (Number.isNaN(minOrderVal) || minOrderVal < 0)
    ) {
      nextErrors.minOrderAmount =
        "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0";
    }

    if (
      data.discountType === "PERCENT" &&
      data.maxDiscountAmount.trim() !== ""
    ) {
      const maxDiscountVal = Number(data.maxDiscountAmount);
      if (Number.isNaN(maxDiscountVal) || maxDiscountVal <= 0) {
        nextErrors.maxDiscountAmount = "Giảm tối đa phải lớn hơn 0";
      }
    }

    if (data.usageLimit.trim() !== "") {
      const usageLimitVal = Number(data.usageLimit);
      if (!Number.isInteger(usageLimitVal) || usageLimitVal < 1) {
        nextErrors.usageLimit =
          "Tổng lượt dùng phải là số nguyên lớn hơn hoặc bằng 1";
      }
    }

    if (data.userLimit.trim() !== "") {
      const userLimitVal = Number(data.userLimit);
      if (!Number.isInteger(userLimitVal) || userLimitVal < 1) {
        nextErrors.userLimit =
          "Lượt/Khách hàng phải là số nguyên lớn hơn hoặc bằng 1";
      }
    }

    const startDay = data.startDate.slice(0, 10);
    const endDay = data.endDate.slice(0, 10);

    if (!data.startDate) {
      nextErrors.startDate = "Vui lòng chọn thời gian bắt đầu";
    } else if (!isEdit && startDay < currentToday) {
      nextErrors.startDate = "Thời gian bắt đầu không được chọn trong quá khứ";
    }

    if (!data.endDate) {
      nextErrors.endDate = "Vui lòng chọn thời gian kết thúc";
    } else if (endDay < currentToday) {
      nextErrors.endDate = "Thời gian kết thúc không được chọn trong quá khứ";
    } else if (data.startDate && data.endDate < data.startDate) {
      nextErrors.endDate =
        "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu";
    }

    return nextErrors;
  };

  const handleStartDateChange = (newStartDate: string) => {
    setFormData((prev) => ({
      ...prev,
      startDate: newStartDate,
      endDate:
        prev.endDate && newStartDate && prev.endDate < newStartDate
          ? newStartDate
          : prev.endDate,
    }));
    setErrors((prev) => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    const firstError = Object.values(validationErrors).find(Boolean);
    if (firstError) {
      showToast.error(firstError);
      return;
    }

    const normalizedCode = formData.code.toUpperCase();
    const trimmedTitle = formData.title.trim();
    const parsedMinOrder =
      formData.minOrderAmount.trim() === ""
        ? 0
        : Number(formData.minOrderAmount);
    const parsedMaxDiscount =
      formData.discountType === "PERCENT" &&
      formData.maxDiscountAmount.trim() !== ""
        ? Number(formData.maxDiscountAmount)
        : undefined;
    const parsedUsageLimit =
      formData.usageLimit.trim() !== ""
        ? Number(formData.usageLimit)
        : undefined;
    const parsedUserLimit =
      formData.userLimit.trim() !== "" ? Number(formData.userLimit) : 1;

    setLoading(true);

    try {
      const startLocal = new Date(formData.startDate);
      const endLocal = new Date(formData.endDate);

      const payload: SaveVoucherRequest = {
        code: normalizedCode,
        title: trimmedTitle,
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: parsedMaxDiscount ?? undefined,
        minOrderAmount: parsedMinOrder,
        startDate: startLocal.toISOString(),
        endDate: endLocal.toISOString(),
        usageLimit: parsedUsageLimit ?? undefined,
        userLimit: parsedUserLimit,
        isActive: formData.isActive,
        conditions: {
          isFirstOrder: formData.isFirstOrder,
        },
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

  const endDateMin =
    formData.startDate && formData.startDate > todayMinDateTime
      ? formData.startDate
      : todayMinDateTime;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {isEdit ? "Cập nhật Voucher" : "Thêm mới Voucher"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  const nextCode = e.target.value.toUpperCase();
                  setFormData({ ...formData, code: nextCode });
                  if (errors.code) {
                    setErrors((prev) => ({ ...prev, code: undefined }));
                  }
                }}
                placeholder="VD: KHUYENMAI50K"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 outline-none uppercase font-mono font-bold ${
                  errors.code
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
              />
              {errors.code && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.code}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên chương trình <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="VD: Giảm 50K cho đơn hàng từ 200K"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                  errors.title
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
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
                onChange={(e) => {
                  const nextType = e.target.value as DiscountType;
                  setFormData({
                    ...formData,
                    discountType: nextType,
                    maxDiscountAmount:
                      nextType === "FIXED" ? "" : formData.maxDiscountAmount,
                  });
                  setErrors((prev) => ({
                    ...prev,
                    discountValue: undefined,
                    maxDiscountAmount: undefined,
                  }));
                }}
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
                min={1}
                max={formData.discountType === "PERCENT" ? 100 : undefined}
                value={formData.discountValue}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    discountValue: e.target.value,
                  });
                  if (errors.discountValue) {
                    setErrors((prev) => ({
                      ...prev,
                      discountValue: undefined,
                    }));
                  }
                }}
                placeholder="0"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                  errors.discountValue
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {errors.discountValue && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.discountValue}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giảm tối đa (đ)
              </label>
              <input
                type="number"
                min={1}
                disabled={formData.discountType === "FIXED"}
                value={formData.maxDiscountAmount}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    maxDiscountAmount: e.target.value,
                  });
                  if (errors.maxDiscountAmount) {
                    setErrors((prev) => ({
                      ...prev,
                      maxDiscountAmount: undefined,
                    }));
                  }
                }}
                placeholder={
                  formData.discountType === "FIXED"
                    ? "Không áp dụng"
                    : "Không giới hạn"
                }
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none disabled:bg-slate-100 ${
                  errors.maxDiscountAmount
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {errors.maxDiscountAmount && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.maxDiscountAmount}</span>
                </p>
              )}
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
                value={formData.minOrderAmount}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    minOrderAmount: e.target.value,
                  });
                  if (errors.minOrderAmount || errors.discountValue) {
                    setErrors((prev) => ({
                      ...prev,
                      minOrderAmount: undefined,
                      discountValue: undefined,
                    }));
                  }
                }}
                placeholder="0"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                  errors.minOrderAmount
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {errors.minOrderAmount && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.minOrderAmount}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tổng lượt dùng
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.usageLimit}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      usageLimit: e.target.value,
                    });
                    if (errors.usageLimit) {
                      setErrors((prev) => ({ ...prev, usageLimit: undefined }));
                    }
                  }}
                  placeholder="Vô hạn"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                    errors.usageLimit
                      ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {errors.usageLimit && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.usageLimit}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lượt/Khách hàng
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.userLimit}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      userLimit: e.target.value,
                    });
                    if (errors.userLimit) {
                      setErrors((prev) => ({ ...prev, userLimit: undefined }));
                    }
                  }}
                  placeholder="1"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                    errors.userLimit
                      ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {errors.userLimit && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.userLimit}</span>
                  </p>
                )}
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
                min={!isEdit ? todayMinDateTime : undefined}
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                  errors.startDate
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {errors.startDate && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.startDate}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                min={endDateMin}
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  if (errors.endDate) {
                    setErrors((prev) => ({ ...prev, endDate: undefined }));
                  }
                }}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 outline-none ${
                  errors.endDate
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-500/20"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {errors.endDate && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.endDate}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFirstOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isFirstOrder: e.target.checked,
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
