"use client";

import { useState, useEffect } from "react";
import {
  AdminBranchItem,
  SaveAdminBranchRequest,
} from "@/src/services/admin/adminBranchService";

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AdminBranchItem | null;
  onSave: (payload: SaveAdminBranchRequest) => void;
}

export default function AddBranchModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: AddBranchModalProps) {
  const [formData, setFormData] = useState<SaveAdminBranchRequest>({
    name: "",
    address: "",
    lat: 21.02851,
    lng: 105.804817,
    phone: "",
    deliveryRadiusKm: 5,
    isWarehouse: false,
    status: "ACTIVE",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        lat: initialData.lat,
        lng: initialData.lng,
        phone: initialData.phone,
        deliveryRadiusKm: initialData.deliveryRadiusKm,
        isWarehouse: initialData.isWarehouse,
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
        status: "ACTIVE",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-900 text-sm">
            {initialData ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên chi nhánh *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              placeholder="VD: UrbanMart Cầu Giấy"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Địa chỉ chi tiết *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              placeholder="VD: 122 Đường Cầu Giấy, P. Quan Hoa, Cầu Giấy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
                placeholder="024 3833 9999"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bán kính giao hàng (km)
              </label>
              <input
                type="number"
                min="0"
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
                    const num = Math.max(0, parseInt(val, 10) || 0);
                    setFormData({ ...formData, deliveryRadiusKm: num });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vĩ độ (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) =>
                  setFormData({ ...formData, lat: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kinh độ (Longitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) =>
                  setFormData({ ...formData, lng: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
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
