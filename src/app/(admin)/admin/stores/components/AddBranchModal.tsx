"use client";

import { useState, useEffect, useRef } from "react";
import {
  AdminBranchItem,
  SaveAdminBranchRequest,
} from "@/src/services/admin/adminBranchService";
import { showToast } from "@/src/utils/toast";

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AdminBranchItem | null;
  existingBranches?: AdminBranchItem[];
  onSave: (payload: SaveAdminBranchRequest) => void;
}

const DAYS_OF_WEEK = [
  { key: "mon", label: "Thứ 2" },
  { key: "tue", label: "Thứ 3" },
  { key: "wed", label: "Thứ 4" },
  { key: "thu", label: "Thứ 5" },
  { key: "fri", label: "Thứ 6" },
  { key: "sat", label: "Thứ 7" },
  { key: "sun", label: "Chủ nhật" },
] as const;

const DEFAULT_OPENING_HOURS: Record<string, string> = {
  mon: "07:00 - 22:00",
  tue: "07:00 - 22:00",
  wed: "07:00 - 22:00",
  thu: "07:00 - 22:00",
  fri: "07:00 - 22:00",
  sat: "07:30 - 22:30",
  sun: "07:30 - 22:30",
};

const normalizeCompareText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[.,/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const sanitizeBranchName = (value: string) =>
  value
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/^\s+/, "")
    .slice(0, 150);

const sanitizeBranchAddress = (value: string) =>
  value.replace(/^\s+/, "").slice(0, 255);

const sanitizePhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);

const parseTimeRange = (range?: string): { open: string; close: string } => {
  if (!range) return { open: "07:00", close: "22:00" };
  const parts = range.split("-").map((s) => s.trim());
  return {
    open: parts[0] || "07:00",
    close: parts[1] || "22:00",
  };
};

export default function AddBranchModal({
  isOpen,
  onClose,
  initialData,
  existingBranches = [],
  onSave,
}: AddBranchModalProps) {
  const isNameComposingRef = useRef(false);
  const isAddressComposingRef = useRef(false);

  const [formData, setFormData] = useState<SaveAdminBranchRequest>({
    name: "",
    address: "",
    lat: 21.02851,
    lng: 105.804817,
    phone: "",
    deliveryRadiusKm: 5,
    isWarehouse: false,
    openingHours: { ...DEFAULT_OPENING_HOURS },
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    phone?: string;
    coordinates?: string;
    openingHours?: string;
  }>({});

  useEffect(() => {
    setErrors({});
    if (initialData) {
      const mergedHours: Record<string, string> = { ...DEFAULT_OPENING_HOURS };
      if (initialData.openingHours) {
        for (const day of DAYS_OF_WEEK) {
          if (initialData.openingHours[day.key]) {
            mergedHours[day.key] = initialData.openingHours[day.key];
          }
        }
      }

      setFormData({
        name: initialData.name.slice(0, 150),
        address: initialData.address.slice(0, 255),
        lat: initialData.lat,
        lng: initialData.lng,
        phone: sanitizePhone(initialData.phone),
        deliveryRadiusKm: initialData.deliveryRadiusKm,
        isWarehouse: initialData.isWarehouse,
        openingHours: mergedHours,
        status: initialData.status,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        lat: 21.02851,
        lng: 105.804817,
        phone: "",
        deliveryRadiusKm: 5,
        isWarehouse: false,
        openingHours: { ...DEFAULT_OPENING_HOURS },
        status: "ACTIVE",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleDayTimeChange = (
    dayKey: string,
    field: "open" | "close",
    value: string,
  ) => {
    const currentRange = formData.openingHours?.[dayKey] || "07:00 - 22:00";
    const parsed = parseTimeRange(currentRange);
    const updated = {
      ...parsed,
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...(prev.openingHours || {}),
        [dayKey]: `${updated.open} - ${updated.close}`,
      },
    }));

    if (errors.openingHours) {
      setErrors((prev) => ({ ...prev, openingHours: undefined }));
    }
  };

  const handleApplyMondayToAll = () => {
    const mondayHours = formData.openingHours?.mon || "07:00 - 22:00";
    const updatedAll: Record<string, string> = {};
    for (const day of DAYS_OF_WEEK) {
      updatedAll[day.key] = mondayHours;
    }
    setFormData((prev) => ({
      ...prev,
      openingHours: updatedAll,
    }));
    showToast.success("Đã áp dụng khung giờ Thứ 2 cho cả tuần!");
  };

  const validateForm = (dataToCheck: SaveAdminBranchRequest): boolean => {
    const newErrors: {
      name?: string;
      address?: string;
      phone?: string;
      coordinates?: string;
      openingHours?: string;
    } = {};

    const normalizedName = normalizeCompareText(dataToCheck.name);
    const normalizedAddress = normalizeCompareText(dataToCheck.address);
    const currentLat = Number(dataToCheck.lat);
    const currentLng = Number(dataToCheck.lng);

    if (!/^\d{10}$/.test(dataToCheck.phone)) {
      newErrors.phone = "Số điện thoại phải gồm đúng 10 chữ số.";
    }

    if (dataToCheck.openingHours) {
      for (const day of DAYS_OF_WEEK) {
        const { open, close } = parseTimeRange(
          dataToCheck.openingHours[day.key],
        );
        if (open >= close) {
          newErrors.openingHours = `Giờ đóng cửa của ${day.label} phải sau giờ mở cửa.`;
          break;
        }
      }
    }

    const otherBranches = existingBranches.filter(
      (b) => !initialData || b.id !== initialData.id,
    );

    const duplicateNameBranch = otherBranches.find(
      (b) => normalizeCompareText(b.name) === normalizedName,
    );
    if (duplicateNameBranch) {
      newErrors.name = `Tên chi nhánh "${dataToCheck.name}" đã tồn tại trong hệ thống.`;
    }

    const duplicateAddressBranch = otherBranches.find(
      (b) => normalizeCompareText(b.address) === normalizedAddress,
    );
    if (duplicateAddressBranch) {
      newErrors.address = `Địa chỉ này đã trùng với chi nhánh "${duplicateAddressBranch.name}".`;
    }

    const duplicateCoordBranch = otherBranches.find(
      (b) =>
        Math.abs(Number(b.lat) - currentLat) < 1e-6 &&
        Math.abs(Number(b.lng) - currentLng) < 1e-6,
    );
    if (duplicateCoordBranch) {
      newErrors.coordinates = `Tọa độ (${currentLat}, ${currentLng}) trùng với chi nhánh "${duplicateCoordBranch.name}".`;
    }

    setErrors(newErrors);

    const firstError =
      newErrors.name ||
      newErrors.address ||
      newErrors.phone ||
      newErrors.coordinates ||
      newErrors.openingHours;
    if (firstError) {
      showToast.error(firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedPayload: SaveAdminBranchRequest = {
      ...formData,
      name: sanitizeBranchName(formData.name).trim().replace(/\s+/g, " "),
      address: sanitizeBranchAddress(formData.address)
        .trim()
        .replace(/\s+/g, " "),
      phone: sanitizePhone(formData.phone),
    };

    setFormData(cleanedPayload);

    if (!cleanedPayload.name) {
      setErrors((prev) => ({
        ...prev,
        name: "Tên chi nhánh không hợp lệ hoặc chỉ chứa ký tự đặc biệt.",
      }));
      return;
    }

    if (!cleanedPayload.address) {
      setErrors((prev) => ({
        ...prev,
        address: "Vui lòng nhập địa chỉ chi tiết.",
      }));
      return;
    }

    if (!validateForm(cleanedPayload)) {
      return;
    }

    onSave(cleanedPayload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full p-5 space-y-4 shadow-xl border border-slate-200 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-900 text-sm">
            {initialData ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Tên chi nhánh *
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.name.length}/150
              </span>
            </div>
            <input
              type="text"
              maxLength={150}
              required
              value={formData.name}
              onCompositionStart={() => {
                isNameComposingRef.current = true;
              }}
              onCompositionEnd={(e) => {
                isNameComposingRef.current = false;
                const sanitized = sanitizeBranchName(e.currentTarget.value);
                setFormData((prev) => ({ ...prev, name: sanitized }));
              }}
              onChange={(e) => {
                const rawValue = e.target.value;
                const nextValue = isNameComposingRef.current
                  ? rawValue.slice(0, 150)
                  : sanitizeBranchName(rawValue);
                setFormData({ ...formData, name: nextValue });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              onBlur={() => {
                setFormData((prev) => ({
                  ...prev,
                  name: sanitizeBranchName(prev.name)
                    .trim()
                    .replace(/\s+/g, " "),
                }));
              }}
              className={`w-full p-2 border rounded-lg focus:outline-emerald-600 ${
                errors.name
                  ? "border-rose-500 bg-rose-50/30"
                  : "border-slate-200"
              }`}
              placeholder="VD: UrbanMart Cầu Giấy"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Địa chỉ chi tiết *
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.address.length}/255
              </span>
            </div>
            <input
              type="text"
              maxLength={255}
              required
              value={formData.address}
              onCompositionStart={() => {
                isAddressComposingRef.current = true;
              }}
              onCompositionEnd={(e) => {
                isAddressComposingRef.current = false;
                const sanitized = sanitizeBranchAddress(e.currentTarget.value);
                setFormData((prev) => ({ ...prev, address: sanitized }));
              }}
              onChange={(e) => {
                const rawValue = e.target.value;
                const nextValue = isAddressComposingRef.current
                  ? rawValue.slice(0, 255)
                  : sanitizeBranchAddress(rawValue);
                setFormData({ ...formData, address: nextValue });
                if (errors.address)
                  setErrors({ ...errors, address: undefined });
              }}
              onBlur={() => {
                setFormData((prev) => ({
                  ...prev,
                  address: sanitizeBranchAddress(prev.address)
                    .trim()
                    .replace(/\s+/g, " "),
                }));
              }}
              className={`w-full p-2 border rounded-lg focus:outline-emerald-600 ${
                errors.address
                  ? "border-rose-500 bg-rose-50/30"
                  : "border-slate-200"
              }`}
              placeholder="VD: 122 Đường Cầu Giấy, P. Quan Hoa, Cầu Giấy"
            />
            {errors.address && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Số điện thoại *
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.phone.length}/10
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={formData.phone}
                onChange={(e) => {
                  const digitsOnly = sanitizePhone(e.target.value);
                  setFormData({ ...formData, phone: digitsOnly });
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                className={`w-full p-2 border rounded-lg focus:outline-emerald-600 ${
                  errors.phone
                    ? "border-rose-500 bg-rose-50/30"
                    : "border-slate-200"
                }`}
                placeholder="0243833999"
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Bán kính giao hàng (km)
                </label>
                <span className="text-[11px] text-slate-400">Tối đa 40km</span>
              </div>
              <input
                type="number"
                min="0"
                max="40"
                step="1"
                value={
                  formData.deliveryRadiusKm === 0
                    ? ""
                    : formData.deliveryRadiusKm
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setFormData({ ...formData, deliveryRadiusKm: 0 });
                  } else {
                    const num = Math.min(
                      40,
                      Math.max(0, parseInt(val, 10) || 0),
                    );
                    setFormData({ ...formData, deliveryRadiusKm: num });
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "+" ||
                    e.key === "." ||
                    e.key === "," ||
                    e.key === "e" ||
                    e.key === "E"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) => {
                    setFormData({ ...formData, lat: Number(e.target.value) });
                    if (errors.coordinates)
                      setErrors({ ...errors, coordinates: undefined });
                  }}
                  className={`w-full p-2 border rounded-lg focus:outline-emerald-600 ${
                    errors.coordinates
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200"
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) => {
                    setFormData({ ...formData, lng: Number(e.target.value) });
                    if (errors.coordinates)
                      setErrors({ ...errors, coordinates: undefined });
                  }}
                  className={`w-full p-2 border rounded-lg focus:outline-emerald-600 ${
                    errors.coordinates
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200"
                  }`}
                />
              </div>
            </div>
            {errors.coordinates && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.coordinates}
              </p>
            )}
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Giờ hoạt động
              </label>
              <button
                type="button"
                onClick={handleApplyMondayToAll}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
              >
                Áp dụng Thứ 2 cho cả tuần
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const { open, close } = parseTimeRange(
                  formData.openingHours?.[day.key],
                );
                return (
                  <div
                    key={day.key}
                    className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-md border border-slate-200"
                  >
                    <span className="font-medium text-slate-700 w-16 shrink-0">
                      {day.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        value={open}
                        onChange={(e) =>
                          handleDayTimeChange(day.key, "open", e.target.value)
                        }
                        className="text-[11px] px-1.5 py-1 border border-slate-200 rounded focus:outline-emerald-600"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={close}
                        onChange={(e) =>
                          handleDayTimeChange(day.key, "close", e.target.value)
                        }
                        className="text-[11px] px-1.5 py-1 border border-slate-200 rounded focus:outline-emerald-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.openingHours && (
              <p className="text-[11px] text-rose-600 font-medium">
                {errors.openingHours}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600 cursor-pointer"
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="MAINTENANCE">Đang bảo trì / Kiểm kê</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isWarehouse}
                  onChange={(e) =>
                    setFormData({ ...formData, isWarehouse: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span>Đặt làm Kho tổng</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              {initialData ? "Cập nhật" : "Tạo chi nhánh"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
