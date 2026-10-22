"use client";

import React from "react";
import { ClockIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface DeliveryTimeSelectorProps {
  deliveryDate: string;
  selectedTimeSlot: string;
  onChangeDate: (date: string) => void;
  onChangeTimeSlot: (slot: string) => void;
}

const TIME_SLOTS = [
  { id: "08-10", label: "08:00 - 10:00", startHour: 8, endHour: 10 },
  { id: "10-12", label: "10:00 - 12:00", startHour: 10, endHour: 12 },
  { id: "12-14", label: "12:00 - 14:00", startHour: 12, endHour: 14 },
  { id: "14-16", label: "14:00 - 16:00", startHour: 14, endHour: 16 },
  { id: "16-18", label: "16:00 - 18:00", startHour: 16, endHour: 18 },
  { id: "18-20", label: "18:00 - 20:00", startHour: 18, endHour: 20 },
];

export default function DeliveryTimeSelector({
  deliveryDate,
  selectedTimeSlot,
  onChangeDate,
  onChangeTimeSlot,
}: DeliveryTimeSelectorProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = deliveryDate === todayStr;
  const currentHour = new Date().getHours();

  return (
    <div className="space-y-4">
      {/* 1. Chọn ngày nhận */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          Chọn ngày lấy hàng tại chi nhánh
        </label>
        <input
          type="date"
          min={todayStr}
          value={deliveryDate}
          onChange={(e) => onChangeDate(e.target.value)}
          className="w-full sm:w-64 p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium text-slate-800 cursor-pointer"
        />
      </div>

      {/* 2. Chọn khung giờ */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ClockIcon className="w-4 h-4 text-emerald-600" />
          Chọn khung giờ nhận (Cần trước ít nhất 1 giờ)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TIME_SLOTS.map((slot) => {
            const isDisabled = isToday && slot.startHour <= currentHour + 1;
            const isSelected = selectedTimeSlot === slot.id;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isDisabled}
                onClick={() => onChangeTimeSlot(slot.id)}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  isDisabled
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through"
                    : isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
