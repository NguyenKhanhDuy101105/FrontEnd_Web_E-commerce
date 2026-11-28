"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  InventoryRequest,
  ApproveInventoryRequestPayload,
  inventoryRequestService,
} from "@/src/services/admin/adminInventoryRequestService";
import { showToast } from "@/src/utils/toast";

interface ApproveRequestModalProps {
  isOpen: boolean;
  request: InventoryRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveRequestModal({
  isOpen,
  request,
  onClose,
  onSuccess,
}: ApproveRequestModalProps) {
  const [note, setNote] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !request) return;
    setNote("");
    const initialQuantities: Record<string, number> = {};
    request.items.forEach((item) => {
      initialQuantities[item.id] = item.requestedQuantity;
    });
    setQuantities(initialQuantities);
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleQuantityChange = (itemId: string, value: number) => {
    const validValue = Number.isNaN(value) ? 0 : Math.max(0, value);
    setQuantities((prev) => ({
      ...prev,
      [itemId]: validValue,
    }));
  };

  const handleSetAllRequested = () => {
    const resetQuantities: Record<string, number> = {};
    request.items.forEach((item) => {
      resetQuantities[item.id] = item.requestedQuantity;
    });
    setQuantities(resetQuantities);
  };

  const totalApproved = request.items.reduce(
    (sum, item) => sum + (quantities[item.id] ?? 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (totalApproved <= 0) {
      showToast.error("Tổng số lượng duyệt phải lớn hơn 0!");
      return;
    }

    const payload: ApproveInventoryRequestPayload = {
      note: note.trim() || undefined,
      items: request.items.map((item) => ({
        itemId: item.id,
        approvedQuantity: quantities[item.id] ?? 0,
      })),
    };

    try {
      setIsSubmitting(true);
      await inventoryRequestService.approveInventoryRequest(
        request.id,
        payload,
      );
      showToast.success("Đã phê duyệt yêu cầu nhập hàng!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể phê duyệt yêu cầu nhập hàng!";
      showToast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Phê duyệt yêu cầu nhập hàng
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Chi nhánh:{" "}
              <span className="font-semibold text-emerald-700">
                {request.branchName}
              </span>{" "}
              • Phiếu #{request.id.slice(0, 8)}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Người đề xuất</span>
              <span className="font-semibold text-slate-800">
                {request.requestedByName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Thời gian gửi</span>
              <span className="font-semibold text-slate-800">
                {new Date(request.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            {request.reason && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Lý do chi nhánh</span>
                <span className="font-medium text-slate-700">
                  {request.reason}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Điều chỉnh số lượng phê duyệt ({request.items.length} sản phẩm)
              </span>
              <button
                type="button"
                onClick={handleSetAllRequested}
                className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                Duyệt tối đa theo đề xuất
              </button>
            </div>

            <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3.5">Sản phẩm</th>
                    <th className="py-2.5 px-3 text-center">ĐVT</th>
                    <th className="py-2.5 px-3 text-right">Đề xuất</th>
                    <th className="py-2.5 px-3.5 text-right w-36">
                      Số lượng duyệt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {request.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3.5">
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
                      <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                        {item.requestedQuantity}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <input
                          type="number"
                          min={0}
                          value={quantities[item.id] ?? 0}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-24 px-2.5 py-1 text-xs font-bold text-right border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
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
                  className="p-3 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      SKU: {item.productSku} • ĐVT: {item.unit || "-"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Đề xuất:{" "}
                      <strong className="text-slate-800">
                        {item.requestedQuantity}
                      </strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-medium">Duyệt:</span>
                      <input
                        type="number"
                        min={0}
                        value={quantities[item.id] ?? 0}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-20 px-2 py-1 text-xs font-bold text-center border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ghi chú phản hồi cho chi nhánh (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đã duyệt xuất kho tổng, dự kiến giao trong sáng mai..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-slate-500 text-center sm:text-left">
              Tổng số lượng phê duyệt:{" "}
              <strong className="text-emerald-700 text-sm">
                {totalApproved}
              </strong>{" "}
              đơn vị
            </span>

            <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalApproved <= 0}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>{isSubmitting ? "Đang duyệt..." : "Xác nhận duyệt"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
