"use client";

import { useEffect, useState } from "react";
import ProductSectionSlider from "@/src/components/common/ProductSectionSlider";
import { ProductProps } from "@/src/components/common/ProductCard";
import { useBranch } from "@/src/context/BranchContext";
import { productService } from "@/src/services/customer/productService";
import { cartService } from "@/src/services/customer/cartService";
import { notifyCartUpdated } from "@/src/utils/cartEvent";
import { showToast } from "@/src/utils/toast";

export default function BestSellingProducts() {
  const { branchId } = useBranch();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!branchId) return;

    const fetchBestSelling = async () => {
      setLoading(true);
      try {
        const res = await productService.getBestSellingProducts({
          branchId,
          limit: 20,
        });

        if (res.status === "success" && Array.isArray(res.data)) {
          const mappedProducts: ProductProps[] = res.data.map((item) => {
            const product = item.product;
            return {
              id: product.id,
              slug: product.id,
              title: product.name,
              brand: product.brandName || product.categoryName || "UrbanMart",
              image: product.imageUrl || "/images/Banner1.jpeg",
              price: product.displayPrice,
              originalPrice:
                product.basePrice > product.displayPrice
                  ? product.basePrice
                  : undefined,
              discountPercent: product.discountPercent || undefined,
              unit: product.unit || "Sản phẩm",
              stockQuantity: product.stockQuantity ?? 0,
              inStock: product.inStock,
            };
          });
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm bán chạy:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, [branchId]);

  const handleAddToCart = async (productId: string) => {
    if (!branchId) {
      showToast.error("Vui lòng chọn chi nhánh trước khi thêm vào giỏ!");
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

  if (!branchId) return null;

  return (
    <ProductSectionSlider
      title="Sản Phẩm Bán Chạy"
      badgeText="HOT"
      seeMoreUrl="/products?type=best-selling"
      products={products}
      loading={loading}
      emptyText="Hiện chưa có sản phẩm bán chạy nào tại chi nhánh này."
      headerBgColor="bg-orange-600"
      borderColor="border-orange-600"
      badgeBgColor="bg-yellow-400"
      badgeTextColor="text-orange-900"
      onAddToCart={handleAddToCart}
    />
  );
}
