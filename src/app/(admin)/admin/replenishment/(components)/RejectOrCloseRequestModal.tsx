"use client";

import React, { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import {
  InventoryRequest,
  inventoryRequestService,
} from "@/src/services/admin/adminInventoryRequestService";
import { showToast } from "@/src/utils/toast";

interface RejectOrCloseRequestModalProps {
  isOpen: boolean;
  mode: "REJECT" | "CLOSE";
  request: InventoryRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RejectOrCloseRequestModal({
  isOpen,
  mode,
  request,
  onClose,
  onSuccess,
}: RejectOrCloseRequestModalProps) {
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setNote("");
  }, [isOpen]);

  if (!isOpen || !request) return null;

  const isReject = mode === "REJECT";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isReject && !note.trim()) {
      showToast.error("Vui lòng nhập lý do từ chối yêu cầu!");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isReject) {
        await inventoryRequestService.rejectInventoryRequest(request.id, {
          note: note.trim(),
        });
        showToast.success("Đã từ chối yêu cầu nhập hàng!");
      } else {
        await inventoryRequestService.closeInventoryRequest(request.id, {
          note: note.trim() || undefined,
        });
        showToast.success("Đã đóng phiếu yêu cầu nhập hàng!");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (isReject
          ? "Không thể từ chối yêu cầu nhập hàng!"
          : "Không thể đóng yêu cầu nhập hàng!");
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
        className="relative w-full max-w-md rounded-xl bg-white p-5 sm:p-6 shadow-xl border border-slate-100"
      >
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                isReject
                  ? "bg-rose-50 border-rose-100 text-rose-600"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {isReject ? (
                <ExclamationTriangleIcon className="w-6 h-6" />
              ) : (
                <LockClosedIcon className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isReject
                  ? "Từ chối yêu cầu nhập hàng?"
                  : "Đóng phiếu yêu cầu nhập hàng?"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Phiếu{" "}
                <span className="font-mono font-bold text-slate-700">
                  #{request.id.slice(0, 8)}
                </span>{" "}
                của chi nhánh{" "}
                <span className="font-semibold text-slate-700">
                  {request.branchName}
                </span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isReject ? "Lý do từ chối *" : "Ghi chú đóng phiếu (tùy chọn)"}
            </label>
            <textarea
              rows={3}
              required={isReject}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isReject
                  ? "Nhập lý do từ chối để chi nhánh nắm thông tin..."
                  : "VD: Kho tổng tạm hết phần hàng còn lại, kết thúc đợt nhập..."
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-60 ${
                isReject
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-slate-800 hover:bg-slate-900"
              }`}
            >
              {isSubmitting
                ? "Đang xử lý..."
                : isReject
                  ? "Xác nhận từ chối"
                  : "Xác nhận đóng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
