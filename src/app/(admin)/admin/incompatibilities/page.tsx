"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TagIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
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

  // Data States
  const [foodTags, setFoodTags] = useState<FoodTag[]>([]);
  const [incompatibilities, setIncompatibilities] = useState<
    FoodIncompatibilityItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] =
    useState<FoodIncompatibilityItem | null>(null);

  // 1. Lấy danh sách Food Tags
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

  // 2. Lấy danh sách quy tắc kỵ thực phẩm
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

  // Handlers
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
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            Nguy hiểm
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
            Nghiêm trọng
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            Trung bình
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            Nhẹ
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quản lý dị ứng thực phẩm
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTagModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60"
          >
            <TagIcon className="w-4 h-4" />
            Tạo Nhãn (Tag)
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setIsRuleModalOpen(true);
            }}
            disabled={foodTags.length < 2}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4" />
            Tạo quy tắc dị ứng nhau
          </button>
        </div>
      </div>

      {/* Tabs Chuyển đổi */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("RULES")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "RULES"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Quy tắc dị ứng ({totalElements})
        </button>
        <button
          onClick={() => setActiveTab("TAGS")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "TAGS"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Danh sách Nhãn ({foodTags.length})
        </button>
      </div>

      {/* TAB 1: DANH SÁCH QUY TẮC KỴ NHAU */}
      {activeTab === "RULES" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề, nhãn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value="">Tất cả mức độ</option>
              <option value="LOW">Thấp (LOW)</option>
              <option value="MEDIUM">Trung bình (MEDIUM)</option>
              <option value="HIGH">Nghiêm trọng (HIGH)</option>
              <option value="DANGEROUS">Nguy hiểm (DANGEROUS)</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Cặp nhãn dị ứng</th>
                  <th className="p-3.5">Tiêu đề cảnh báo</th>
                  <th className="p-3.5">Mức độ</th>
                  <th className="p-3.5">Tác hại & Khuyến nghị</th>
                  <th className="p-3.5 text-center">Trạng thái</th>
                  <th className="p-3.5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-400 animate-pulse"
                    >
                      Đang tải danh sách quy tắc...
                    </td>
                  </tr>
                ) : incompatibilities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Chưa có quy tắc kỵ nhau nào.
                    </td>
                  </tr>
                ) : (
                  incompatibilities.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-3.5 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono font-bold">
                            {item.tagA}
                          </span>
                          <span className="text-rose-500 font-bold">❌</span>
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono font-bold">
                            {item.tagB}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {item.title}
                      </td>
                      <td className="p-3.5">
                        {getSeverityBadge(item.severity)}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p
                          className="text-slate-700 truncate"
                          title={item.effect}
                        >
                          <strong>Tác hại:</strong> {item.effect || "—"}
                        </p>
                        <p
                          className="text-slate-500 text-[11px] truncate mt-0.5"
                          title={item.recommendation}
                        >
                          <strong>Khuyên:</strong> {item.recommendation || "—"}
                        </p>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {item.isActive ? "Đang bật" : "Đã ẩn"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingRule(item);
                              setIsRuleModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRule(item.id, item.title)
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DANH SÁCH NHÃN THỰC PHẨM (FOOD TAGS) */}
      {activeTab === "TAGS" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Tất cả Nhãn thực phẩm trong hệ thống
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {foodTags.map((tag) => (
              <div
                key={tag.code}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {tag.name}
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                    {tag.code}
                  </p>
                </div>
                <TagIcon className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <FoodTagModal
        isOpen={isTagModalOpen}
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
