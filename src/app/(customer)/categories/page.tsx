"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoriesService } from "@/src/services/customer/categoriesService";

interface Category {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  icon?: string;
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Rau củ, trái cây": "/images/Category/rau cu qua.png",
  "Sữa và sản phẩm từ sữa": "/images/Category/sua va san pham tu sua.png",
  "Thức ăn chế biến sẵn": "/images/Category/thuc an che bien san.png",
  "Bánh, kẹo, đồ ngọt": "/images/Category/banh keo do ngot.png",
  "Đồ uống": "/images/Category/do uong.png",
  "Gia vị và thực phẩm khô": "/images/Category/giavi do kho.png",
  "Thịt, trứng, hải sản": "/images/Category/thit trung hai san.png",
  "Thực phẩm đông lạnh": "/images/Category/thuc pham dong lanh.png",
};

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoriesService.getCategories();
        if (res?.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data as unknown as { content: Category[] }).content || [];
          setCategories(list);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục ở CategoryList:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryImage = (category: Category): string => {
    if (CATEGORY_IMAGE_MAP[category.name]) {
      return CATEGORY_IMAGE_MAP[category.name];
    }
    return category.imageUrl || category.icon || "/images/Banner1.jpeg";
  };

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight">
          Danh mục sản phẩm
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-slate-100 rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl" />
                <div className="h-4 bg-slate-100 rounded-md w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[calc((100%-3*0.75rem)/4)] sm:auto-cols-[calc((100%-3*1rem)/4)] gap-x-4 sm:gap-x-6 gap-y-8 overflow-x-auto scrollbar-none snap-x snap-mandatory lg:grid-cols-4 lg:grid-flow-row lg:overflow-visible">
            {categories.map((cat) => {
              const categoryImage = getCategoryImage(cat);

              return (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center group cursor-pointer text-center snap-start"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center mb-3 shrink-0">
                    <div className="absolute inset-0 bg-[#e8f5e9] rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl group-hover:scale-105 group-hover:bg-[#dcedc8] transition-all duration-300 ease-out" />

                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 z-10">
                      <Image
                        src={categoryImage}
                        alt={cat.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300 ease-out drop-shadow-xs"
                        sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                      />
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-[#0d5c3a] transition-colors leading-tight line-clamp-2 max-w-28 sm:max-w-36 lg:max-w-40">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
