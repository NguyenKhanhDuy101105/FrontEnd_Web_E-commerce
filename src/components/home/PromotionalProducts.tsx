"use client";

import { useEffect, useState } from "react";
import ProductSectionSlider from "@/src/components/common/ProductSectionSlider";
import { ProductProps } from "@/src/components/common/ProductCard";
import { useBranch } from "@/src/context/BranchContext";
import { productService } from "@/src/services/customer/productService";
import { cartService } from "@/src/services/customer/cartService";
import { showToast } from "@/src/utils/toast";
import { notifyCartUpdated } from "@/src/utils/cartEvent";

export default function PromotionalProducts() {
  const { branchId } = useBranch();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!branchId) return;

    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res = await productService.getPromotionProducts({
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
            }),
          );
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm khuyến mãi:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [branchId]);

  const handleAddToCart = async (productId: string) => {
    if (!branchId) {
      showToast.error("Vui lòng chọn chi nhánh trước khi thêm vào giỏ!");
      return;
    }

    try {
      await cartService.addToCart({
        branchId,
        productId,
        quantity: 1,
      });
      showToast.success("Đã thêm sản phẩm vào giỏ hàng!");
      notifyCartUpdated();
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    }
  };

  if (!branchId) return null;

  return (
    <ProductSectionSlider
      title="Khuyến Mãi Hot"
      badgeText="Ưu đãi lớn"
      seeMoreUrl="/promotions"
      products={products}
      loading={loading}
      headerBgColor="bg-orange-500"
      borderColor="border-orange-500"
      badgeBgColor="bg-white"
      badgeTextColor="text-orange-600"
      onAddToCart={handleAddToCart}
    />
  );
}
