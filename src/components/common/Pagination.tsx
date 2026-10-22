"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) pages.push("...");

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex items-start justify-end gap-1.5 p-0 m-0">
      <button
        type="button"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-9 h-9 flex items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-none transition-colors cursor-pointer"
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, index) => {
        if (typeof page === "string") {
          return (
            <span
              key={`dots-${index}`}
              className="w-9 h-9 flex items-center justify-center text-slate-400 text-xs font-bold"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
              isActive
                ? "bg-green-900 border-green-900 text-white"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {page + 1}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-9 h-9 flex items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-none transition-colors cursor-pointer"
        aria-label="Trang sau"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
