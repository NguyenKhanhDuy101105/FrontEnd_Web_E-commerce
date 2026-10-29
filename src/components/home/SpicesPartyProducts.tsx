"use client";

import { useEffect, useState } from "react";
import ProductSectionSlider from "@/src/components/common/ProductSectionSlider";
import { ProductProps } from "@/src/components/common/ProductCard";
import { useBranch } from "@/src/context/BranchContext";
import { productService } from "@/src/services/customer/productService";
import { cartService } from "@/src/services/customer/cartService";
import { notifyCartUpdated } from "@/src/utils/cartEvent";
import { showToast } from "@/src/utils/toast";

const SPICES_CATEGORY_ID = "0804f6ff-4a64-4c33-92fc-4f072b88132a";

export default function SpicesPartyProducts() {
  const { branchId } = useBranch();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!branchId) return;

    const fetchSpicesProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          branchId,
          categoryId: SPICES_CATEGORY_ID,
          page: 0,
          size: 10,
        });

        if (
          (res.status === "success" || res.status === "200") &&
          res.data?.content
        ) {
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
        console.error("Lỗi khi tải danh sách Đại tiệc gia vị:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpicesProducts();
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

      if (res.status === "success" || res.status === "200") {
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
      title="Đại Tiệc Gia Vị"
      badgeText="Đậm đà chuẩn vị"
      seeMoreUrl={`/products?categoryId=${SPICES_CATEGORY_ID}`}
      products={products}
      loading={loading}
      emptyText="Hiện chưa có sản phẩm gia vị nào tại chi nhánh này."
      headerBgColor="bg-amber-600"
      borderColor="border-amber-600"
      badgeBgColor="bg-white"
      badgeTextColor="text-amber-700"
      onAddToCart={handleAddToCart}
    />
  );
}
