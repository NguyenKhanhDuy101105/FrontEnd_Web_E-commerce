"use client";

import React from "react";
import {
  XMarkIcon,
  CheckIcon,
  NoSymbolIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { InventoryRequest } from "@/src/services/admin/adminInventoryRequestService";

interface AdminRequestDetailModalProps {
  isOpen: boolean;
  request: InventoryRequest | null;
  isLoading: boolean;
  onClose: () => void;
  onApproveClick: (request: InventoryRequest) => void;
  onRejectClick: (request: InventoryRequest) => void;
  onCloseRequestClick: (request: InventoryRequest) => void;
}

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
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

export default function AdminRequestDetailModal({
  isOpen,
  request,
  isLoading,
  onClose,
  onApproveClick,
  onRejectClick,
  onCloseRequestClick,
}: AdminRequestDetailModalProps) {
  if (!isOpen) return null;

  const badge = request
    ? STATUS_BADGE_MAP[request.status] || {
        label: request.status,
        className: "bg-slate-100 text-slate-700 border-slate-200",
      }
    : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Chi tiết yêu cầu nhập hàng
            </h2>
            {badge && (
              <span
                className={`px-2.5 py-0.5 text-[11px] sm:text-xs font-bold rounded-full border ${badge.className}`}
              >
                {badge.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isLoading || !request ? (
            <div className="py-10 text-center text-sm text-slate-400">
              Đang tải thông tin chi tiết...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Mã phiếu</span>
                  <span className="font-mono font-bold text-slate-800 break-all">
                    {request.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Chi nhánh gửi</span>
                  <span className="font-bold text-emerald-700">
                    {request.branchName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Người đề xuất</span>
                  <span className="font-semibold text-slate-800">
                    {request.requestedByName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Thời gian tạo</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(request.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {request.reviewedByName && (
                  <div>
                    <span className="text-slate-400 block">Người xử lý</span>
                    <span className="font-semibold text-slate-800">
                      {request.reviewedByName}
                      {request.reviewedAt
                        ? ` (${new Date(request.reviewedAt).toLocaleString("vi-VN")})`
                        : ""}
                    </span>
                  </div>
                )}
                {request.closedByName && (
                  <div>
                    <span className="text-slate-400 block">
                      Người đóng phiếu
                    </span>
                    <span className="font-semibold text-slate-800">
                      {request.closedByName}
                      {request.closedAt
                        ? ` (${new Date(request.closedAt).toLocaleString("vi-VN")})`
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              {(request.reason || request.adminNote || request.closeNote) && (
                <div className="space-y-2 text-xs">
                  {request.reason && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="font-bold text-slate-700">
                        Lý do chi nhánh:{" "}
                      </span>
                      <span className="text-slate-600">{request.reason}</span>
                    </div>
                  )}
                  {request.adminNote && (
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/70">
                      <span className="font-bold text-blue-800">
                        Ghi chú Admin:{" "}
                      </span>
                      <span className="text-blue-900">{request.adminNote}</span>
                    </div>
                  )}
                  {request.closeNote && (
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70">
                      <span className="font-bold text-amber-800">
                        Lý do đóng phiếu:{" "}
                      </span>
                      <span className="text-amber-900">
                        {request.closeNote}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Sản phẩm</th>
                      <th className="py-2.5 px-3 text-center">ĐVT</th>
                      <th className="py-2.5 px-3 text-right">Đề xuất</th>
                      <th className="py-2.5 px-3 text-right">Được duyệt</th>
                      <th className="py-2.5 px-3 text-right">Đã nhận</th>
                      <th className="py-2.5 px-3 text-right">Còn lại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {request.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            SKU: {item.productSku}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">
                          {item.unit || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {item.requestedQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600">
                          {item.approvedQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                          {item.receivedQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                          {item.remainingQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden space-y-2.5">
                {request.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        SKU: {item.productSku} • ĐVT: {item.unit || "-"}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center text-[11px]">
                      <div className="bg-slate-50 rounded p-1.5">
                        <span className="text-slate-400 block">Đề xuất</span>
                        <strong className="text-slate-800">
                          {item.requestedQuantity}
                        </strong>
                      </div>
                      <div className="bg-blue-50/70 rounded p-1.5">
                        <span className="text-blue-500 block">Duyệt</span>
                        <strong className="text-blue-700">
                          {item.approvedQuantity}
                        </strong>
                      </div>
                      <div className="bg-emerald-50/70 rounded p-1.5">
                        <span className="text-emerald-500 block">Nhận</span>
                        <strong className="text-emerald-700">
                          {item.receivedQuantity}
                        </strong>
                      </div>
                      <div className="bg-amber-50/70 rounded p-1.5">
                        <span className="text-amber-500 block">Còn</span>
                        <strong className="text-amber-700">
                          {item.remainingQuantity}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
          {request && request.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRejectClick(request);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                <NoSymbolIcon className="w-4 h-4" />
                <span>Từ chối</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApproveClick(request);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Phê duyệt</span>
              </button>
            </>
          )}

          {request &&
            (request.status === "APPROVED" ||
              request.status === "PARTIALLY_RECEIVED") && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCloseRequestClick(request);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                <LockClosedIcon className="w-4 h-4" />
                <span>Đóng phiếu</span>
              </button>
            )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
