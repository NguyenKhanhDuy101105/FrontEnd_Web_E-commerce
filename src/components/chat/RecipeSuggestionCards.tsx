"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  TagIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { RecipeSuggestionItem } from "@/src/services/customer/aiService";
import { useCart } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";
import AiIngredientItemCard, {
  AiIngredientProduct,
} from "./AiIngredientItemCard";

interface RecipeSuggestionCardsProps {
  suggestions: RecipeSuggestionItem[];
}

const getValidRecipeImageUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== "string" || !url.trim()) {
    return null;
  }

  let trimmed = url.trim();
  const httpsIndex = trimmed.indexOf("https://");
  const httpIndex = trimmed.indexOf("http://");

  if (httpsIndex !== -1) {
    trimmed = trimmed.substring(httpsIndex);
  } else if (httpIndex !== -1) {
    trimmed = trimmed.substring(httpIndex);
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsedUrl = new URL(trimmed);
      const allowedHostnames = [
        "encrypted-tbn0.gstatic.com",
        "res.cloudinary.com",
        "images.unsplash.com",
        "lotte.vn",
      ];
      return allowedHostnames.includes(parsedUrl.hostname) ? trimmed : null;
    } catch {
      return null;
    }
  }

  return `/${trimmed}`;
};

const RecipeImageBanner = ({
  imageUrl,
  alt,
}: {
  imageUrl?: string;
  alt: string;
}) => {
  const [hasError, setHasError] = useState(false);
  const validSrc = getValidRecipeImageUrl(imageUrl);

  if (!validSrc || hasError) return null;

  return (
    <div className="relative w-full h-32 bg-slate-200 overflow-hidden">
      <Image
        src={validSrc}
        alt={alt}
        fill
        sizes="(max-width: 640px) 90vw, 400px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

const SingleRecipeCard = ({ item }: { item: RecipeSuggestionItem }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { getItemQuantity, addToCart } = useCart();
  const [isAddingAll, setIsAddingAll] = useState(false);

  const ingredients = (item.ingredients || []) as AiIngredientProduct[];

  // Kiểm tra xem tất cả nguyên liệu của món đã có trong giỏ chưa
  const allAddedToCart =
    ingredients.length > 0 &&
    ingredients.every((ing) => getItemQuantity(ing.productId) > 0);

  const handleAddAllIngredients = async () => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      showToast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAddingAll || ingredients.length === 0) return;

    setIsAddingAll(true);
    try {
      // Lọc các nguyên liệu chưa có trong giỏ (hoặc thêm đủ số lượng gợi ý)
      const itemsToAdd = ingredients.filter(
        (ing) => getItemQuantity(ing.productId) === 0,
      );

      const targetList = itemsToAdd.length > 0 ? itemsToAdd : ingredients;

      await Promise.all(
        targetList.map((ing) => addToCart(ing.productId, ing.quantity || 1)),
      );

      showToast.success(
        `Đã thêm ${targetList.length} nguyên liệu của món "${item.name}" vào giỏ hàng!`,
      );
    } catch (error) {
      console.error("Lỗi khi thêm tất cả nguyên liệu:", error);
      showToast.error("Có lỗi xảy ra khi thêm một số nguyên liệu vào giỏ!");
    } finally {
      setIsAddingAll(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden shadow-2xs">
      <RecipeImageBanner imageUrl={item.imageUrl} alt={item.name} />

      <div className="p-2.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-slate-900 text-[13px] leading-snug">
            {item.name}
          </h4>
          {item.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 shrink-0">
              <TagIcon className="w-3 h-3" />
              {item.category}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {item.description}
          </p>
        )}

        {item.reason && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-900 leading-relaxed">
            <span className="font-semibold">Gợi ý: </span>
            {item.reason}
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="pt-1.5 border-t border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1">
                <ShoppingBagIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nguyên liệu cần chuẩn bị ({ingredients.length})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {ingredients.map((ing, idx) => (
                <AiIngredientItemCard
                  key={`${item.recipeId}-ing-${ing.productId}-${idx}`}
                  ingredient={ing}
                />
              ))}
            </div>

            {/* Nút Thêm tất cả vào giỏ hàng */}
            <button
              type="button"
              disabled={isAddingAll}
              onClick={handleAddAllIngredients}
              className={`w-full py-2 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs ${
                allAddedToCart
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]"
              }`}
            >
              {isAddingAll ? (
                <span>Đang thêm tất cả vào giỏ...</span>
              ) : allAddedToCart ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 stroke-2 shrink-0" />
                  <span>Đã có đủ trong giỏ (Thêm lại x1 bộ)</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4 stroke-2 shrink-0" />
                  <span>
                    Thêm tất cả ({ingredients.length} nguyên liệu) vào giỏ
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RecipeSuggestionCards({
  suggestions,
}: RecipeSuggestionCardsProps) {
  return (
    <div className="mt-2.5 space-y-2.5">
      {suggestions.map((item) => (
        <SingleRecipeCard key={item.recipeId} item={item} />
      ))}
    </div>
  );
}
