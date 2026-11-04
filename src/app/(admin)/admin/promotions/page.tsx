"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ProductDiscountTable from "./components/ProductDiscountTable";
import ProductDiscountModal, {
  DiscountModalTarget,
} from "./components/ProductDiscountModal";
import DeleteDiscountModal from "./components/DeleteDiscountModal";
import {
  productDiscountService,
  ProductDiscountItem,
} from "@/src/services/admin/adminProductDiscountService";
import {
  categoriesService,
  CategoryItem,
} from "@/src/services/customer/categoriesService";
import { adminProductService } from "@/src/services/admin/adminProductService";
import { showToast } from "@/src/utils/toast";

export default function ProductDiscountManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedL1Id, setSelectedL1Id] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [discounts, setDiscounts] = useState<ProductDiscountItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountTarget, setDiscountTarget] =
    useState<DiscountModalTarget | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDiscount, setDeletingDiscount] =
    useState<ProductDiscountItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const getAllSubCategoryIds = (cat: CategoryItem): string[] => {
    let ids: string[] = [cat.id];
    if (cat.children && Array.isArray(cat.children)) {
      cat.children.forEach((child) => {
        ids = ids.concat(getAllSubCategoryIds(child));
      });
    }
    return ids;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let subCategoryIds: string[] = [];

      if (categories.length > 0) {
        const currentL1 = categories.find((c) => c.id === selectedL1Id);
        if (currentL1) {
          subCategoryIds = getAllSubCategoryIds(currentL1);
        }
      }

      if (subCategoryIds.length > 0) {
        const discountPromises = subCategoryIds.map((id) =>
          productDiscountService.getDiscountsByCategory(id).catch(() => null),
        );

        const productPromises = subCategoryIds.map((id) =>
          adminProductService
            .getProductsByCategoryId(id, { page: 0, size: 100 })
            .catch(() => null),
        );

        const [discountResults, productResults] = await Promise.all([
          Promise.all(discountPromises),
          Promise.all(productPromises),
        ]);

        const combinedDiscounts: ProductDiscountItem[] = [];
        const seenDiscountIds = new Set<string>();

        discountResults.forEach((res) => {
          if (res && res.status === "success" && Array.isArray(res.data)) {
            res.data.forEach((item) => {
              if (!seenDiscountIds.has(item.id)) {
                seenDiscountIds.add(item.id);
                combinedDiscounts.push(item);
              }
            });
          }
        });
        setDiscounts(combinedDiscounts);

        const combinedProducts: any[] = [];
        const seenProductIds = new Set<string>();

        productResults.forEach((res) => {
          if (res && res.data && Array.isArray(res.data.content)) {
            res.data.content.forEach((item: any) => {
              if (!seenProductIds.has(item.id)) {
                seenProductIds.add(item.id);
                combinedProducts.push(item);
              }
            });
          }
        });

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          setProducts(
            combinedProducts.filter(
              (p) =>
                p.name?.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term),
            ),
          );
        } else {
          setProducts(combinedProducts);
        }
      } else {
        setDiscounts([]);
        setProducts([]);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      showToast.error("Không thể tải dữ liệu sản phẩm và khuyến mãi!");
    } finally {
      setLoading(false);
    }
  }, [categories, selectedL1Id, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveDiscount = async (data: {
    productIds: string[];
    discountPercent: number;
    startsAt: string;
    endsAt: string;
  }) => {
    setSubmitLoading(true);
    try {
      const apiCalls = data.productIds.map((productId) =>
        productDiscountService.createDiscount({
          productId,
          discountPercent: data.discountPercent * 100,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        }),
      );

      await Promise.all(apiCalls);
      showToast.success("Cài đặt khuyến mãi thành công!");
      setIsModalOpen(false);
      setDiscountTarget(null);
      fetchData();
    } catch (error) {
      console.error("Lỗi lưu khuyến mãi:", error);
      showToast.error("Không thể cài đặt khuyến mãi!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await productDiscountService.deleteDiscount(id);
      if (res.status === "success") {
        showToast.success("Gỡ khuyến mãi thành công!");
        setIsDeleteModalOpen(false);
        setDeletingDiscount(null);
        fetchData();
      }
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      showToast.error("Không thể gỡ khuyến mãi!");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản lý khuyến mãi sản phẩm
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
                  type="button"
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
          Đang tải danh sách khuyến mãi...
        </div>
      ) : (
        <ProductDiscountTable
          products={products}
          categories={categories}
          selectedL1Id={selectedL1Id}
          discounts={discounts}
          onOpenAddDiscount={(target) => {
            setDiscountTarget(target);
            setIsModalOpen(true);
          }}
          onOpenDeleteDiscount={(discount) => {
            setDeletingDiscount(discount);
            setIsDeleteModalOpen(true);
          }}
        />
      )}

      <ProductDiscountModal
        isOpen={isModalOpen}
        target={discountTarget}
        loading={submitLoading}
        onClose={() => {
          setIsModalOpen(false);
          setDiscountTarget(null);
        }}
        onSubmit={handleSaveDiscount}
      />

      <DeleteDiscountModal
        isOpen={isDeleteModalOpen}
        discount={deletingDiscount}
        loading={deleteLoading}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingDiscount(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
