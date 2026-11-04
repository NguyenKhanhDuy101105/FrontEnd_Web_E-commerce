"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
  isOutOfStock?: boolean;
}

export default function ProductGallery({
  images,
  name,
  isOutOfStock = false,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    images[0] || "/images/Banner1.jpeg",
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square border border-slate-100 rounded-xl overflow-hidden bg-white">
        <Image
          src={selectedImage}
          alt={name}
          fill
          className="object-contain p-4"
          priority
        />

        {isOutOfStock && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-white font-extrabold text-[11px] rounded-md shadow-md z-10 border border-white/20 select-none">
            Tạm hết hàng
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition cursor-pointer ${
                selectedImage === img
                  ? "border-emerald-600 shadow-xs"
                  : "border-slate-200 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
