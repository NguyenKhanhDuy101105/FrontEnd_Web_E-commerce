"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CategoryMonAn,
  recipeService,
  RecipeSummaryItem,
} from "@/src/services/customer/recipeService";
import { RecipeCard } from "@/src/components/common/RecipeCard";
import { RecipeDetailModal } from "@/src/components/common/RecipeDetailModal";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const CATEGORY_TABS: { key: CategoryMonAn; label: string }[] = [
  { key: "VEGETABLE", label: "Món rau, củ" },
  { key: "MEAT", label: "Món thịt" },
  { key: "SEAFOOD", label: "Hải sản" },
  { key: "SOUP", label: "Món canh - hầm" },
  { key: "HOTPOT", label: "Món lẩu" },
  { key: "VEGETARIAN", label: "Món chay" },
  { key: "DESSERT", label: "Tráng miệng" },
  { key: "OTHER", label: "Khác" },
];

interface RecipesSectionProps {
  branchId: string;
}

export const RecipesSection: React.FC<RecipesSectionProps> = ({ branchId }) => {
  const [activeCategory, setActiveCategory] =
    useState<CategoryMonAn>("VEGETABLE");

  const [recipesCache, setRecipesCache] = useState<
    Partial<Record<CategoryMonAn, RecipeSummaryItem[]>>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeSummaryItem | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentRecipes = recipesCache[activeCategory] || [];
  const isInitialLoading = loading && !recipesCache[activeCategory];

  const checkScrollability = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRecipes = async () => {
      if (recipesCache[activeCategory]) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await recipeService.getRecipes({
          categoryMonAn: activeCategory,
          page: 0,
          size: 20,
        });
        if (isMounted) {
          setRecipesCache((prev) => ({
            ...prev,
            [activeCategory]: res.data.content || [],
          }));
        }
      } catch (err) {
        console.error("Lỗi khi tải công thức món ăn:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, recipesCache]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
    const timer = setTimeout(checkScrollability, 50);
    window.addEventListener("resize", checkScrollability);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [activeCategory, currentRecipes.length]);

  const handleScroll = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 mb-4">
          Cơm nhà tròn vị
        </h2>

        <div className="flex gap-6 border-b border-gray-100 overflow-x-auto no-scrollbar mb-6">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                  isActive
                    ? "text-green-700"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeRecipeTabIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="min-h-61.25 relative">
          {isInitialLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-[calc((100%-1rem)/2)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)] bg-white rounded-xl border border-gray-100 p-2.5 space-y-3 animate-pulse"
                >
                  <div className="w-full aspect-square bg-gray-200/80 rounded-lg" />
                  <div className="h-9 w-full bg-gray-200/80 rounded-lg" />
                </div>
              ))}
            </div>
          ) : currentRecipes.length === 0 ? (
            <div className="h-61.25 flex items-center justify-center text-gray-400 text-sm">
              Chưa có công thức nào cho mục này.
            </div>
          ) : (
            <div className="relative group">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  aria-label="Lướt sang trái"
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/95 border border-gray-200 shadow-md text-gray-700 hover:text-green-700 hover:border-green-600 transition-all absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  ref={sliderRef}
                  onScroll={checkScrollability}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1"
                >
                  {currentRecipes.map((item) => (
                    <div
                      key={item.id}
                      className="shrink-0 snap-start w-[calc((100%-1rem)/2)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)]"
                    >
                      <RecipeCard
                        recipe={item}
                        onViewRecipe={(recipe) => setSelectedRecipe(recipe)}
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  aria-label="Lướt sang phải"
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/95 border border-gray-200 shadow-md text-gray-700 hover:text-green-700 hover:border-green-600 transition-all absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        <RecipeDetailModal
          recipe={selectedRecipe}
          branchId={branchId}
          onClose={() => setSelectedRecipe(null)}
        />
      </div>
    </section>
  );
};

export default RecipesSection;
