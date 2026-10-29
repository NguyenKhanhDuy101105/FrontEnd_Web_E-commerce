"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useBranch } from "@/src/context/BranchContext";
import {
  productService,
  ProductSearchSuggestion,
} from "@/src/services/customer/productService";

export default function SearchBar() {
  const router = useRouter();
  const { branchId } = useBranch();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || !branchId) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productService.getSearchSuggestions({
          keyword: query.trim(),
          branchId,
          limit: 3,
        });

        const items = res.data || [];
        setSuggestions(Array.isArray(items) ? items : []);
        setIsOpen(true);
      } catch (err) {
        console.error("Lỗi tải gợi ý sản phẩm:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, branchId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleClearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    router.push(`/products/${productId}`);
  };

  return (
    <div className="flex-1 max-w-2xl relative z-110" ref={searchRef}>
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Bạn muốn mua gì hôm nay..."
          className="w-full bg-white text-slate-800 text-sm placeholder-slate-400 rounded-full pl-5 pr-20 py-2 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-200 shadow-sm"
        />

        {query && (
          <button
            type="button"
            onClick={handleClearQuery}
            className="absolute right-11 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Xóa từ khóa"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1.5 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors shadow-md cursor-pointer"
          aria-label="Tìm kiếm"
        >
          <MagnifyingGlassIcon className="w-3.5 h-3.5" />
        </button>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-110 animate-in fade-in slide-in-from-top-1 duration-150">
          {loading ? (
            <div className="p-4 text-xs text-slate-400 text-center">
              Đang tìm gợi ý...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 text-center">
              Không tìm thấy sản phẩm phù hợp
            </div>
          ) : (
            <div>
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 bg-slate-50 uppercase border-b border-slate-100">
                Sản phẩm gợi ý ({suggestions.length})
              </div>

              <div className="divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item.id)}
                    className="flex items-center gap-3 p-3 hover:bg-emerald-50/50 cursor-pointer transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg border border-slate-100 overflow-hidden shrink-0 bg-white">
                      <Image
                        src={item.imageUrl || "/images/Banner1.jpeg"}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.name}
                      </p>
                      {item.categoryName && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.categoryName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-emerald-600">
                          {item.displayPrice.toLocaleString("vi-VN")}đ
                        </span>
                        {item.basePrice &&
                          item.basePrice > item.displayPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {item.basePrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        {item.unit && (
                          <span className="text-[10px] text-slate-400">
                            /{item.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-emerald-600 border-t border-slate-100 transition-colors cursor-pointer"
              >
                Xem tất cả kết quả cho &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
