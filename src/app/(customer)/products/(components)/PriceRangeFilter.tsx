"use client";

import { useState, useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface Props {
  minPrice: number;
  maxPrice: number;
  maxLimit?: number;
  step?: number;
  onChange: (min: number, max: number) => void;
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  maxLimit = 10000000,
  step = 50000,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, maxPrice - step);
    onChange(Math.max(0, newMin), maxPrice);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, minPrice + step);
    onChange(minPrice, Math.min(maxLimit, newMax));
  };

  const minPercent = (minPrice / maxLimit) * 100;
  const maxPercent = (maxPrice / maxLimit) * 100;

  return (
    <div className="border-b border-slate-100 pb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-bold text-slate-900 mb-3 cursor-pointer"
      >
        <span>Khoảng giá</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={minPrice.toLocaleString("vi-VN")}
                onChange={(e) =>
                  handleMinChange(Number(e.target.value.replace(/\D/g, "")))
                }
                className="w-full text-xs p-2 pr-5 border border-slate-200 rounded-lg focus:border-[#0d5c3a] focus:outline-none font-semibold text-slate-800"
              />
              <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold">
                đ
              </span>
            </div>
            <span className="text-slate-400">-</span>
            <div className="relative flex-1">
              <input
                type="text"
                value={maxPrice.toLocaleString("vi-VN")}
                onChange={(e) =>
                  handleMaxChange(Number(e.target.value.replace(/\D/g, "")))
                }
                className="w-full text-xs p-2 pr-5 border border-slate-200 rounded-lg focus:border-[#0d5c3a] focus:outline-none font-semibold text-slate-800"
              />
              <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold">
                đ
              </span>
            </div>
          </div>

          <div className="relative w-full h-5 flex items-center select-none">
            <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />

            <div
              className="absolute h-1.5 bg-[#0d5c3a] rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            <input
              type="range"
              min={0}
              max={maxLimit}
              step={step}
              value={minPrice}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0d5c3a] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            />

            <input
              type="range"
              min={0}
              max={maxLimit}
              step={step}
              value={maxPrice}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-40 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0d5c3a] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}
