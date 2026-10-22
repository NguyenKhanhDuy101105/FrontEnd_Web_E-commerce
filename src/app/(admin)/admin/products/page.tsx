"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  categoriesService,
  CategoryItem,
} from "@/src/services/customer/categoriesService";
import { adminProductService } from "@/src/services/admin/adminProductService";
import { showToast } from "@/src/utils/toast";
import ProductTable, { ProductItem } from "./components/ProductTable";
import ProductModal from "./components/ProductModal";
import DeleteProductModal from "./components/DeleteProductModal";

export default function AdminProductPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedL1Id, setSelectedL1Id] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [preSelectedCategoryId, setPreSelectedCategoryId] =
    useState<string>("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(
    null,
  );

  const fetchCategories = useCallback(async () => {
    try {
      const catRes = await categoriesService.getCategories();
      if (catRes && catRes.data && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setSelectedL1Id((prev) => prev || catRes.data[0].id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      showToast.error("Không thể tải danh sách danh mục!");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const prodRes = await adminProductService.getProducts({
        page: 0,
        size: 100,
        search: searchTerm.trim() || undefined,
      });

      if (prodRes && prodRes.data && Array.isArray(prodRes.data.content)) {
        setProducts(prodRes.data.content as unknown as ProductItem[]);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      showToast.error("Không thể tải danh sách sản phẩm!");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [fetchCategories]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [fetchProducts]);

  const handleAddProductToCategory = (categoryId: string) => {
    setEditingProduct(null);
    setPreSelectedCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ProductItem) => {
    setEditingProduct(item);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: ProductItem) => {
    setDeletingProduct(item);
    setIsDeleteModalOpen(true);
  };
  const handleRestoreProduct = async (item: ProductItem) => {
    try {
      const res = await adminProductService.restoreProduct(item.id);
      if (res && res.status === "success") {
        showToast.success(`Khôi phục sản phẩm "${item.name}" thành công!`);
        fetchProducts();
      }
    } catch (error) {
      console.error("Lỗi khôi phục sản phẩm:", error);
      showToast.error("Không thể khôi phục sản phẩm, vui lòng thử lại!");
    }
  };
  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản lý sản phẩm
          </h1>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {categories.map((l1) => {
              const isActive = l1.id === selectedL1Id;
              return (
                <button
                  key={l1.id}
                  onClick={() => setSelectedL1Id(l1.id)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-extrabold transition cursor-pointer text-center truncate border ${
                    isActive
                      ? "bg-[#0d5c3a] text-white border-[#0d5c3a] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  title={l1.name}
                >
                  {l1.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-medium bg-white rounded-lg border border-slate-200/80">
          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0d5c3a]" />
          Đang tải danh sách sản phẩm...
        </div>
      ) : (
        <ProductTable
          products={products}
          categories={categories}
          selectedL1Id={selectedL1Id}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onRestore={handleRestoreProduct}
          onAddProductToCategory={handleAddProductToCategory}
        />
      )}

      <ProductModal
        isOpen={isModalOpen}
        categories={categories}
        editingProduct={editingProduct}
        initialCategoryId={preSelectedCategoryId}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        product={deletingProduct}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
