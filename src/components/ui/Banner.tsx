"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BannerPair {
  id: string;
  leftBanner: {
    image: string;
    title: string;
    link: string;
  };
  rightBanner: {
    image: string;
    title: string;
    link: string;
  };
}

export default function Banner() {
  const bannerPairs: BannerPair[] = [
    {
      id: "pair-1",
      leftBanner: {
        image: "/images/Banner/Banner1.png",
        title: "Rộn ràng phá cỗ - Ưu đãi thả ga",
        link: "/products?categoryId=bea0212c-c97f-46c1-b443-d65946d8fbae",
      },
      rightBanner: {
        image: "/images/Banner/Banner2.png",
        title: "Khám phá hệ sinh thái đổi điểm UrbanMart",
        link: "/products?categoryId=d57328c7-a5c0-4a25-a976-22bff16bfdbf",
      },
    },
    {
      id: "pair-2",
      leftBanner: {
        image: "/images/Banner/Banner2.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=d57328c7-a5c0-4a25-a976-22bff16bfdbf",
      },
      rightBanner: {
        image: "/images/Banner/Banner3.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=73bd05ae-5ec0-4921-bb03-769338bfbbc9",
      },
    },
    {
      id: "pair-3",
      leftBanner: {
        image: "/images/Banner/Banner3.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=73bd05ae-5ec0-4921-bb03-769338bfbbc9",
      },
      rightBanner: {
        image: "/images/Banner/Banner4.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=f0b4ca9a-65d8-4b71-b4ea-57b62fba74d3",
      },
    },
    {
      id: "pair-4",
      leftBanner: {
        image: "/images/Banner/Banner4.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=f0b4ca9a-65d8-4b71-b4ea-57b62fba74d3",
      },
      rightBanner: {
        image: "/images/Banner/Banner5.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=473015de-4868-461d-8405-758f6f7600a6",
      },
    },
    {
      id: "pair-5",
      leftBanner: {
        image: "/images/Banner/Banner5.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=473015de-4868-461d-8405-758f6f7600a6",
      },
      rightBanner: {
        image: "/images/Banner/Banner6.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=94945dff-c383-455a-bf58-b98519665ec3",
      },
    },
    {
      id: "pair-6",
      leftBanner: {
        image: "/images/Banner/Banner6.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=94945dff-c383-455a-bf58-b98519665ec3",
      },
      rightBanner: {
        image: "/images/Banner/Banner7.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=e6e371c5-a6fc-4626-ba26-173c33d2542c",
      },
    },
    {
      id: "pair-7",
      leftBanner: {
        image: "/images/Banner/Banner7.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=e6e371c5-a6fc-4626-ba26-173c33d2542c",
      },
      rightBanner: {
        image: "/images/Banner/Banner8.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=fff1615d-1a7f-4a4f-9044-76c6bfaedb31",
      },
    },
    {
      id: "pair-7",
      leftBanner: {
        image: "/images/Banner/Banner8.png",
        title: "Thực phẩm tươi sống giao nhanh 2h",
        link: "/products?categoryId=fff1615d-1a7f-4a4f-9044-76c6bfaedb31",
      },
      rightBanner: {
        image: "/images/Banner/Banner1.png",
        title: "Siêu đại tiệc trái cây nhập khẩu",
        link: "/products?categoryId=bea0212c-c97f-46c1-b443-d65946d8fbae",
      },
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === bannerPairs.length - 1 ? 0 : prevIndex + 1,
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [bannerPairs.length]);

  const currentPair = bannerPairs[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 relative z-20 -mt-4 sm:-mt-8 md:-mt-12 lg:-mt-14">
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Link
          href={currentPair.leftBanner.link}
          className="relative w-full h-24 sm:h-36 md:h-44 lg:h-52 rounded-lg overflow-hidden shadow-md sm:shadow-[0_8px_30px_rgba(0,0,0,0.16)] hover:shadow-lg transition-all duration-300 block group bg-white"
        >
          <Image
            src={currentPair.leftBanner.image}
            alt={currentPair.leftBanner.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-in-out"
            priority
          />
        </Link>

        <Link
          href={currentPair.rightBanner.link}
          className="relative w-full h-24 sm:h-36 md:h-44 lg:h-52 rounded-lg overflow-hidden shadow-md sm:shadow-[0_8px_30px_rgba(0,0,0,0.16)] hover:shadow-lg transition-all duration-300 block group bg-white"
        >
          <Image
            src={currentPair.rightBanner.image}
            alt={currentPair.rightBanner.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-in-out"
            priority
          />
        </Link>
      </div>

      <div className="flex items-center justify-center space-x-2 pt-2 sm:pt-3">
        {bannerPairs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === index
                ? "w-4 sm:w-6 bg-emerald-500"
                : "w-1.5 sm:w-2 bg-slate-300 hover:bg-slate-400"
            }`}
            title={`Đến cặp banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
