"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  RecipeItem,
  RecipePayload,
  RecipeIngredient,
  CategoryMonAn,
  adminRecipeService,
} from "@/src/services/admin/adminRecipeService";
import ProductSearchSelect from "./ProductSearchSelect";

interface RecipeModalProps {
  isOpen: boolean;
  editingRecipe: RecipeItem | null;
  onClose: () => void;
  onSubmit: (payload: RecipePayload) => Promise<void>;
}

export default function RecipeModal({
  isOpen,
  editingRecipe,
  onClose,
  onSubmit,
}: RecipeModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryMonAn, setCategoryMonAn] =
    useState<CategoryMonAn>("VEGETABLE");
  const [isActive, setIsActive] = useState(true);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingRecipe?.id) {
      setName(editingRecipe.name || "");
      setDescription(editingRecipe.description || "");
      setImageUrl(editingRecipe.imageUrl || "");
      setCategoryMonAn(editingRecipe.categoryMonAn || "VEGETABLE");
      setIsActive(editingRecipe.isActive ?? true);

      if (editingRecipe.ingredients && editingRecipe.ingredients.length > 0) {
        setIngredients(editingRecipe.ingredients);
      } else {
        const fetchDetail = async () => {
          setLoadingRecipe(true);
          try {
            const res = await adminRecipeService.getRecipeById(
              editingRecipe.id,
            );
            const data = res?.data || res;
            if (data) {
              setName(data.name || editingRecipe.name || "");
              setDescription(
                data.description || editingRecipe.description || "",
              );
              setImageUrl(data.imageUrl || editingRecipe.imageUrl || "");
              setCategoryMonAn(
                data.categoryMonAn ||
                  editingRecipe.categoryMonAn ||
                  "VEGETABLE",
              );
              setIsActive(data.isActive ?? true);
              setIngredients(data.ingredients || []);
            }
          } catch (err) {
            console.error("Lỗi lấy chi tiết công thức:", err);
          } finally {
            setLoadingRecipe(false);
          }
        };
        fetchDetail();
      }
    } else {
      setName("");
      setDescription("");
      setImageUrl("");
      setCategoryMonAn("VEGETABLE");
      setIsActive(true);
      setIngredients([]);
    }
  }, [editingRecipe, isOpen]);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { productId: "", quantity: 1, isRequired: true, group: "MAIN", note: "" },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: any,
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        name,
        description,
        imageUrl,
        categoryMonAn,
        isActive,
        ingredients,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {editingRecipe ? "Chỉnh sửa công thức" : "Tạo công thức món ăn mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {loadingRecipe ? (
          <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
            Đang tải thông tin công thức và nguyên liệu...
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên món ăn <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Canh chua cá lóc"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Danh mục món ăn
                </label>
                <select
                  value={categoryMonAn}
                  onChange={(e) =>
                    setCategoryMonAn(e.target.value as CategoryMonAn)
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="VEGETABLE">Món rau</option>
                  <option value="MEAT">Món thịt</option>
                  <option value="SEAFOOD">Hải sản</option>
                  <option value="SOUP">Món canh</option>
                  <option value="HOTPOT">Món lẩu</option>
                  <option value="VEGETARIAN">Món chay</option>
                  <option value="DESSERT">Tráng miệng</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="true">Hiển thị (Active)</option>
                  <option value="false">Ẩn (Inactive)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL hình ảnh
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả ngắn
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hướng dẫn nấu sơ lược hoặc mô tả món ăn..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">
                  Thành phần nguyên liệu
                </h4>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" /> Thêm nguyên liệu
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Chưa có nguyên liệu nào. Bấm "Thêm nguyên liệu" để bổ sung.
                </div>
              ) : (
                ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                  >
                    <ProductSearchSelect
                      value={ing.productId}
                      onChange={(productId) =>
                        handleIngredientChange(idx, "productId", productId)
                      }
                    />

                    <input
                      type="number"
                      min={1}
                      placeholder="SL"
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredientChange(
                          idx,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />

                    <select
                      value={ing.group}
                      onChange={(e) =>
                        handleIngredientChange(idx, "group", e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="MAIN">Chính</option>
                      <option value="SUB">Phụ</option>
                      <option value="SPICE">Gia vị</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? "Đang lưu..."
                  : editingRecipe
                    ? "Cập nhật"
                    : "Tạo mới"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
