"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductCard, { ProductProps } from "@/src/components/common/ProductCard";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { cartService } from "@/src/services/customer/cartService";
import { useBranch } from "@/src/context/BranchContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { notifyCartUpdated } from "@/src/utils/cartEvent";
import { showToast } from "@/src/utils/toast";

const SORT_OPTIONS = [
  { key: "promo", label: "Khuyến mãi tốt nhất" },
  { key: "price_asc", label: "Giá tăng dần" },
  { key: "price_desc", label: "Giá giảm dần" },
  { key: "newest", label: "Sản phẩm mới nhất" },
  { key: "bestseller", label: "Sản phẩm bán chạy nhất" },
];

export default function WishlistPage() {
  const { branchId } = useBranch();
  const { isWishlisted, refreshWishlist } = useWishlist();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSortKey, setActiveSortKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await wishlistService.getWishlist();
        if (res.status === "success" && Array.isArray(res.data)) {
          const mapped: ProductProps[] = res.data.map((item: any) => {
            const p = item.product || item;
            const productIdStr = String(p.id || p.productId || item.productId);

            return {
              id: productIdStr,
              slug: productIdStr,
              title: p.name || p.title,
              brand: p.brandName || p.categoryName || "URBANMART",
              image: p.imageUrl || p.image || "/images/Banner1.jpeg",
              price: p.displayPrice ?? p.price ?? 0,
              originalPrice:
                p.basePrice > p.displayPrice ? p.basePrice : p.originalPrice,
              discountPercent: p.discountPercent || undefined,
              unit: p.unit || "Cái",
              stockQuantity: p.stockQuantity ?? 1,
              isWishlisted: true,
              isLiked: true,
            };
          });
          setProducts(mapped);

          refreshWishlist();
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [refreshWishlist]);

  const sortedProducts = useMemo(() => {
    if (!activeSortKey) return products;

    const list = [...products];
    switch (activeSortKey) {
      case "promo":
        return list.sort(
          (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0),
        );
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      default:
        return list;
    }
  }, [products, activeSortKey]);

  const handleSortClick = (key: string) => {
    setActiveSortKey((prevKey) => (prevKey === key ? null : key));
  };

  const handleAddToCart = async (productId: string) => {
    if (!branchId) {
      showToast.error("Vui lòng chọn siêu thị trước khi thêm vào giỏ!");
      return;
    }

    try {
      const res = await cartService.addToCart({
        branchId,
        productId,
        quantity: 1,
      });

      if (res.status === "success") {
        showToast.success("Đã thêm sản phẩm vào giỏ hàng!");
        notifyCartUpdated();
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      showToast.error("Thêm vào giỏ hàng thất bại!");
    }
  };

  const handleToggleWishlist = (productId: string, isWishlisted: boolean) => {
    if (!isWishlisted) {
      setProducts((prev) =>
        prev.filter((item) => String(item.id) !== String(productId)),
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4 pb-4 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Sản phẩm yêu thích
        </h1>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
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
                    ? "border-blue-700 text-blue-900 bg-blue-50/60 font-bold"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-slate-50 animate-pulse rounded-lg border border-slate-100 p-4"
            />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            Bạn chưa có sản phẩm nào trong danh sách yêu thích.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {sortedProducts.map((product, index) => (
            <ProductCard
              key={product.id || `wishlist-item-${index}`}
              {...product}
              isWishlisted={isWishlisted(product.id) || true}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
