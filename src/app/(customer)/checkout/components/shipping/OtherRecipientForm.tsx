"use client";

import React from "react";

export interface OtherRecipientData {
  recipientName: string;
  recipientPhone: string;
  city: string;
  district: string;
  ward: string;
  line: string;
}

interface OtherRecipientFormProps {
  formData: OtherRecipientData;
  onChangeFormData: (data: OtherRecipientData) => void;
}

export default function OtherRecipientForm({
  formData,
  onChangeFormData,
}: OtherRecipientFormProps) {
  const handleChange = (field: keyof OtherRecipientData, value: string) => {
    onChangeFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200/80 space-y-3.5">
      <h3 className="text-xs font-bold text-slate-800">
        Thông tin người nhận hàng mới
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Tên người nhận <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => handleChange("recipientName", e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Số điện thoại người nhận <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.recipientPhone}
            onChange={(e) => handleChange("recipientPhone", e.target.value)}
            placeholder="Ví dụ: 0987654321"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Tỉnh / Thành phố <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Ví dụ: Thành phố Hà Nội"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Quận / Huyện <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => handleChange("district", e.target.value)}
            placeholder="Ví dụ: Quận Cầu Giấy"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Phường / Xã <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.ward}
            onChange={(e) => handleChange("ward", e.target.value)}
            placeholder="Ví dụ: Phường Dịch Vọng"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          Địa chỉ chi tiết (Số nhà, tên đường...){" "}
          <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.line}
          onChange={(e) => handleChange("line", e.target.value)}
          placeholder="Ví dụ: Số 10 Nguyễn Trãi"
          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition"
        />
      </div>
    </div>
  );
}
