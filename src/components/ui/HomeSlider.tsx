"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface BannerItem {
  id: string;
  image: string;
  title: string;
  link: string;
}

export default function HomeSlider() {
  const banners: BannerItem[] = [
    {
      id: "1",
      image: "/images/Banner/Banner1.png",
      title: "Rộn ràng phá cỗ - Ưu đãi thả ga",
      link: "/promotions/mid-autumn",
    },
    {
      id: "2",
      image: "/images/Banner/Banner2.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
    {
      id: "3",
      image: "/images/Banner/Banner3.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
    {
      id: "4",
      image: "/images/Banner/Banner4.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
    {
      id: "5",
      image: "/images/Banner/Banner5.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
    {
      id: "6",
      image: "/images/Banner/Banner6.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
    {
      id: "7",
      image: "/images/Banner/Banner7.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
    {
      id: "8",
      image: "/images/Banner/Banner8.png",
      title: "Siêu thị thực phẩm tươi sạch UrbanMart",
      link: "/promotions/fresh-food",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <div className="w-full relative overflow-hidden bg-slate-100">
      <div className="relative w-full h-45 sm:h-55 md:h-65 lg:h-87.5 group">
        <Link
          href={banners[currentIndex].link}
          className="block w-full h-full relative"
        >
          <Image
            src={banners[currentIndex].image}
            alt={banners[currentIndex].title}
            fill
            className="object-cover object-center transition-all duration-500 ease-in-out"
            priority
          />
        </Link>

        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-white/70 hover:bg-white text-slate-800 rounded-full shadow-md hover:shadow-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-10"
          title="Banner trước"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-white/70 hover:bg-white text-slate-800 rounded-full shadow-md hover:shadow-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-10"
          title="Banner tiếp theo"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
