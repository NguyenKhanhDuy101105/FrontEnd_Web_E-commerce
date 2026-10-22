"use client";

import Image from "next/image";
import Link from "next/link";

interface SubCategory {
  id: string;
  name: string;
  imageUrl: string;
  link: string;
}

interface CategoryBlock {
  id: string;
  title: string;
  bannerImage: string;
  bannerTitle: string;
  bannerBgColor: string;
  mainCategoryLink: string;
  items: SubCategory[];
}

const CATEGORY_DATA: CategoryBlock[] = [
  {
    id: "thuc-pham-tuoi-song",
    title: "Thực phẩm tươi sống",
    bannerImage:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
    bannerTitle: "THỰC PHẨM TƯƠI SỐNG",
    bannerBgColor: "bg-emerald-600",
    mainCategoryLink: "/products?category=thuc-pham-tuoi-song",
    items: [
      {
        id: "rau-cu",
        name: "Rau củ",
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300",
        link: "/products?category=rau-cu",
      },
      {
        id: "trai-cay",
        name: "Trái cây",
        imageUrl:
          "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300",
        link: "/products?category=trai-cay",
      },
      {
        id: "thit",
        name: "Thịt",
        imageUrl:
          "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300",
        link: "/products?category=thit",
      },
      {
        id: "thuy-hai-san",
        name: "Thủy hải sản",
        imageUrl:
          "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300",
        link: "/products?category=thuy-hai-san",
      },
    ],
  },
  {
    id: "thuc-pham-dong-goi",
    title: "Thực phẩm đóng gói",
    bannerImage:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600",
    bannerTitle: "THỰC PHẨM ĐÓNG GÓI",
    bannerBgColor: "bg-orange-600",
    mainCategoryLink: "/products?category=thuc-pham-dong-goi",
    items: [
      {
        id: "banh-keo-snack",
        name: "Bánh, kẹo, snack",
        imageUrl:
          "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=300",
        link: "/products?category=banh-keo-snack",
      },
      {
        id: "sua-san-pham-tu-sua",
        name: "Sữa, sản phẩm từ sữa",
        imageUrl:
          "https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=300",
        link: "/products?category=sua-san-pham-tu-sua",
      },
      {
        id: "thuc-uong",
        name: "Thức uống",
        imageUrl:
          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300",
        link: "/products?category=thuc-uong",
      },
      {
        id: "gao-gia-vi",
        name: "Gạo, gia vị, thực phẩm khô",
        imageUrl:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300",
        link: "/products?category=gao-gia-vi",
      },
    ],
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-4 sm:py-6 bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {CATEGORY_DATA.map((block) => (
            <div
              key={block.id}
              className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col space-y-3 sm:space-y-4"
            >
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {block.title}
              </h2>

              <div className="grid grid-cols-12 border border-slate-100 rounded-xl overflow-hidden min-h-80 sm:min-h-96">
                <Link
                  href={block.mainCategoryLink}
                  className="col-span-5 relative group overflow-hidden flex flex-col justify-end cursor-pointer"
                >
                  <div className="absolute inset-0 bg-slate-100">
                    <Image
                      src={block.bannerImage}
                      alt={block.bannerTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div
                    className={`relative z-10 p-3 sm:p-4 text-white ${block.bannerBgColor} bg-opacity-90 backdrop-blur-xs`}
                  >
                    <h3 className="font-black text-xs sm:text-sm md:text-base leading-tight uppercase tracking-wider mb-2">
                      {block.bannerTitle}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition-colors">
                      Mua ngay &gt;
                    </span>
                  </div>
                </Link>

                <div className="col-span-7 grid grid-cols-2 divide-x divide-y divide-slate-100 bg-white">
                  {block.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="flex flex-col items-center justify-between p-3 sm:p-4 hover:bg-emerald-50/30 transition-colors group text-center cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-8 flex items-center">
                        {item.name}
                      </span>

                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 my-2">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
