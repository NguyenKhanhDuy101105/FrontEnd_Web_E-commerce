"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

// Danh sách danh mục mẫu (Có thể thay thế bằng dữ liệu từ API)
const categories: Category[] = [
  {
    id: "1",
    name: "Rau củ, trái cây",
    slug: "rau-cu-trai-cay",
    icon: "/images/categories/vegetables.png",
  },
  {
    id: "2",
    name: "Thịt, trứng, hải sản",
    slug: "thit-trung-hai-san",
    icon: "/images/categories/meat.png",
  },
  {
    id: "3",
    name: "Thức ăn chế biến, bún tươi",
    slug: "thuc-an-che-bien",
    icon: "/images/categories/cooked-food.png",
  },
  {
    id: "4",
    name: "Thực phẩm đông, mát",
    slug: "thuc-pham-dong-mat",
    icon: "/images/categories/frozen.png",
  },
  {
    id: "5",
    name: "Bánh, kẹo, snack",
    slug: "banh-keo-snack",
    icon: "/images/categories/snacks.png",
  },
  {
    id: "6",
    name: "Sữa, sản phẩm từ sữa",
    slug: "sua-san-pham-tu-sua",
    icon: "/images/categories/milk.png",
  },
  {
    id: "7",
    name: "Thức uống",
    slug: "thuc-uong",
    icon: "/images/categories/drinks.png",
  },
  {
    id: "8",
    name: "Gia vị, gạo, thực phẩm khô",
    slug: "gia-vi-gao-thuc-pham-kho",
    icon: "/images/categories/spices.png",
  },
  {
    id: "9",
    name: "Sản phẩm cho bé",
    slug: "san-pham-cho-be",
    icon: "/images/categories/baby.png",
  },
  {
    id: "10",
    name: "Chăm sóc cá nhân",
    slug: "cham-soc-ca-nhan",
    icon: "/images/categories/personal-care.png",
  },
  {
    id: "11",
    name: "Nhà cửa và đời sống",
    slug: "nha-cua-va-doi-song",
    icon: "/images/categories/home.png",
  },
  {
    id: "12",
    name: "Hàng nhãn riêng UrbanMart",
    slug: "hang-nhan-rieng",
    icon: "/images/categories/urbanmart-brand.png",
  },
];

export default function CategoriesPage() {
  return (
    /* lg:hidden: Ẩn hoàn toàn trên màn hình Desktop, chỉ hiển thị ở Mobile & Tablet */
    <div className="block lg:hidden min-h-screen bg-slate-50 px-4 pt-3 pb-24">
      {/* 1. Breadcrumb: Trang chủ > Danh mục */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4">
        <Link
          href="/"
          className="hover:text-[#0d5c3a] transition-colors font-medium"
        >
          Trang chủ
        </Link>
        <ChevronRightIcon className="w-3 h-3 text-slate-400 stroke-2" />
        <span className="text-slate-800 font-semibold">Danh mục</span>
      </nav>

      {/* 2. Container chính chứa danh sách danh mục */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
          Danh mục sản phẩm
        </h1>

        <div className="grid grid-cols-3 gap-y-6 gap-x-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center text-center group transition-transform active:scale-95"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 flex items-center justify-center rounded-2xl bg-slate-50 group-hover:bg-emerald-50/60 transition-colors p-2">
                <Image
                  src={cat.icon}
                  alt={cat.name}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>

              <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-[#0d5c3a] transition-colors line-clamp-2 leading-snug">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
