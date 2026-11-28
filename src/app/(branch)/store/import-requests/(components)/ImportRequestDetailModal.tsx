"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { InventoryRequest } from "@/src/services/branch/branchInventoryService";

interface ImportRequestDetailModalProps {
  isOpen: boolean;
  request: InventoryRequest | null;
  isLoading: boolean;
  onClose: () => void;
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

export default function ImportRequestDetailModal({
  isOpen,
  request,
  isLoading,
  onClose,
}: ImportRequestDetailModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Chi tiết phiếu yêu cầu nhập hàng
            </h2>
            {badge && (
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badge.className}`}
              >
                {badge.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading || !request ? (
            <div className="space-y-3 py-8 text-center text-sm text-slate-400">
              Đang tải thông tin chi tiết phiếu yêu cầu...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Mã phiếu</span>
                  <span className="font-mono font-bold text-slate-800">
                    {request.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Chi nhánh</span>
                  <span className="font-bold text-slate-800">
                    {request.branchName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">
                    Người tạo yêu cầu
                  </span>
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
                    <span className="text-slate-400 block">Người duyệt</span>
                    <span className="font-semibold text-slate-800">
                      {request.reviewedByName} (
                      {request.reviewedAt
                        ? new Date(request.reviewedAt).toLocaleString("vi-VN")
                        : ""}
                      )
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
                    </span>
                  </div>
                )}
              </div>

              {(request.reason || request.adminNote || request.closeNote) && (
                <div className="space-y-2 text-xs">
                  {request.reason && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="font-bold text-slate-700">
                        Lý do đề xuất:{" "}
                      </span>
                      <span className="text-slate-600">{request.reason}</span>
                    </div>
                  )}
                  {request.adminNote && (
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/70">
                      <span className="font-bold text-blue-800">
                        Phản hồi từ Admin:{" "}
                      </span>
                      <span className="text-blue-900">{request.adminNote}</span>
                    </div>
                  )}
                  {request.closeNote && (
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70">
                      <span className="font-bold text-amber-800">
                        Ghi chú đóng phiếu:{" "}
                      </span>
                      <span className="text-amber-900">
                        {request.closeNote}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Sản phẩm</th>
                      <th className="py-2.5 px-3 text-center">ĐVT</th>
                      <th className="py-2.5 px-3 text-right">Yêu cầu</th>
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
            </>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
