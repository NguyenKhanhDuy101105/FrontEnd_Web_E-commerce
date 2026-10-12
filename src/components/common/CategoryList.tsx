"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function CategoryList() {
  const categories: CategoryItem[] = [
    {
      id: "1",
      name: "Rau củ, trái cây",
      slug: "rau-cu-trai-cay",
      icon: "/images/categories/fruits.png",
    },
    {
      id: "2",
      name: "Thịt, trứng, hải sản",
      slug: "thit-trung-hai-san",
      icon: "/images/categories/meats.png",
    },
    {
      id: "3",
      name: "Thức ăn chế biến, bún tươi",
      slug: "thuc-an-che-bien",
      icon: "/images/categories/prepared-food.png",
    },
    {
      id: "4",
      name: "Thực phẩm đông, mát",
      slug: "thuc-pham-dong-mat",
      icon: "/images/categories/frozen-food.png",
    },
    {
      id: "5",
      name: "Sữa, sản phẩm từ sữa",
      slug: "sua-san-pham-tu-sua",
      icon: "/images/categories/milk.png",
    },
    {
      id: "6",
      name: "Thức uống",
      slug: "thuc-uong",
      icon: "/images/categories/drinks.png",
    },
    {
      id: "7",
      name: "Bánh, kẹo, snack",
      slug: "banh-keo-snack",
      icon: "/images/categories/snacks.png",
    },
    {
      id: "8",
      name: "Gia vị, gạo, thực phẩm khô",
      slug: "gia-vi-gao-kho",
      icon: "/images/categories/groceries.png",
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
      slug: "nha-cua-doi-song",
      icon: "/images/categories/home-care.png",
    },
    {
      id: "12",
      name: "Shop nổi bật",
      slug: "shop-noi-bat",
      icon: "/images/categories/featured-shop.png",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight">
          Danh mục
        </h2>

        <div className="grid grid-rows-2 grid-flow-col auto-cols-[calc((100%-3*0.75rem)/4)] sm:auto-cols-[calc((100%-3*1rem)/4)] gap-x-3 sm:gap-x-4 gap-y-6 overflow-x-auto scrollbar-none snap-x snap-mandatory lg:grid-cols-6 lg:grid-flow-row lg:overflow-visible">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center group cursor-pointer text-center snap-start"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mb-2 shrink-0">
                <div className="absolute inset-0 bg-[#e8f5e9] rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl group-hover:scale-105 group-hover:bg-[#dcedc8] transition-all duration-300 ease-out" />

                <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 z-10">
                  <Image
                    src={cat.icon}
                    alt={cat.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300 ease-out"
                    sizes="(max-width: 640px) 48px, (max-width: 1024px) 64px, 80px"
                  />
                </div>
              </div>

              <span className="text-[11px] sm:text-xs lg:text-sm font-medium text-slate-700 group-hover:text-[#0d5c3a] transition-colors leading-tight line-clamp-2 max-w-21.25 sm:max-w-25 lg:max-w-27.5">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
