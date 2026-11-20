"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  CubeIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { RecipeIngredientSuggestion } from "@/src/services/customer/aiService";
import { useCart } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";

export interface AiIngredientProduct extends RecipeIngredientSuggestion {
  productName?: string;
  productSlug?: string;
  price?: number;
  unit?: string;
}

interface AiIngredientItemCardProps {
  ingredient: AiIngredientProduct;
}

const GROUP_LABELS: Record<string, string> = {
  MAIN: "Nguyên liệu chính",
  SPICE: "Gia vị",
  SUB: "Ăn kèm",
  SAUCE: "Nước sốt",
};

export default function AiIngredientItemCard({
  ingredient,
}: AiIngredientItemCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getItemQuantity, addToCart, updateQuantity } = useCart();

  const cartQuantity = getItemQuantity(ingredient.productId);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkAuth = (): boolean => {
    if (typeof window === "undefined") return false;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      showToast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    return true;
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth() || isUpdating) return;

    setIsUpdating(true);
    try {
      await addToCart(ingredient.productId, ingredient.quantity || 1);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth() || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateQuantity(ingredient.productId, cartQuantity + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth() || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateQuantity(ingredient.productId, cartQuantity - 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const displayName =
    ingredient.productName?.trim() ||
    (ingredient.note &&
    ingredient.note.trim() !== "" &&
    ingredient.note !== "string"
      ? ingredient.note
      : `${ingredient.productId.slice(0, 8)}`);

  const groupLabel = GROUP_LABELS[ingredient.group] || ingredient.group;
  const productDetailHref = `/products/${ingredient.productSlug || ingredient.productId}`;

  return (
    <div className="group flex items-center justify-between gap-2.5 bg-white rounded-xl border border-slate-200/80 p-2 hover:border-emerald-500 hover:shadow-xs transition-all">
      <Link
        href={productDetailHref}
        className="flex items-center gap-2.5 min-w-0 flex-1"
      >
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition-colors shrink-0">
          <CubeIcon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p
              className="text-[11px] font-semibold text-slate-800 group-hover:text-emerald-700 line-clamp-1 transition-colors"
              title={displayName}
            >
              {displayName}
            </p>
            <ArrowTopRightOnSquareIcon className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {typeof ingredient.price === "number" && ingredient.price > 0 && (
              <span className="text-[11px] font-bold text-[#0d5c3a]">
                {new Intl.NumberFormat("vi-VN").format(ingredient.price)}đ
                {ingredient.unit ? `/${ingredient.unit}` : ""}
              </span>
            )}

            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              Gợi ý: x{ingredient.quantity}
            </span>

            {groupLabel && (
              <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                {groupLabel}
              </span>
            )}

            {ingredient.isRequired && (
              <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                Bắt buộc
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="shrink-0">
        {cartQuantity > 0 ? (
          <div className="flex items-center gap-1 border border-[#0d5c3a] rounded-lg px-1 py-0.5 bg-emerald-50/40">
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleDecrease}
              className="w-5 h-5 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-100 rounded cursor-pointer disabled:opacity-50"
              title="Giảm số lượng"
            >
              <MinusIcon className="w-3 h-3 stroke-[2.5]" />
            </button>
            <span className="text-[11px] font-bold text-[#0d5c3a] min-w-4 text-center select-none">
              {cartQuantity}
            </span>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleIncrease}
              className="w-5 h-5 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-100 rounded cursor-pointer disabled:opacity-50"
              title="Tăng số lượng"
            >
              <PlusIcon className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleAdd}
            title="Thêm vào giỏ hàng"
            className="p-1.5 rounded-lg border border-[#0d5c3a] text-[#0d5c3a] hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <ShoppingCartIcon className="w-3.5 h-3.5 stroke-2" />
          </button>
        )}
      </div>
    </div>
  );
}
