"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
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
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition ${
                selectedImage === img
                  ? "border-emerald-600"
                  : "border-slate-200"
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
