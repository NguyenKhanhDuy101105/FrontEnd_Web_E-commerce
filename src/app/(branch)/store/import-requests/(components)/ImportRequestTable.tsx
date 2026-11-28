"use client";

import React from "react";
import {
  EyeIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { InventoryRequest } from "@/src/services/store/branchInventoryService";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PARTIALLY_APPROVED: {
    label: "Duyệt một phần",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  PARTIALLY_RECEIVED: {
    label: "Nhận một phần",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CLOSED: {
    label: "Đã đóng",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

const RECEIVABLE_STATUSES = [
  "APPROVED",
  "PARTIALLY_APPROVED",
  "PARTIALLY_RECEIVED",
];

interface ImportRequestTableProps {
  requests: InventoryRequest[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onViewDetail: (request: InventoryRequest) => void;
  onOpenReceive: (request: InventoryRequest) => void;
  onCancelRequest: (requestId: string) => void;
}

export default function ImportRequestTable({
  requests,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onViewDetail,
  onOpenReceive,
  onCancelRequest,
}: ImportRequestTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 md:h-12 bg-slate-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
          <ClipboardDocumentListIcon className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Chưa có phiếu yêu cầu nhập hàng nào
          </p>
          <p className="text-xs max-w-xs mx-auto">
            Nhấn &ldquo;Tạo yêu cầu nhập hàng&rdquo; để gửi đề xuất bổ sung kho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* 1. MOBILE VIEW (< md): Dạng Card List dễ đọc và bấm thao tác */}
      <div className="md:hidden divide-y divide-slate-100">
        {requests.map((req) => {
          const badge = STATUS_BADGE[req.status] || {
            label: req.status,
            className: "bg-slate-100 text-slate-700 border-slate-200",
          };
          const totalRequestedQty = req.items.reduce(
            (sum, i) => sum + i.requestedQuantity,
            0,
          );
          const canReceive = RECEIVABLE_STATUSES.includes(req.status);

          return (
            <div key={req.id} className="p-4 space-y-3 hover:bg-slate-50/50">
              {/* Hàng trên: Mã phiếu & Trạng thái */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                  #{req.id.slice(0, 8)}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Thông tin chi tiết dạng lưới 2 cột */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-700">
                    {req.requestedByName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  <CubeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">
                      {req.items.length} SP
                    </strong>{" "}
                    ({totalRequestedQty} đv)
                  </span>
                </div>

                <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDate(req.createdAt)}</span>
                </div>
              </div>

              {/* Lý do (nếu có) */}
              {req.reason && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg line-clamp-2 border border-slate-100">
                  <span className="font-semibold text-slate-600">Lý do:</span>{" "}
                  {req.reason}
                </p>
              )}

              {/* Thanh nút thao tác */}
              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onViewDetail(req)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>

                {canReceive && (
                  <button
                    type="button"
                    onClick={() => onOpenReceive(req)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <span>Nhận hàng</span>
                  </button>
                )}

                {req.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => onCancelRequest(req.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition cursor-pointer"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. TABLET & DESKTOP VIEW (>= md): Bảng dữ liệu co giãn linh hoạt */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs lg:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs">
              <th className="py-3.5 px-3 lg:px-4 whitespace-nowrap">
                Mã phiếu
              </th>
              <th className="py-3.5 px-3 lg:px-4">Người đề xuất</th>
              <th className="py-3.5 px-3 lg:px-4 whitespace-nowrap">
                Số mặt hàng
              </th>
              {/* Ẩn cột Lý do trên Tablet (md) để tránh tràn ngang, hiện đầy đủ ở Desktop (lg) */}
              <th className="hidden lg:table-cell py-3.5 px-4">Lý do</th>
              <th className="py-3.5 px-3 lg:px-4 whitespace-nowrap">
                Ngày tạo
              </th>
              <th className="py-3.5 px-3 lg:px-4 whitespace-nowrap">
                Trạng thái
              </th>
              <th className="py-3.5 px-3 lg:px-4 text-right whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => {
              const badge = STATUS_BADGE[req.status] || {
                label: req.status,
                className: "bg-slate-100 text-slate-700 border-slate-200",
              };
              const totalRequestedQty = req.items.reduce(
                (sum, i) => sum + i.requestedQuantity,
                0,
              );
              const canReceive = RECEIVABLE_STATUSES.includes(req.status);

              return (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-3 lg:px-4 font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                    #{req.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-3 lg:px-4 font-medium text-slate-700 max-w-36 lg:max-w-48 truncate">
                    {req.requestedByName}
                  </td>
                  <td className="py-3.5 px-3 lg:px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-800">
                      {req.items.length} SP
                    </span>{" "}
                    <span className="text-xs text-slate-400">
                      ({totalRequestedQty} đv)
                    </span>
                  </td>
                  <td
                    title={req.reason || ""}
                    className="hidden lg:table-cell py-3.5 px-4 max-w-xs truncate text-slate-600"
                  >
                    {req.reason || "-"}
                  </td>
                  <td className="py-3.5 px-3 lg:px-4 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="py-3.5 px-3 lg:px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 lg:px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(req)}
                        title="Xem chi tiết"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      {canReceive && (
                        <button
                          type="button"
                          onClick={() => onOpenReceive(req)}
                          title="Xác nhận nhận hàng & tạo lô kho"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer"
                        >
                          <span>Nhận hàng</span>
                        </button>
                      )}

                      {req.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => onCancelRequest(req.id)}
                          title="Hủy yêu cầu"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. THANH PHÂN TRANG RESPONSIVE */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
          <span>
            Trang <strong className="text-slate-900">{page + 1}</strong> /{" "}
            {totalPages}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-medium cursor-pointer"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-medium cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
