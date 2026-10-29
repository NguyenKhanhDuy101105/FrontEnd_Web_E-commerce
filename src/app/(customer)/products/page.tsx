"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCardGrid, {
  ProductGridProps,
} from "@/src/components/common/ProductCardGrid";
import ProductFilterSidebar from "./(components)/ProductFilterSidebar";
import Pagination from "@/src/components/common/Pagination";
import { useBranch } from "@/src/context/BranchContext";
import {
  productService,
  GetProductsParams,
} from "@/src/services/customer/productService";
import { cartService } from "@/src/services/customer/cartService";
import { notifyCartUpdated } from "@/src/utils/cartEvent";
import { showToast } from "@/src/utils/toast";

const SORT_OPTIONS = [
  {
    key: "promo",
    label: "Khuyến mãi tốt nhất",
    apiKey: "discountPercent,desc",
  },
  { key: "price_asc", label: "Giá tăng dần", apiKey: "displayPrice,asc" },
  { key: "price_desc", label: "Giá giảm dần", apiKey: "displayPrice,desc" },
  { key: "newest", label: "Sản phẩm mới nhất", apiKey: "createdAt,desc" },
  {
    key: "bestseller",
    label: "Sản phẩm bán chạy nhất",
    apiKey: "soldQuantity,desc",
  },
];

function ProductsListingContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const searchQuery = searchParams.get("search") || searchParams.get("keyword"); // Lấy từ khóa tìm kiếm từ URL

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const { branchId } = useBranch();
  const [products, setProducts] = useState<ProductGridProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeSortKey, setActiveSortKey] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchProducts = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    try {
      let res;
      const selectedOption = SORT_OPTIONS.find(
        (opt) => opt.key === activeSortKey,
      );

      // Thêm tham số search / keyword vào params
      const params: GetProductsParams = {
        branchId,
        page,
        size: 10,
        ...(selectedOption?.apiKey ? { sort: selectedOption.apiKey } : {}),
        ...(minPrice ? { minPrice: Number(minPrice) } : {}),
        ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
        ...(searchQuery ? { search: searchQuery, keyword: searchQuery } : {}), // Truyền từ khóa xuống API
      };

      if (categoryId) {
        res = await productService.getProductsByCategory(categoryId, params);
      } else {
        res = await productService.getProducts(params);
      }

      if (res.status === "success" && res.data?.content) {
        const mapped: ProductGridProps[] = res.data.content.map((item) => ({
          id: item.id,
          title: item.name,
          brand: item.brandName || item.categoryName || "CO.OP SELECT",
          image: item.imageUrl || "/images/Banner1.jpeg",
          price: item.displayPrice,
          originalPrice:
            item.basePrice > item.displayPrice ? item.basePrice : undefined,
          unit: item.unit || "Kg",
          rating: 5.0,
          stockQuantity: item.stockQuantity,
          inStock: item.inStock,
        }));
        setProducts(mapped);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    branchId,
    categoryId,
    page,
    activeSortKey,
    minPrice,
    maxPrice,
    searchQuery,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortClick = (key: string) => {
    setActiveSortKey((prevKey) => (prevKey === key ? null : key));
    setPage(0);
  };

  const handleAddToCart = async (productId: string) => {
    if (!branchId) {
      showToast.error("Vui lòng chọn siêu thị!");
      return;
    }

    try {
      const res = await cartService.addToCart({
        branchId,
        productId,
        quantity: 1,
      });

      if (res.status === "success") {
        showToast.success("Đã thêm sản phẩm vào giỏ!");
        notifyCartUpdated();
      }
    } catch (error) {
      console.error("Lỗi thêm vào giỏ:", error);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-4 pb-24 sm:py-6 sm:pb-8">
      <div className="max-w-350 mx-auto px-3 sm:px-6">
        <nav className="text-xs text-slate-500 mb-4 flex items-center space-x-1">
          <Link href="/" className="hover:text-blue-700 transition">
            Trang chủ
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">Danh sách sản phẩm</span>
          {searchQuery && (
            <>
              <span>&gt;</span>
              <span className="text-emerald-700 font-bold">
                Tìm kiếm: &quot;{searchQuery}&quot;
              </span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div className="lg:col-span-1">
            <ProductFilterSidebar key={categoryId || searchQuery || "all"} />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-t-xl p-4 border border-slate-200 space-y-3">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                {searchQuery
                  ? `Kết quả tìm kiếm cho "${searchQuery}"`
                  : "Sản phẩm"}
                <span className="text-sm font-normal text-slate-400">
                  ({totalElements} sản phẩm)
                </span>
              </h1>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium shrink-0 pr-1">
                  Sắp xếp theo
                </span>
                {SORT_OPTIONS.map((opt) => {
                  const isActive = activeSortKey === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSortClick(opt.key)}
                      className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "border-blue-700 text-blue-900 bg-blue-50/60 font-bold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 bg-white animate-pulse border border-slate-200 p-4"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 text-center border border-slate-200 text-slate-500 text-sm">
                Không tìm thấy sản phẩm nào phù hợp với từ khóa &quot;
                {searchQuery}&quot;.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCardGrid
                      key={product.id}
                      {...product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                <div className="flex justify-center sm:justify-end items-center pt-2">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsListingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
      <ProductsListingContent />
    </Suspense>
  );
}
