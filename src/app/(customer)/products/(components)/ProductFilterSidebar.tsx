"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FunnelIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  categoriesService,
  CategoryItem,
} from "@/src/services/customer/categoriesService";
import PriceRangeFilter from "./PriceRangeFilter";
import CategoryTreeFilter from "./CategoryTreeFilter";

interface FilterState {
  minPrice: number;
  maxPrice: number;
  selectedCategoryIds: string[];
}

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export default function ProductFilterSidebar({
  onFilterChange,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get("categoryId");
  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");

  const [minPrice, setMinPrice] = useState<number>(
    urlMinPrice ? Number(urlMinPrice) : 0,
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    urlMaxPrice ? Number(urlMaxPrice) : 10000000,
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rootL1Id, setRootL1Id] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoriesService.getCategories();
        if (res && res.data && Array.isArray(res.data)) {
          setAllCategories(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục lọc:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const findRootL1Category = (
    catList: CategoryItem[],
    targetId: string,
  ): CategoryItem | null => {
    for (const l1 of catList) {
      if (l1.id === targetId) return l1;
      if (l1.children) {
        for (const l2 of l1.children) {
          if (l2.id === targetId) return l1;
          if (l2.children) {
            for (const l3 of l2.children) {
              if (l3.id === targetId) return l1;
            }
          }
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (currentCategoryId && allCategories.length > 0) {
      const rootL1 = findRootL1Category(allCategories, currentCategoryId);
      if (rootL1 && !rootL1Id) {
        setRootL1Id(rootL1.id);
      }
      setSelectedCategoryIds([currentCategoryId]);
    } else if (currentCategoryId) {
      setSelectedCategoryIds([currentCategoryId]);
    } else {
      setSelectedCategoryIds([]);
    }
  }, [currentCategoryId, allCategories]);

  const activeCategoryTree = useMemo(() => {
    if (allCategories.length === 0) return [];
    if (rootL1Id) {
      const rootNode = allCategories.find((cat) => cat.id === rootL1Id);
      if (rootNode) return [rootNode];
    }
    if (currentCategoryId) {
      const rootNode = findRootL1Category(allCategories, currentCategoryId);
      if (rootNode) return [rootNode];
    }
    return allCategories;
  }, [allCategories, rootL1Id, currentCategoryId]);

  const handleCategoryToggle = (categoryId: string) => {
    const updated = selectedCategoryIds.includes(categoryId)
      ? []
      : [categoryId];
    setSelectedCategoryIds(updated);

    const params = new URLSearchParams(searchParams.toString());
    if (updated.length > 0) {
      params.set("categoryId", updated[0]);
    } else if (rootL1Id) {
      params.set("categoryId", rootL1Id);
      setSelectedCategoryIds([rootL1Id]);
    } else {
      params.delete("categoryId");
    }

    router.push(`${pathname}?${params.toString()}`);
    if (onFilterChange) {
      onFilterChange({
        minPrice,
        maxPrice,
        selectedCategoryIds:
          updated.length > 0 ? updated : rootL1Id ? [rootL1Id] : [],
      });
    }
  };

  const handlePriceChange = (newMin: number, newMax: number) => {
    setMinPrice(newMin);
    setMaxPrice(newMax);

    const params = new URLSearchParams(searchParams.toString());

    if (newMin > 0) {
      params.set("minPrice", newMin.toString());
    } else {
      params.delete("minPrice");
    }

    if (newMax < 10000000) {
      params.set("maxPrice", newMax.toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`${pathname}?${params.toString()}`);

    if (onFilterChange) {
      onFilterChange({
        minPrice: newMin,
        maxPrice: newMax,
        selectedCategoryIds,
      });
    }
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(10000000);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");

    if (rootL1Id) {
      setSelectedCategoryIds([rootL1Id]);
      params.set("categoryId", rootL1Id);
    } else {
      setSelectedCategoryIds([]);
      params.delete("categoryId");
    }

    router.push(`${pathname}?${params.toString()}`);
    if (onFilterChange) {
      onFilterChange({
        minPrice: 0,
        maxPrice: 10000000,
        selectedCategoryIds: rootL1Id ? [rootL1Id] : [],
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-5 text-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-[#0d5c3a]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bộ lọc tìm kiếm
          </h3>
        </div>
        {(selectedCategoryIds.length > 0 ||
          minPrice > 0 ||
          maxPrice < 10000000) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowPathIcon className="w-3 h-3" />
            <span>Thiết lập lại</span>
          </button>
        )}
      </div>

      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChange={handlePriceChange}
      />

      <CategoryTreeFilter
        activeCategoryTree={activeCategoryTree}
        selectedCategoryIds={selectedCategoryIds}
        loading={loading}
        onCategoryToggle={handleCategoryToggle}
      />
    </div>
  );
}
