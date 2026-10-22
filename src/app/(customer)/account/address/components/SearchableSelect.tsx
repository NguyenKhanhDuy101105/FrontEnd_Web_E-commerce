"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface OptionItem {
  code?: number | string;
  name: string;
}

interface SearchableSelectProps {
  label?: string;
  options: OptionItem[];
  value: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (val: string) => void;
  error?: string;
}

export default function SearchableSelect({
  label,
  options,
  value,
  placeholder = "-- Chọn --",
  searchPlaceholder = "Gõ từ khóa để tìm nhanh...",
  disabled = false,
  required = false,
  onChange,
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  const handleSelect = (optionName: string) => {
    onChange(optionName);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {required && <span className="text-red-500">* </span>}
          {label}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
            : isOpen
              ? "border-[#0d5c3a] bg-white ring-2 ring-emerald-500/10"
              : "border-slate-200 hover:border-slate-300 text-slate-800"
        }`}
      >
        <span
          className={`truncate ${!value ? "text-slate-400" : "font-medium"}`}
        >
          {value || placeholder}
        </span>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDownIcon
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-slate-100 relative bg-slate-50/50">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-[#0d5c3a] text-slate-800"
            />
          </div>

          <div className="max-h-52 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-2 text-center text-xs text-slate-400">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((item, idx) => (
                <div
                  key={item.code || idx}
                  onClick={() => handleSelect(item.name)}
                  className={`px-3 py-2 text-xs rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                    value === item.name
                      ? "bg-emerald-50 text-[#0d5c3a] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
