"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  RecipeItem,
  CategoryMonAn,
} from "@/src/services/admin/adminRecipeService";

interface RecipeTableProps {
  recipes: RecipeItem[];
  loading: boolean;
  keyword: string;
  category: string;
  isActive: string;
  page: number;
  totalPages: number;
  totalElements: number;
  onKeywordChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onActiveChange: (val: string) => void;
  onPageChange: (newPage: number) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (recipe: RecipeItem) => void;
  onDeleteRecipe: (id: string, name: string) => void;
}

const CATEGORIES: { value: CategoryMonAn | ""; label: string }[] = [
  { value: "", label: "Tất cả danh mục" },
  { value: "VEGETABLE", label: "Món rau" },
  { value: "MEAT", label: "Món thịt" },
  { value: "SEAFOOD", label: "Hải sản" },
  { value: "SOUP", label: "Món canh" },
  { value: "HOTPOT", label: "Món lẩu" },
  { value: "VEGETARIAN", label: "Món chay" },
  { value: "DESSERT", label: "Tráng miệng" },
  { value: "OTHER", label: "Khác" },
];

export default function RecipeTable({
  recipes,
  loading,
  keyword,
  category,
  isActive,
  page,
  totalPages,
  totalElements,
  onKeywordChange,
  onCategoryChange,
  onActiveChange,
  onPageChange,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteRecipe,
}: RecipeTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Quản lý công thức món ăn
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng số:{" "}
            <span className="font-semibold text-slate-700">
              {totalElements}
            </span>{" "}
            công thức
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-200 cursor-pointer text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Tạo công thức mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên món ăn..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-slate-700 bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={isActive}
          onChange={(e) => onActiveChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-slate-700 bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã ẩn</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse text-sm">
            Đang tải danh sách công thức...
          </div>
        ) : recipes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Không tìm thấy công thức món ăn nào.
          </div>
        ) : (
          <>
            <div className="block md:hidden divide-y divide-slate-100">
              {recipes.map((item) => (
                <div key={item.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        item.imageUrl ||
                        "https://placehold.co/100x100?text=Food"
                      }
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.categoryLabel || item.categoryMonAn}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {item.isActive ? "Đang bật" : "Đã ẩn"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                    <span className="text-slate-500">
                      Nguyên liệu:{" "}
                      <strong className="text-slate-700">
                        {item.ingredients?.length || 0}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRecipe(item.id, item.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Món ăn</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4 text-center">Nguyên liệu</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipes.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.imageUrl ||
                              "https://placehold.co/100x100?text=Food"
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                          {item.categoryLabel || item.categoryMonAn}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-slate-700">
                          {item.ingredients?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {item.isActive ? "Đang bật" : "Đã ẩn"}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenEditModal(item)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onDeleteRecipe(item.id, item.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Trang {page + 1} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
