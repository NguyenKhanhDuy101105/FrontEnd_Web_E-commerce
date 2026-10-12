"use client";

import Image from "next/image";

export default function TopBanner() {
  return (
    <div className="w-full bg-[#f0fdf4] border-b border-emerald-100">
      <div className="w-full">
        <div className="relative w-full h-20">
          <Image
            src="/images/logomart1.png"
            alt="UrbanMart - Hàng Tốt Mỗi Ngày Cho Cuộc Sống Tiện Nghi"
            fill
            className="object-fill object-center"
            priority
          />
        </div>
      </div>
    </div>
  );
}
