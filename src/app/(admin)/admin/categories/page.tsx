"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  categoriesService,
  CategoryItem,
} from "@/src/services/customer/categoriesService";
import { showToast } from "@/src/utils/toast";
import CategoryItemL2 from "./components/CategoryItemL2";
import CategoryDrawer from "./components/CategoryDrawer";
import DeleteCategoryModal from "./components/DeleteCategoryModal";

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [parentNameDisplay, setParentNameDisplay] = useState<string>(
    "Danh mục gốc (Cấp 1)",
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesService.getCategories();
      if (res && res.data && Array.isArray(res.data)) {
        setCategories(res.data);
        setExpandedIds(new Set(res.data.map((c) => c.id)));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải cây danh mục:", error);
      showToast.error("Không thể tải danh sách danh mục!");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (isMounted) {
        await fetchCategories();
      }
    };
    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenCreateRoot = () => {
    setEditingItem(null);
    setFormParentId(null);
    setParentNameDisplay("Danh mục gốc (Cấp 1)");
    setIsModalOpen(true);
  };

  const handleOpenCreateChild = (parent: CategoryItem, parentName: string) => {
    setEditingItem(null);
    setFormParentId(parent.id);
    setParentNameDisplay(`${parentName} > ${parent.name}`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (
    item: CategoryItem,
    path: string = "Danh mục gốc",
    parentId: string | null = null,
  ) => {
    setEditingItem(item);
    setFormParentId(parentId);
    setParentNameDisplay(path);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (categoryItem: CategoryItem) => {
    setDeletingCategory(categoryItem);
    setIsDeleteModalOpen(true);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản lý danh mục
          </h1>
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:flex-1 min-w-0">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium"
            />
          </div>

          <button
            onClick={handleOpenCreateRoot}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0d5c3a] hover:bg-[#094229] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <PlusIcon className="w-4 h-4 stroke-3" />
            <span>Thêm danh mục gốc</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium bg-white rounded-lg border border-slate-200/80">
            <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0d5c3a]" />
            Đang tải danh sách danh mục...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-lg border border-slate-200/80">
            Chưa có danh mục nào hoặc không tìm thấy kết quả phù hợp.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((l1) => {
              const isExpanded = expandedIds.has(l1.id);
              const l2List = l1.children || [];

              return (
                <div
                  key={l1.id}
                  className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleExpand(l1.id)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-extrabold uppercase text-slate-900">
                            {l1.name}
                          </h2>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {l2List.length} nhóm con
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenCreateChild(l1, "Cấp 1")}
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-bold text-[#0d5c3a] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer whitespace-nowrap"
                        title="Thêm nhóm con"
                      >
                        <PlusIcon className="w-3.5 h-3.5 stroke-3" />
                        <span className="hidden sm:inline">Thêm nhóm con</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(l1)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer rounded-lg hover:bg-slate-100"
                        title="Chỉnh sửa"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenDeleteModal(l1)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer rounded-lg hover:bg-slate-100"
                        title="Xóa danh mục"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && l2List.length > 0 && (
                    <div className="pl-6 border-l-2 border-slate-100 space-y-3 pt-2">
                      {l2List.map((l2, l2Idx) => (
                        <CategoryItemL2
                          l1Id={l1.id}
                          key={l2.id}
                          category={l2}
                          index={l2Idx}
                          l1Name={l1.name}
                          expandedIds={expandedIds}
                          onToggleExpand={toggleExpand}
                          onAddChild={handleOpenCreateChild}
                          onEdit={handleOpenEdit}
                          onDelete={() => handleOpenDeleteModal(l2)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CategoryDrawer
        isOpen={isModalOpen}
        editingItem={editingItem}
        parentId={formParentId}
        parentNameDisplay={parentNameDisplay}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        category={deletingCategory}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
