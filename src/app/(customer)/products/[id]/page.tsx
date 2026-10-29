"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductTabs from "./components/ProductTabs";
import ProductReviews from "./components/ProductReviews";
import RelatedProducts from "./components/RelatedProducts";
import { productService } from "@/src/services/customer/productService";
import { showToast } from "@/src/utils/toast";
import { useCart } from "@/src/context/CartContext";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [branchId, setBranchId] = useState<string>("");

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const savedBranchId =
          localStorage.getItem("selectedBranchId") ||
          "02a024ec-18dc-42b1-8f85-37d893e99581";

        setBranchId(savedBranchId);

        const response = await productService.getProductById(id, savedBranchId);

        if (response?.status === "success" && response?.data) {
          const rawData = response.data;

          setProduct({
            ...rawData,
            price: rawData.displayPrice ?? rawData.basePrice ?? 0,
            originalPrice: rawData.discountPercent ? rawData.basePrice : null,
            images: rawData.imageUrl
              ? [rawData.imageUrl]
              : ["/images/Banner1.jpeg"],
            isOutOfStock: !rawData.inStock || (rawData.stockQuantity ?? 0) <= 0,
          });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        showToast.error("Không thể tải thông tin sản phẩm!");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const handleAddToCart = async (qty: number) => {
    if (!product) return;
    try {
      await addToCart(product.id, qty);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
    }
  };

  const handleBuyNow = (targetQty: number) => {
    if (!product) return;
    try {
      const buyNowItem = {
        id: product.id,
        itemId: product.id,
        productId: product.id,
        name: product.name,
        productName: product.name,
        title: product.name,
        price: product.price,
        unitPrice: product.price,
        subtotal: product.price * targetQty,
        quantity: targetQty,
        unit: product.unit || "Cái",
        imageUrl: product.imageUrl || product.images?.[0],
        image: product.imageUrl || product.images?.[0],
      };

      sessionStorage.setItem("buy_now_item", JSON.stringify(buyNowItem));
      router.push("/checkout?buyNow=true");
    } catch (error) {
      console.error("Lỗi xử lý mua ngay:", error);
      showToast.error("Có lỗi xảy ra khi chuyển sang trang thanh toán!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-600 text-sm">
        Sản phẩm không tồn tại hoặc đã bị ngừng kinh doanh!
      </div>
    );
  }

  const categoryIdForRelated = product.categoryId;

  return (
    <div className="bg-slate-50/50 min-h-screen pt-4 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-emerald-600">
            Trang chủ
          </Link>
          <span>/</span>
          {product.categoryName && (
            <>
              <Link
                href={`/categories/${categoryIdForRelated}`}
                className="hover:text-emerald-600"
              >
                {product.categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-800 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="bg-white rounded-xl border border-slate-200/80 p-6 grid grid-cols-1 md:grid-cols-12 gap-8 shadow-xs">
          <div className="md:col-span-5">
            <ProductGallery images={product.images} name={product.name} />
          </div>
          <div className="md:col-span-7">
            <ProductInfo
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={() => handleAddToCart(quantity)}
              onBuyNow={() => handleBuyNow(quantity)}
            />
          </div>
        </div>

        <ProductTabs product={product} />

        <ProductReviews productId={product.id} />

        {categoryIdForRelated && branchId && (
          <RelatedProducts
            categoryId={categoryIdForRelated}
            branchId={branchId}
            currentProductId={product.id}
          />
        )}
      </div>
    </div>
  );
}
