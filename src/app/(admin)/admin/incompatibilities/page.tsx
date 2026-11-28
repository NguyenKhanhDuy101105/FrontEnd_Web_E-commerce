"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  adminIncompatibilityService,
  FoodTag,
  FoodIncompatibilityItem,
  IncompatibilitySeverity,
  FoodIncompatibilityPayload,
  CreateFoodTagPayload,
} from "@/src/services/admin/adminIncompatibilityService";
import { showToast } from "@/src/utils/toast";
import FoodTagModal from "@/src/app/(admin)/admin/incompatibilities/components/FoodTagModal";
import IncompatibilityModal from "@/src/app/(admin)/admin/incompatibilities/components/IncompatibilityModal";

export default function AdminIncompatibilitiesPage() {
  const [activeTab, setActiveTab] = useState<"RULES" | "TAGS">("RULES");

  const [foodTags, setFoodTags] = useState<FoodTag[]>([]);
  const [incompatibilities, setIncompatibilities] = useState<
    FoodIncompatibilityItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] =
    useState<FoodIncompatibilityItem | null>(null);

  const fetchFoodTags = useCallback(async () => {
    try {
      const res = await adminIncompatibilityService.getFoodTags();
      if (res && res.data) {
        setFoodTags(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải nhãn thực phẩm:", error);
    }
  }, []);

  const fetchIncompatibilities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminIncompatibilityService.getIncompatibilities({
        search: search || undefined,
        severity: (severityFilter as IncompatibilitySeverity) || undefined,
        page,
        size: 10,
      });

      if (res && res.data) {
        setIncompatibilities(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi tải quy tắc kỵ thực phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [search, severityFilter, page]);

  useEffect(() => {
    fetchFoodTags();
  }, [fetchFoodTags]);

  useEffect(() => {
    fetchIncompatibilities();
  }, [fetchIncompatibilities]);

  const handleCreateTag = async (payload: CreateFoodTagPayload) => {
    try {
      await adminIncompatibilityService.createFoodTag(payload);
      showToast.success("Tạo nhãn thực phẩm thành công!");
      fetchFoodTags();
    } catch (error) {
      console.error("Lỗi tạo nhãn:", error);
      showToast.error("Không thể tạo nhãn thực phẩm!");
    }
  };

  const handleSubmitRule = async (payload: FoodIncompatibilityPayload) => {
    try {
      if (editingRule) {
        await adminIncompatibilityService.updateIncompatibility(
          editingRule.id,
          payload,
        );
        showToast.success("Cập nhật quy tắc thành công!");
      } else {
        await adminIncompatibilityService.createIncompatibility(payload);
        showToast.success("Tạo quy tắc kỵ nhau mới thành công!");
      }
      fetchIncompatibilities();
    } catch (error) {
      console.error("Lỗi lưu quy tắc:", error);
      showToast.error("Thao tác thất bại, vui lòng thử lại!");
    }
  };

  const handleDeleteRule = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa quy tắc: "${title}"?`)) {
      try {
        await adminIncompatibilityService.deleteIncompatibility(id);
        showToast.success("Xóa quy tắc thành công!");
        fetchIncompatibilities();
      } catch (error) {
        console.error("Lỗi xóa quy tắc:", error);
        showToast.error("Không thể xóa quy tắc!");
      }
    }
  };

  const getSeverityBadge = (sev: IncompatibilitySeverity) => {
    switch (sev) {
      case "DANGEROUS":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 whitespace-nowrap">
            Nguy hiểm
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700 whitespace-nowrap">
            Nghiêm trọng
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 whitespace-nowrap">
            Trung bình
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 whitespace-nowrap">
            Nhẹ
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            Quản lý dị ứng thực phẩm
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTagModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60 cursor-pointer whitespace-nowrap"
          >
            <TagIcon className="w-4 h-4 shrink-0" />
            <span>Tạo Nhãn (Tag)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingRule(null);
              setIsRuleModalOpen(true);
            }}
            disabled={foodTags.length < 2}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4 shrink-0" />
            <span>Tạo quy tắc dị ứng nhau</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("RULES")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "RULES"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Quy tắc dị ứng ({totalElements})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("TAGS")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "TAGS"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Danh sách Nhãn ({foodTags.length})
        </button>
      </div>

      {activeTab === "RULES" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề, nhãn..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(0);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tất cả mức độ</option>
              <option value="LOW">Thấp (Nhẹ)</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Nghiêm trọng</option>
              <option value="DANGEROUS">Nguy hiểm cấp tính</option>
            </select>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400 animate-pulse border border-slate-100 rounded-xl">
              Đang tải danh sách quy tắc...
            </div>
          ) : incompatibilities.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 border border-slate-100 rounded-xl">
              Chưa có quy tắc kỵ nhau nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
                {incompatibilities.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                            {item.tagA}
                          </span>
                          <span className="text-rose-500 font-bold text-xs">
                            ✕
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                            {item.tagB}
                          </span>
                        </div>
                        {getSeverityBadge(item.severity)}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <div className="space-y-1 text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                        <p className="text-slate-700 leading-relaxed">
                          <strong className="text-slate-900">Tác hại:</strong>{" "}
                          {item.effect || "—"}
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">Khuyên:</strong>{" "}
                          {item.recommendation || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {item.isActive ? "Đang bật" : "Đã ẩn"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRule(item);
                            setIsRuleModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(item.id, item.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa quy tắc"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5 whitespace-nowrap">
                        Cặp nhãn dị ứng
                      </th>
                      <th className="p-3.5 w-1/4">Tiêu đề cảnh báo</th>
                      <th className="p-3.5 text-center whitespace-nowrap">
                        Mức độ
                      </th>
                      <th className="p-3.5">Tác hại & Khuyến nghị</th>
                      <th className="p-3.5 text-center whitespace-nowrap">
                        Trạng thái
                      </th>
                      <th className="p-3.5 text-center whitespace-nowrap">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incompatibilities.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="p-3.5 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
                              {item.tagA}
                            </span>
                            <span className="text-rose-500 font-bold">✕</span>
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
                              {item.tagB}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 leading-snug">
                          {item.title}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {getSeverityBadge(item.severity)}
                        </td>
                        <td className="p-3.5 max-w-sm">
                          <p
                            className="text-slate-700 line-clamp-1"
                            title={item.effect}
                          >
                            <strong>Tác hại:</strong> {item.effect || "—"}
                          </p>
                          <p
                            className="text-slate-500 text-[11px] line-clamp-1 mt-0.5"
                            title={item.recommendation}
                          >
                            <strong>Khuyên:</strong>{" "}
                            {item.recommendation || "—"}
                          </p>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                              item.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {item.isActive ? "Đang bật" : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRule(item);
                                setIsRuleModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteRule(item.id, item.title)
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa quy tắc"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                  <span>
                    Trang <strong className="text-slate-800">{page + 1}</strong>{" "}
                    / {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={page + 1 >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "TAGS" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Tất cả Nhãn thực phẩm trong hệ thống
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {foodTags.map((tag) => (
              <div
                key={tag.code}
                className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {tag.name}
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-700 mt-0.5 truncate">
                    {tag.code}
                  </p>
                </div>
                <TagIcon className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      <FoodTagModal
        isOpen={isTagModalOpen}
        existingCodes={foodTags.map((t) => t.code)}
        onClose={() => setIsTagModalOpen(false)}
        onSubmit={handleCreateTag}
      />

      <IncompatibilityModal
        isOpen={isRuleModalOpen}
        editingItem={editingRule}
        foodTags={foodTags}
        onClose={() => setIsRuleModalOpen(false)}
        onSubmit={handleSubmitRule}
      />
    </div>
  );
}
