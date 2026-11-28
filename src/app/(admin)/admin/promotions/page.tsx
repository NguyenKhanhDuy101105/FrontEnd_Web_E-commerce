"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ProductDiscountTable, {
  DiscountProductItem,
} from "./components/ProductDiscountTable";
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

const MAX_SEARCH_LENGTH = 100;

const normalizeSearchText = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getAllSubCategoryIds = (cat: CategoryItem): string[] => {
  let ids: string[] = [cat.id];
  if (cat.children && Array.isArray(cat.children)) {
    cat.children.forEach((child) => {
      ids = ids.concat(getAllSubCategoryIds(child));
    });
  }
  return ids;
};

export default function ProductDiscountManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedL1Id, setSelectedL1Id] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [discounts, setDiscounts] = useState<ProductDiscountItem[]>([]);
  const [allProducts, setAllProducts] = useState<DiscountProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountTarget, setDiscountTarget] =
    useState<DiscountModalTarget | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDiscount, setDeletingDiscount] =
    useState<ProductDiscountItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    titleName: string;
    discounts: ProductDiscountItem[];
  } | null>(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadCategories = async () => {
      try {
        const catRes = await categoriesService.getCategories();
        if (isCancelled) return;

        if (catRes && catRes.data && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
          if (catRes.data.length > 0) {
            setSelectedL1Id((prev) => prev || catRes.data[0].id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Lỗi khi tải danh mục:", error);
          showToast.error("Không thể tải danh sách danh mục!");
          setLoading(false);
        }
      }
    };

    loadCategories();
    return () => {
      isCancelled = true;
    };
  }, []);

  const loadDiscountsAndProducts = useCallback(async () => {
    if (categories.length === 0 || !selectedL1Id) {
      return { discounts: [], products: [] };
    }

    const currentL1 = categories.find((c) => c.id === selectedL1Id);
    const subCategoryIds = currentL1 ? getAllSubCategoryIds(currentL1) : [];

    if (subCategoryIds.length === 0) {
      return { discounts: [], products: [] };
    }

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

    const combinedProducts: DiscountProductItem[] = [];
    const seenProductIds = new Set<string>();

    productResults.forEach((res) => {
      if (res && res.data && Array.isArray(res.data.content)) {
        res.data.content.forEach((item: DiscountProductItem) => {
          if (!seenProductIds.has(item.id)) {
            seenProductIds.add(item.id);
            combinedProducts.push(item);
          }
        });
      }
    });

    return { discounts: combinedDiscounts, products: combinedProducts };
  }, [categories, selectedL1Id]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadDiscountsAndProducts();
      setDiscounts(result.discounts);
      setAllProducts(result.products);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      showToast.error("Không thể tải dữ liệu sản phẩm và khuyến mãi!");
    } finally {
      setLoading(false);
    }
  }, [loadDiscountsAndProducts]);

  useEffect(() => {
    if (categories.length === 0 || !selectedL1Id) return;

    let isCancelled = false;

    const runFetch = async () => {
      setLoading(true);
      try {
        const result = await loadDiscountsAndProducts();
        if (!isCancelled) {
          setDiscounts(result.discounts);
          setAllProducts(result.products);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Lỗi tải dữ liệu:", error);
          showToast.error("Không thể tải dữ liệu sản phẩm và khuyến mãi!");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    runFetch();
    return () => {
      isCancelled = true;
    };
  }, [categories, selectedL1Id, loadDiscountsAndProducts]);

  const handleSearchChange = (value: string) => {
    const cleanedLeadingSpace = value
      .replace(/^\s+/, "")
      .slice(0, MAX_SEARCH_LENGTH);
    setSearchTerm(cleanedLeadingSpace);
  };

  const filteredProducts = useMemo(() => {
    const normalizedTerm = normalizeSearchText(searchTerm);
    if (!normalizedTerm) return allProducts;

    return allProducts.filter((p) => {
      const normalizedName = normalizeSearchText(p.name || "");
      const normalizedSku = normalizeSearchText(p.sku || "");
      return (
        normalizedName.includes(normalizedTerm) ||
        normalizedSku.includes(normalizedTerm)
      );
    });
  }, [allProducts, searchTerm]);

  const handleSaveDiscount = async (data: {
    productIds: string[];
    discountPercent: number;
    startsAt: string;
    endsAt: string;
  }) => {
    setSubmitLoading(true);
    try {
      const uniqueProductIds = Array.from(new Set(data.productIds));
      const BATCH_SIZE = 5;
      let successCount = 0;

      for (let i = 0; i < uniqueProductIds.length; i += BATCH_SIZE) {
        const batch = uniqueProductIds.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((productId) =>
            productDiscountService.createDiscount({
              productId,
              discountPercent: data.discountPercent * 100,
              startsAt: data.startsAt,
              endsAt: data.endsAt,
            }),
          ),
        );
        successCount += results.filter((r) => r.status === "fulfilled").length;
      }

      if (successCount > 0) {
        showToast.success("Cài đặt khuyến mãi thành công!");
      } else {
        showToast.error("Không thể cài đặt khuyến mãi!");
      }

      setIsModalOpen(false);
      setDiscountTarget(null);
      await refreshData();
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
        await refreshData();
      }
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      showToast.error("Không thể gỡ khuyến mãi!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget || bulkDeleteTarget.discounts.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      const uniqueIds = Array.from(
        new Set(bulkDeleteTarget.discounts.map((d) => d.id)),
      );

      const BATCH_SIZE = 5;
      let successCount = 0;

      for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
        const batch = uniqueIds.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((id) => productDiscountService.deleteDiscount(id)),
        );
        successCount += results.filter((r) => r.status === "fulfilled").length;
      }

      if (successCount > 0) {
        showToast.success("Đã gỡ khuyến mãi thành công!");
      } else {
        showToast.error("Không thể gỡ khuyến mãi!");
      }

      setBulkDeleteTarget(null);
      await refreshData();
    } catch (error) {
      console.error("Lỗi gỡ khuyến mãi hàng loạt:", error);
      showToast.error("Có lỗi xảy ra khi gỡ khuyến mãi hàng loạt!");
    } finally {
      setBulkDeleteLoading(false);
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
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU (hỗ trợ không dấu)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={() =>
              setSearchTerm((prev) =>
                prev.trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_LENGTH),
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTerm((prev) =>
                  prev.trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_LENGTH),
                );
              }
            }}
            className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              title="Xóa từ khóa tìm kiếm"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
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
          products={filteredProducts}
          categories={categories}
          selectedL1Id={selectedL1Id}
          discounts={discounts}
          searchTerm={searchTerm}
          onOpenAddDiscount={(target) => {
            setDiscountTarget(target);
            setIsModalOpen(true);
          }}
          onOpenDeleteDiscount={(discount) => {
            setDeletingDiscount(discount);
            setIsDeleteModalOpen(true);
          }}
          onOpenBulkDeleteDiscount={(target) => {
            setBulkDeleteTarget(target);
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

      {bulkDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Xác nhận gỡ tất cả khuyến mãi
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bạn có chắc chắn muốn gỡ khuyến mãi của toàn bộ{" "}
                  <strong className="text-rose-600">
                    {bulkDeleteTarget.discounts.length} khuyến mãi
                  </strong>{" "}
                  thuộc danh mục{" "}
                  <strong className="text-slate-900">
                    {bulkDeleteTarget.titleName}
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={bulkDeleteLoading}
                onClick={() => setBulkDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={bulkDeleteLoading}
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {bulkDeleteLoading ? "Đang gỡ..." : "Gỡ tất cả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
