"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/24/outline";
import {
  categoriesService,
  CategoryItem,
} from "@/src/services/customer/categoriesService";

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryItem | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoriesService.getCategories();
        if (res.status === "success" && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHoveredCategory(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 hover:border-emerald-500 rounded-full text-slate-700 hover:text-emerald-600 transition-all duration-200 shadow-xs focus:outline-none cursor-pointer"
      >
        <Bars3Icon className="w-5 h-5 text-slate-600" />
        <span className="text-sm font-medium whitespace-nowrap">
          Danh mục sản phẩm
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute -left-2 mt-2 bg-white rounded-lg shadow-2xl border border-slate-100 flex overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="w-56 bg-slate-50 border-r border-slate-100 py-3 shrink-0 max-h-120 overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                Đang tải danh mục...
              </p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                Chưa có danh mục nào
              </p>
            ) : (
              <ul>
                {categories.map((cat) => {
                  const isHovered = hoveredCategory?.id === cat.id;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={`/products?categoryId=${cat.id}`}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onClick={() => {
                          setIsOpen(false);
                          setHoveredCategory(null);
                        }}
                        className={`block px-4 py-2.5 text-sm transition-all duration-150 font-medium ${
                          isHovered
                            ? "bg-white text-green-600 font-bold shadow-xs"
                            : "text-slate-700 hover:bg-white/60 hover:text-green-700"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hoveredCategory &&
            hoveredCategory.children &&
            hoveredCategory.children.length > 0 && (
              <div className="w-145 p-6 bg-white min-h-100 max-h-120 overflow-y-auto animate-in fade-in duration-150 no-scrollbar">
                <div className="grid grid-cols-3 gap-6 items-start">
                  {hoveredCategory.children.map((subCat) => (
                    <div key={subCat.id} className="space-y-3">
                      <Link
                        href={`/products?categoryId=${subCat.id}`}
                        onClick={() => {
                          setIsOpen(false);
                          setHoveredCategory(null);
                        }}
                        className="block text-sm font-extrabold text-green-700 hover:text-green-900 uppercase tracking-wide border-b border-slate-100 pb-1"
                      >
                        {subCat.name}
                      </Link>

                      {subCat.children && subCat.children.length > 0 && (
                        <ul className="space-y-2">
                          {subCat.children.map((childCat) => (
                            <li key={childCat.id}>
                              <Link
                                href={`/products?categoryId=${childCat.id}`}
                                onClick={() => {
                                  setIsOpen(false);
                                  setHoveredCategory(null);
                                }}
                                className="text-sm text-slate-600 hover:text-green-600 transition-colors block py-0.5"
                              >
                                {childCat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
