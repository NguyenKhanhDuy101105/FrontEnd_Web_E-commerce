"use client";

import React from "react";
import { CheckIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/solid";

export interface BranchNearby {
  id: string;
  name: string;
  address: string;
  phone?: string;
  distanceKm: number;
}

interface BranchAndNoteSelectorProps {
  branches: BranchNearby[];
  loading?: boolean;
  selectedBranchId: string;
  note: string;
  onSelectBranch: (branch: BranchNearby) => void;
  onChangeNote: (note: string) => void;
}

export default function BranchAndNoteSelector({
  branches,
  loading = false,
  selectedBranchId,
  note,
  onSelectBranch,
  onChangeNote,
}: BranchAndNoteSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Giao từ (Cơ sở gần nhất được chọn mặc định)
        </label>

        {loading ? (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 animate-pulse">
            Đang tính toán khoảng cách các cơ sở...
          </div>
        ) : branches.length === 0 ? (
          <p className="text-xs text-slate-400">Chưa tìm thấy cơ sở phù hợp.</p>
        ) : (
          <div className="max-h-68.75 overflow-y-auto pr-1.5 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-0.5">
              {branches.map((branch) => {
                const isSelected = branch.id === selectedBranchId;

                return (
                  <div
                    key={branch.id}
                    onClick={() => onSelectBranch(branch)}
                    className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer bg-white min-h-27.5 flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "border-emerald-600 bg-white shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-7 h-7 bg-emerald-600 rounded-bl-xl flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white stroke-[2.5]" />
                      </div>
                    )}

                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {branch.name}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {branch.distanceKm.toFixed(1)} km
                        </span>
                      </div>

                      {branch.phone && (
                        <p className="text-[11px] font-medium text-slate-600 flex items-center gap-1 pt-0.5">
                          <PhoneIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{branch.phone}</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-500 flex items-start gap-1 leading-tight pt-0.5">
                        <MapPinIcon className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{branch.address}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5">
          Ghi chú cho đơn hàng
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="Nhập thông tin ghi chú cho nhà bán hàng"
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
        />
      </div>
    </div>
  );
}
