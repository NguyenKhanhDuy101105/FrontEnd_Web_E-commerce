"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { RecipeIngredientSuggestion } from "@/src/services/customer/aiService";
import { useCart } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";

interface ChatIngredientProductProps {
  ingredient: RecipeIngredientSuggestion;
}

const GROUP_LABELS: Record<string, string> = {
  MAIN: "Nguyên liệu chính",
  SPICE: "Gia vị",
  SUB: "Ăn kèm",
  SAUCE: "Nước sốt",
};

export default function ChatIngredientProduct({
  ingredient,
}: ChatIngredientProductProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getItemQuantity, addToCart, updateQuantity } = useCart();

  const cartQuantity = getItemQuantity(ingredient.productId);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const checkAuth = (): boolean => {
    if (typeof window === "undefined") return false;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      showToast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!checkAuth() || isCartLoading) return;
    setIsCartLoading(true);
    try {
      await addToCart(ingredient.productId, ingredient.quantity || 1);
    } catch (error) {
      console.error("Lỗi thêm nguyên liệu vào giỏ:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleIncrease = async () => {
    if (!checkAuth() || isCartLoading) return;
    setIsCartLoading(true);
    try {
      await updateQuantity(ingredient.productId, cartQuantity + 1);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleDecrease = async () => {
    if (!checkAuth() || isCartLoading) return;
    setIsCartLoading(true);
    try {
      await updateQuantity(ingredient.productId, cartQuantity - 1);
    } finally {
      setIsCartLoading(false);
    }
  };

  const displayName =
    ingredient.note &&
    ingredient.note.trim() !== "" &&
    ingredient.note !== "string"
      ? ingredient.note
      : `Nguyên liệu #${ingredient.productId.slice(0, 8)}`;

  const groupLabel = GROUP_LABELS[ingredient.group] || ingredient.group;

  return (
    <div className="flex items-center justify-between gap-2.5 bg-white rounded-lg border border-slate-200/80 p-2 hover:border-emerald-400 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
        <CubeIcon className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[11px] font-semibold text-slate-800 line-clamp-1"
          title={displayName}
        >
          {displayName}
        </p>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
            SL: x{ingredient.quantity}
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

      <div className="shrink-0">
        {cartQuantity > 0 ? (
          <div className="flex items-center gap-1 border border-[#0d5c3a] rounded-md px-1 py-0.5 bg-white">
            <button
              type="button"
              disabled={isCartLoading}
              onClick={handleDecrease}
              className="w-5 h-5 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-50 rounded cursor-pointer disabled:opacity-50"
              title="Giảm số lượng"
            >
              <MinusIcon className="w-3 h-3 stroke-[2.5]" />
            </button>
            <span className="text-[11px] font-bold text-[#0d5c3a] min-w-4 text-center">
              {cartQuantity}
            </span>
            <button
              type="button"
              disabled={isCartLoading}
              onClick={handleIncrease}
              className="w-5 h-5 flex items-center justify-center text-[#0d5c3a] hover:bg-emerald-50 rounded cursor-pointer disabled:opacity-50"
              title="Tăng số lượng"
            >
              <PlusIcon className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isCartLoading}
            onClick={handleAdd}
            title="Thêm vào giỏ hàng"
            className="p-1.5 rounded-lg border border-[#0d5c3a] text-[#0d5c3a] hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <ShoppingCartIcon className="w-3.5 h-3.5 stroke-2" />
          </button>
        )}
      </div>
    </div>
  );
}
