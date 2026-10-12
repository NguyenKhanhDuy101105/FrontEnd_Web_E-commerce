"use client";

import { useEffect, useState } from "react";
import ProductSectionSlider from "@/src/components/common/ProductSectionSlider";
import { ProductProps } from "@/src/components/common/ProductCard";
import { useBranch } from "@/src/context/BranchContext";
import { productService } from "@/src/services/customer/productService";
import { cartService } from "@/src/services/customer/cartService";
import { notifyCartUpdated } from "@/src/utils/cartEvent";
import { showToast } from "@/src/utils/toast";

export default function DailyFreshProducts() {
  const { branchId } = useBranch();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!branchId) return;

    const fetchDailyFresh = async () => {
      setLoading(true);
      try {
        const res = await productService.getDailyFreshProducts({
          branchId,
          page: 0,
          size: 10,
        });

        if (res.status === "success" && res.data?.content) {
          const mappedProducts: ProductProps[] = res.data.content.map(
            (item) => ({
              id: item.id,
              slug: item.id,
              title: item.name,
              brand: item.brandName || item.categoryName || "UrbanMart",
              image: item.imageUrl || "/images/Banner1.jpeg",
              price: item.displayPrice,
              originalPrice:
                item.basePrice > item.displayPrice ? item.basePrice : undefined,
              discountPercent: item.discountPercent || undefined,
              unit: item.unit || "Sản phẩm",
              stockQuantity: item.stockQuantity ?? 0,
              inStock: item.inStock,
            }),
          );
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm tươi hàng ngày:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyFresh();
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
      title="Hàng Tươi Mỗi Ngày"
      badgeText="Tươi ngon 100%"
      seeMoreUrl="/products?type=daily-fresh"
      products={products}
      loading={loading}
      emptyText="Hiện chưa có sản phẩm tươi sống nào tại chi nhánh này."
      headerBgColor="bg-cyan-600"
      borderColor="border-cyan-600"
      badgeBgColor="bg-white"
      badgeTextColor="text-cyan-700"
      onAddToCart={handleAddToCart}
    />
  );
}
