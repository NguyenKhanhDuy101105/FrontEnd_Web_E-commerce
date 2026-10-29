"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ProductCard, { ProductProps } from "@/src/components/common/ProductCard";

export interface ProductSectionSliderProps {
  title: string;
  badgeText?: string;
  seeMoreUrl?: string;
  products: ProductProps[];
  loading?: boolean;
  emptyText?: string;
  headerBgColor?: string;
  borderColor?: string;
  headerTextColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  onAddToCart?: (productId: string) => void | Promise<void>;
}

export default function ProductSectionSlider({
  title,
  badgeText,
  seeMoreUrl = "/products",
  products,
  loading = false,
  emptyText = "Hiện chưa có sản phẩm nào thuộc danh mục này.",
  headerBgColor = "bg-orange-500",
  borderColor = "border-orange-500",
  headerTextColor = "text-white",
  badgeBgColor = "bg-white",
  badgeTextColor = "text-orange-600",
  onAddToCart, // 2. Nhận onAddToCart
}: ProductSectionSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <div
        className={`bg-white rounded-lg border-4 ${borderColor} shadow-xs overflow-hidden relative group/section`}
      >
        <div
          className={`${headerBgColor} ${headerTextColor} px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 min-h-12`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <h2 className="text-xs sm:text-base md:text-xl font-extrabold uppercase tracking-wide truncate leading-tight">
              {title}
            </h2>

            {badgeText && (
              <span
                className={`shrink-0 text-[10px] sm:text-xs font-bold ${badgeBgColor} ${badgeTextColor} px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap hidden min-[360px]:inline-block`}
              >
                {badgeText}
              </span>
            )}
          </div>

          <Link
            href={seeMoreUrl}
            className="shrink-0 text-[11px] sm:text-sm font-bold text-white hover:underline transition-all flex items-center gap-0.5 whitespace-nowrap ml-1"
          >
            <span>Xem tất cả</span>
            <span className="text-xs sm:text-sm">&gt;</span>
          </Link>
        </div>

        {!loading && products.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="absolute left-2 top-[calc(50%+1.25rem)] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-600 rounded-full shadow-md border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer"
              aria-label="Cuộn sang trái"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="absolute right-2 top-[calc(50%+1.25rem)] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-600 rounded-full shadow-md border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer"
              aria-label="Cuộn sang phải"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="p-4 sm:p-5">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 px-0.5"
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-[calc((100%-1*0.75rem)/2)] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1rem)/4)] lg:w-[calc((100%-4*1rem)/5)] h-72 bg-slate-100 animate-pulse rounded-xl"
                />
              ))
            ) : products.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center w-full">
                {emptyText}
              </p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="shrink-0 w-[calc((100%-1*0.75rem)/2)] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1rem)/4)] lg:w-[calc((100%-4*1rem)/5)] snap-start"
                >
                  <ProductCard {...product} onAddToCart={onAddToCart} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
