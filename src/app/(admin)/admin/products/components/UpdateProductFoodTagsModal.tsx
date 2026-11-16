"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, TagIcon } from "@heroicons/react/24/outline";
import { adminIncompatibilityService } from "@/src/services/admin/adminIncompatibilityService";
import { showToast } from "@/src/utils/toast";

export interface FoodTagItem {
  code: string;
  name: string;
}

interface UpdateProductFoodTagsModalProps {
  product: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdateProductFoodTagsModal({
  product,
  onClose,
  onSuccess,
}: UpdateProductFoodTagsModalProps) {
  const [allTags, setAllTags] = useState<FoodTagItem[]>([]);
  const [selectedTagCodes, setSelectedTagCodes] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!product) return;

    const fetchFoodTags = async () => {
      setLoadingTags(true);
      try {
        const res = await adminIncompatibilityService.getFoodTags();
        if (res && res.data && Array.isArray(res.data)) {
          setAllTags(res.data);
        } else if (Array.isArray(res)) {
          setAllTags(res as unknown as FoodTagItem[]);
        } else {
          setAllTags([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhãn thực phẩm:", error);
        showToast.error("Không thể tải danh sách nhãn thực phẩm!");
      } finally {
        setLoadingTags(false);
      }
    };

    fetchFoodTags();
  }, [product]);

  if (!product) return null;

  const handleToggleTag = (code: string) => {
    setSelectedTagCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminIncompatibilityService.updateProductFoodTags(
        product.id,
        { tagCodes: selectedTagCodes },
      );
      if (res && (res.status === "success" || res.code === 200 || res)) {
        showToast.success("Cập nhật nhãn thực phẩm thành công!");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật nhãn thực phẩm:", error);
      const errMsg =
        error?.response?.data?.message || "Cập nhật nhãn thực phẩm thất bại!";
      showToast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-[#0d5c3a]" />
            <h3 className="font-bold text-base text-slate-800">
              Gán nhãn thực phẩm
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Sản phẩm đang chọn:</p>
            <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 truncate">
              {product.name}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Chọn các Nhãn Thực Phẩm (Food Tags)
            </label>

            {loadingTags ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Đang tải danh sách nhãn...
              </div>
            ) : allTags.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Không tìm thấy nhãn thực phẩm nào
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {allTags.map((tag) => {
                  const isChecked = selectedTagCodes.includes(tag.code);
                  return (
                    <label
                      key={tag.code}
                      onClick={() => handleToggleTag(tag.code)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                          : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>
                        {tag.name}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({tag.code})
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#0d5c3a] rounded cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || loadingTags}
              className="px-5 py-2 bg-[#0d5c3a] hover:bg-[#0a482d] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              {submitting ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
