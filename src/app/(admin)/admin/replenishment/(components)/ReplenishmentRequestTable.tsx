"use client";

import React from "react";
import {
  EyeIcon,
  CheckIcon,
  NoSymbolIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { InventoryRequest } from "@/src/services/admin/adminInventoryRequestService";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PARTIALLY_RECEIVED: {
    label: "Nhận một phần",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
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

interface ReplenishmentRequestTableProps {
  requests: InventoryRequest[];
  isLoading: boolean;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onViewDetail: (request: InventoryRequest) => void;
  onApprove: (request: InventoryRequest) => void;
  onReject: (request: InventoryRequest) => void;
  onCloseRequest: (request: InventoryRequest) => void;
}

export default function ReplenishmentRequestTable({
  requests,
  isLoading,
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onViewDetail,
  onApprove,
  onReject,
  onCloseRequest,
}: ReplenishmentRequestTableProps) {
  const fromIndex = totalElements === 0 ? 0 : page * size + 1;
  const toIndex = Math.min((page + 1) * size, totalElements);

  return (
    <div className="space-y-4">
      <div className="hidden md:flex flex-col bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="h-117 overflow-auto">
          <table className="w-full text-left border-collapse text-xs lg:text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs">
              <tr>
                <th className="h-11 px-4">Mã phiếu</th>
                <th className="h-11 px-4">Chi nhánh</th>
                <th className="h-11 px-4">Người đề xuất</th>
                <th className="h-11 px-4">Số lượng</th>
                <th className="h-11 px-4">Lý do</th>
                <th className="h-11 px-4">Ngày gửi</th>
                <th className="h-11 px-4">Trạng thái</th>
                <th className="h-11 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="h-105 text-center text-slate-400 text-sm"
                  >
                    Đang tải danh sách yêu cầu nhập hàng...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="h-105 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <ClipboardDocumentListIcon className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        Không có yêu cầu nhập hàng nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const badge = STATUS_BADGE[req.status] || {
                    label: req.status,
                    className: "bg-slate-100 text-slate-700 border-slate-200",
                  };
                  const totalRequested = req.items.reduce(
                    (sum, i) => sum + i.requestedQuantity,
                    0,
                  );

                  return (
                    <tr
                      key={req.id}
                      className="h-13 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                        #{req.id.slice(0, 8)}
                      </td>
                      <td className="px-4 font-semibold text-green-700 whitespace-nowrap">
                        {req.branchName}
                      </td>
                      <td className="px-4 text-slate-700 whitespace-nowrap">
                        {req.requestedByName}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">
                          {req.items.length} SP
                        </span>{" "}
                        <span className="text-xs text-slate-400">
                          ({totalRequested} ĐV)
                        </span>
                      </td>
                      <td className="px-4 max-w-48 truncate text-slate-600">
                        {req.reason || "-"}
                      </td>
                      <td className="px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewDetail(req)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>

                          {req.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApprove(req)}
                                title="Phê duyệt"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                              >
                                <CheckIcon className="w-4 h-4 stroke-2" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onReject(req)}
                                title="Từ chối"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <NoSymbolIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {(req.status === "APPROVED" ||
                            req.status === "PARTIALLY_RECEIVED") && (
                            <button
                              type="button"
                              onClick={() => onCloseRequest(req)}
                              title="Đóng phiếu"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <LockClosedIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Hiển thị{" "}
            <strong className="text-slate-900">
              {fromIndex} - {toIndex}
            </strong>{" "}
            trên tổng số{" "}
            <strong className="text-slate-900">{totalElements}</strong> phiếu
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-medium cursor-pointer"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>
            <span className="px-2.5 py-1.5 font-semibold text-slate-800">
              {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-medium cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {isLoading && requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-xs text-slate-400">
            Đang tải danh sách yêu cầu nhập hàng...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-2">
            <ClipboardDocumentListIcon className="w-9 h-9 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-600">
              Không có yêu cầu nhập hàng nào
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const badge = STATUS_BADGE[req.status] || {
              label: req.status,
              className: "bg-slate-100 text-slate-700 border-slate-200",
            };
            const totalRequested = req.items.reduce(
              (sum, i) => sum + i.requestedQuantity,
              0,
            );

            return (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <BuildingStorefrontIcon className="w-4 h-4 shrink-0" />
                      <span>{req.branchName}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      #{req.id.slice(0, 8)} •{" "}
                      {new Date(req.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    Người đề xuất:{" "}
                    <strong className="text-slate-800">
                      {req.requestedByName}
                    </strong>{" "}
                    •{" "}
                    <strong className="text-slate-800">
                      {req.items.length} SP
                    </strong>{" "}
                    ({totalRequested} ĐV)
                  </p>
                  {req.reason && (
                    <p className="text-slate-500 line-clamp-2">
                      Lý do: {req.reason}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onViewDetail(req)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>

                  {req.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onReject(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        <NoSymbolIcon className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Duyệt</span>
                      </button>
                    </>
                  )}

                  {(req.status === "APPROVED" ||
                    req.status === "PARTIALLY_RECEIVED") && (
                    <button
                      type="button"
                      onClick={() => onCloseRequest(req)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <LockClosedIcon className="w-3.5 h-3.5" />
                      <span>Đóng phiếu</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>
              Trang <strong className="text-slate-900">{page + 1}</strong> /{" "}
              {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => onPageChange(Math.max(0, page - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
