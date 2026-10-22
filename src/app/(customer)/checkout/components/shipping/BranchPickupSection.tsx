"use client";

import React, { useState } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import DeliveryTimeSelector from "./DeliveryTimeSelector";
import { BranchNearby } from "./BranchAndNoteSelector";

interface BranchPickupSectionProps {
  branches: BranchNearby[];
  loadingBranch?: boolean;
  onSelectBranchCallback?: (branch: BranchNearby | null) => void;
  note: string;
  onChangeNote: (note: string) => void;
  deliveryDate: string;
  selectedTimeSlot: string;
  onChangeDate: (date: string) => void;
  onChangeTimeSlot: (slot: string) => void;
}

export default function BranchPickupSection({
  branches,
  loadingBranch = false,
  onSelectBranchCallback,
  note,
  onChangeNote,
  deliveryDate,
  selectedTimeSlot,
  onChangeDate,
  onChangeTimeSlot,
}: BranchPickupSectionProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[0]?.id || "",
  );

  const selectedBranch =
    branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleSelect = (branch: BranchNearby) => {
    setSelectedBranchId(branch.id);
    if (onSelectBranchCallback) {
      onSelectBranchCallback(branch);
    }
  };

  const mapAddressQuery = encodeURIComponent(
    selectedBranch
      ? `${selectedBranch.name}, ${selectedBranch.address}`
      : "Hà Nội",
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-bold text-xs sm:text-sm text-slate-800">
          Chọn chi nhánh đến lấy hàng
        </h3>

        {loadingBranch ? (
          <div className="p-4 text-xs text-slate-400">
            Đang tải danh sách chi nhánh...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {branches.map((branch) => {
              const isSelected = branch.id === selectedBranchId;
              return (
                <div
                  key={branch.id}
                  onClick={() => handleSelect(branch)}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 absolute top-2.5 right-2.5" />
                  )}

                  <h4 className="font-bold text-xs text-slate-800 pr-6">
                    {branch.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{branch.address}</span>
                  </p>

                  {branch.phone && (
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{branch.phone}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedBranch && (
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-700">
            Vị trí chi nhánh trên bản đồ:
          </h4>
          <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
            <iframe
              title="Branch Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${mapAddressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>
      )}

      <DeliveryTimeSelector
        deliveryDate={deliveryDate}
        selectedTimeSlot={selectedTimeSlot}
        onChangeDate={onChangeDate}
        onChangeTimeSlot={onChangeTimeSlot}
      />

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          Ghi chú cho đơn hàng
        </label>
        <textarea
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="Ví dụ: Đóng gói cẩn thận giúp tôi..."
          rows={3}
          className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-800"
        />
      </div>
    </div>
  );
}
