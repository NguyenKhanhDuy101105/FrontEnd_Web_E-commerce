"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/src/components/common/ProductCard";
import { productService } from "@/src/services/customer/productService";

interface RelatedProductsProps {
  categoryId: string;
  branchId: string;
  currentProductId: string;
}

export default function RelatedProducts({
  categoryId,
  branchId,
  currentProductId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductsByCategory(
          categoryId,
          {
            branchId,
            includeDescendants: true,
            page: 0,
            size: 15,
          },
        );

        if (response?.status === "success" && response?.data?.content) {
          const filtered = response.data.content.filter(
            (p: any) => p.id !== currentProductId,
          );
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && branchId) {
      fetchRelatedProducts();
    }
  }, [categoryId, branchId, currentProductId]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [products]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement;

      if (firstChild) {
        const cardWidth = firstChild.getBoundingClientRect().width;
        const gap = 16;
        const scrollAmount = (cardWidth + gap) * 2;

        container.scrollBy({
          left: direction === "right" ? scrollAmount : -scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800">
          Sản phẩm liên quan
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-800">Sản phẩm liên quan</h3>

      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/95 text-slate-700 border border-slate-200 shadow-md hover:bg-[#0d5c3a] hover:text-white hover:border-[#0d5c3a] transition-all cursor-pointer active:scale-95"
            title="Lùi 2 sản phẩm"
          >
            <ChevronLeftIcon className="w-5 h-5 stroke-2" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/95 text-slate-700 border border-slate-200 shadow-md hover:bg-[#0d5c3a] hover:text-white hover:border-[#0d5c3a] transition-all cursor-pointer active:scale-95"
            title="Tiến 2 sản phẩm"
          >
            <ChevronRightIcon className="w-5 h-5 stroke-2" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
        >
          {products.map((item) => (
            <div
              key={item.id}
              className="shrink-0 w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                id={item.id}
                slug={item.id}
                title={item.name}
                brand={item.brandName || "URBANMART"}
                price={item.displayPrice ?? item.basePrice ?? 0}
                originalPrice={
                  item.discountPercent ? item.basePrice : undefined
                }
                unit={item.unit}
                image={item.imageUrl || "/images/Banner1.jpeg"}
                isOutOfStock={!item.inStock || (item.stockQuantity ?? 0) <= 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
