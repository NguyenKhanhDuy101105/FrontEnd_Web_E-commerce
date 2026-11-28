"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ArchiveBoxArrowDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import branchInventoryService, {
  InventoryRequest,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";

interface ReceiveImportRequestModalProps {
  isOpen: boolean;
  branchId: string;
  request: InventoryRequest | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReceiveLineInput {
  quantity: string;
  expiryDate: string;
}

function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ReceiveImportRequestModal({
  isOpen,
  branchId,
  request,
  isLoadingDetail = false,
  onClose,
  onSuccess,
}: ReceiveImportRequestModalProps) {
  const [inputs, setInputs] = useState<Record<string, ReceiveLineInput>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const todayStr = getLocalDateString(0);
  const defaultExpiryStr = getLocalDateString(7);

  useEffect(() => {
    if (!request?.items) return;
    const initial: Record<string, ReceiveLineInput> = {};
    const fallbackExpiry = getLocalDateString(7);

    request.items.forEach((item) => {
      const remaining = Math.max(
        0,
        item.remainingQuantity ??
          (item.approvedQuantity || item.requestedQuantity) -
            (item.receivedQuantity || 0),
      );
      initial[item.id] = {
        quantity: remaining > 0 ? String(remaining) : "",
        expiryDate: fallbackExpiry,
      };
    });
    setInputs(initial);
  }, [request]);

  if (!isOpen || !request) return null;

  const receivableItems = request.items.filter((item) => {
    const approved = item.approvedQuantity || item.requestedQuantity;
    const received = item.receivedQuantity || 0;
    return approved - received > 0;
  });

  const handleFillAllRemaining = () => {
    const updated: Record<string, ReceiveLineInput> = {};
    receivableItems.forEach((item) => {
      const approved = item.approvedQuantity || item.requestedQuantity;
      const received = item.receivedQuantity || 0;
      const remaining = Math.max(0, approved - received);
      updated[item.id] = {
        quantity: remaining > 0 ? String(remaining) : "",
        expiryDate: inputs[item.id]?.expiryDate || defaultExpiryStr,
      };
    });
    setInputs(updated);
  };

  const handleClearQuantities = () => {
    const updated: Record<string, ReceiveLineInput> = {};
    receivableItems.forEach((item) => {
      updated[item.id] = {
        quantity: "",
        expiryDate: inputs[item.id]?.expiryDate || defaultExpiryStr,
      };
    });
    setInputs(updated);
  };

  const handleQuantityChange = (
    itemId: string,
    maxQty: number,
    rawVal: string,
  ) => {
    const digitsOnly = rawVal.replace(/\D/g, "");
    const stripped = digitsOnly.replace(/^0+/, "");

    let nextValue = stripped;
    if (stripped !== "") {
      const num = Number(stripped);
      if (num > maxQty) {
        nextValue = String(maxQty);
      }
    }

    setInputs((prev) => ({
      ...prev,
      [itemId]: {
        quantity: nextValue,
        expiryDate: prev[itemId]?.expiryDate || defaultExpiryStr,
      },
    }));
  };

  const handleExpiryChange = (itemId: string, dateVal: string) => {
    setInputs((prev) => ({
      ...prev,
      [itemId]: {
        quantity: prev[itemId]?.quantity ?? "",
        expiryDate: dateVal,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const currentToday = getLocalDateString(0);

    for (const item of receivableItems) {
      const approved = item.approvedQuantity || item.requestedQuantity;
      const received = item.receivedQuantity || 0;
      const remaining = Math.max(0, approved - received);
      const rawQty = (inputs[item.id]?.quantity ?? "").trim();

      if (rawQty === "") continue;

      const parsedQty = Number(rawQty);
      if (!Number.isInteger(parsedQty) || parsedQty < 1) {
        showToast.error(
          `Số lượng nhận của "${item.productName}" phải tối thiểu là 1 (hoặc để trống nếu chưa nhận món này)!`,
        );
        return;
      }

      if (parsedQty > remaining) {
        showToast.error(
          `Số lượng nhận của "${item.productName}" không được vượt quá ${remaining} ${item.unit}!`,
        );
        return;
      }
    }

    const linesToSubmit = receivableItems
      .map((item) => {
        const entry = inputs[item.id];
        const qty = entry?.quantity ? Number(entry.quantity) : 0;
        return {
          item,
          quantity: qty,
          expiryDate: entry?.expiryDate ?? "",
        };
      })
      .filter((line) => line.quantity >= 1);

    if (linesToSubmit.length === 0) {
      showToast.error(
        "Vui lòng nhập số lượng nhận tối thiểu là 1 cho ít nhất 1 sản phẩm!",
      );
      return;
    }

    const missingExpiry = linesToSubmit.find((line) => !line.expiryDate);
    if (missingExpiry) {
      showToast.error(
        `Vui lòng chọn hạn sử dụng cho sản phẩm ${missingExpiry.item.productName}!`,
      );
      return;
    }

    const pastExpiry = linesToSubmit.find(
      (line) => line.expiryDate < currentToday,
    );
    if (pastExpiry) {
      showToast.error(
        `Hạn sử dụng của sản phẩm ${pastExpiry.item.productName} không được là ngày trong quá khứ!`,
      );
      return;
    }

    try {
      setIsSubmitting(true);

      for (const line of linesToSubmit) {
        await branchInventoryService.createLot(branchId, {
          productId: line.item.productId,
          stockRequestItemId: line.item.id,
          quantity: line.quantity,
          expiryDate: line.expiryDate,
        });
      }

      const detailRes = await branchInventoryService.getInventoryRequestDetail(
        branchId,
        request.id,
      );
      const updatedStatus = detailRes?.data?.status;

      if (updatedStatus === "COMPLETED") {
        showToast.success(
          "Đã nhận đủ hàng và cộng toàn bộ tồn kho thành công!",
        );
      } else {
        showToast.success(
          "Đã ghi nhận lô hàng nhận một phần! Có thể tiếp tục nhận các đợt sau.",
        );
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Có lỗi xảy ra khi xác nhận nhập lô hàng!";
      showToast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArchiveBoxArrowDownIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Xác nhận nhận hàng & Tạo lô nhập kho
              </h2>
              <p className="text-xs text-slate-500">
                Phiếu{" "}
                <span className="font-mono font-bold">
                  #{request.id.slice(0, 8)}
                </span>{" "}
                • Nhập số lượng thực nhận đợt này (hỗ trợ nhận nhiều đợt)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {isLoadingDetail ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Đang tải thông tin chi tiết phiếu nhập...
            </div>
          ) : receivableItems.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircleIcon className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Tất cả sản phẩm trong phiếu này đã được nhận đủ!
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200/80">
                <span className="text-xs text-slate-600">
                  Thao tác nhanh số lượng đợt này:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillAllRemaining}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-emerald-500 text-xs font-semibold text-emerald-700 transition cursor-pointer"
                  >
                    Điền đủ phần còn lại
                  </button>
                  <button
                    type="button"
                    onClick={handleClearQuantities}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-amber-500 text-xs font-semibold text-amber-700 transition cursor-pointer"
                  >
                    Xóa trắng (Nhận một phần)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs">
                      <th className="py-3 px-3.5">Sản phẩm</th>
                      <th className="py-3 px-3 text-center">Đã duyệt</th>
                      <th className="py-3 px-3 text-center">Đã nhận</th>
                      <th className="py-3 px-3 text-center">Còn lại</th>
                      <th className="py-3 px-3 w-32">SL nhận đợt này</th>
                      <th className="py-3 px-3.5 w-40">Hạn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receivableItems.map((item) => {
                      const approved =
                        item.approvedQuantity || item.requestedQuantity;
                      const received = item.receivedQuantity || 0;
                      const remaining = Math.max(0, approved - received);
                      const currentInput = inputs[item.id] || {
                        quantity: remaining > 0 ? String(remaining) : "",
                        expiryDate: defaultExpiryStr,
                      };
                      const isPastDate =
                        Boolean(currentInput.expiryDate) &&
                        currentInput.expiryDate < todayStr;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3.5">
                            <p className="font-semibold text-slate-800">
                              {item.productName}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              {item.productSku} • ĐVT: {item.unit}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-700">
                            {approved}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-500">
                            {received}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-amber-700">
                            {remaining}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder={`1 - ${remaining}`}
                              value={currentInput.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  remaining,
                                  e.target.value,
                                )
                              }
                              className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </td>
                          <td className="py-3 px-3.5">
                            <input
                              type="date"
                              value={currentInput.expiryDate}
                              min={todayStr}
                              onChange={(e) =>
                                handleExpiryChange(item.id, e.target.value)
                              }
                              className={`w-full px-2.5 py-1.5 text-xs text-slate-800 border rounded-lg focus:outline-none ${
                                isPastDate
                                  ? "border-rose-500 bg-rose-50/50 focus:border-rose-600"
                                  : "border-slate-300 focus:border-emerald-600"
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Đóng
            </button>
            {receivableItems.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting || isLoadingDetail}
                className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                {isSubmitting ? "Đang nhập kho..." : "Xác nhận nhập vào kho"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
