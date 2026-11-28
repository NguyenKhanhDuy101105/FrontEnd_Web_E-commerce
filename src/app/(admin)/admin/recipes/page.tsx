"use client";

import React, { useState, useEffect, useCallback } from "react";
import RecipeTable from "@/src/app/(admin)/admin/recipes/components/RecipeTable";
import RecipeModal from "@/src/app/(admin)/admin/recipes/components/RecipeModal";
import DeleteConfirmModal from "@/src/app/(admin)/admin/recipes/components/DeleteConfirmModal";
import {
  adminRecipeService,
  RecipeItem,
  RecipePayload,
  CategoryMonAn,
} from "@/src/services/admin/adminRecipeService";
import { adminAiService } from "@/src/services/admin/adminAiService";
import { showToast } from "@/src/utils/toast";

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminRecipeService.getRecipes({
        keyword: keyword || undefined,
        categoryMonAn: (category as CategoryMonAn) || undefined,
        isActive: isActive !== "" ? isActive === "true" : undefined,
        page,
        size: 10,
      });

      if (res.data) {
        setRecipes(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách công thức món ăn:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, isActive, page]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const syncAiRecipes = async () => {
    try {
      await adminAiService.reindexRecipes();
    } catch (error) {
      console.error("Lỗi đồng bộ lại dữ liệu AI:", error);
      showToast.error(
        "Đã cập nhật công thức nhưng đồng bộ dữ liệu AI thất bại!",
      );
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (recipe: RecipeItem) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string, name: string) => {
    setDeletingRecipe({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingRecipe) {
      try {
        await adminRecipeService.deleteRecipe(deletingRecipe.id);
        await syncAiRecipes();
        await fetchRecipes();
      } catch (error) {
        console.error("Lỗi xóa công thức món ăn:", error);
      }
    }
  };

  const handleSubmitModal = async (payload: RecipePayload) => {
    if (editingRecipe) {
      await adminRecipeService.updateRecipe(editingRecipe.id, payload);
    } else {
      await adminRecipeService.createRecipe(payload);
    }
    await syncAiRecipes();
    await fetchRecipes();
  };

  return (
    <div className="p-6 max-w-400 mx-auto">
      <RecipeTable
        recipes={recipes}
        loading={loading}
        keyword={keyword}
        category={category}
        isActive={isActive}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onKeywordChange={(val) => {
          setKeyword(val);
          setPage(0);
        }}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(0);
        }}
        onActiveChange={(val) => {
          setIsActive(val);
          setPage(0);
        }}
        onPageChange={(newPage) => setPage(newPage)}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenEditModal={handleOpenEditModal}
        onDeleteRecipe={handleOpenDeleteModal}
      />

      <RecipeModal
        isOpen={isModalOpen}
        editingRecipe={editingRecipe}
        existingRecipes={recipes}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        recipeName={deletingRecipe?.name || ""}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
