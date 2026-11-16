import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  recipeService,
  RecipeSummaryItem,
  IngredientProductItem,
} from "@/src/services/customer/recipeService";
import { useCart } from "@/src/context/CartContext";

interface RecipeDetailModalProps {
  recipe: RecipeSummaryItem | null;
  branchId: string;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  branchId,
  onClose,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [ingredients, setIngredients] = useState<IngredientProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartSuccessMsg, setCartSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!recipe) return;

    const fetchIngredients = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await recipeService.getRecipeIngredients(recipe.id, {
          branchId,
        });

        const allItems = res.data.groups.flatMap((group) => group.items);
        setIngredients(allItems);
      } catch (err) {
        console.error("Lỗi khi lấy nguyên liệu:", err);
        setError("Không thể tải danh sách nguyên liệu của công thức.");
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [recipe, branchId]);

  if (!recipe) return null;

  const recipeDescription = (recipe as { description?: string }).description;
  const availableIngredients = ingredients.filter((item) => item.inStock);

  const handleProductClick = (productId: string) => {
    onClose();
    router.push(`/products/${productId}`);
  };

  const handleAddAllToCart = async () => {
    if (availableIngredients.length === 0) return;

    setAddingToCart(true);
    setCartSuccessMsg(null);
    setError(null);

    try {
      for (const item of availableIngredients) {
        await addToCart(item.productId, item.quantity || 1);
      }

      setCartSuccessMsg(
        `Đã thêm ${availableIngredients.length} sản phẩm còn hàng vào giỏ!`,
      );
      setTimeout(() => setCartSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Lỗi khi thêm nguyên liệu vào giỏ:", err);
      setError("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-4 sm:p-6 shadow-xl my-auto max-h-[85vh] overflow-y-auto pt-10 sm:pt-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full bg-gray-100 hover:bg-gray-200 z-10"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 pr-8">
          Công thức: {recipe.name}
        </h2>

        {cartSuccessMsg && (
          <div className="mb-4 rounded-xl bg-green-50 p-3 text-xs sm:text-sm font-medium text-green-700 border border-green-200">
            {cartSuccessMsg}
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">
            Nguyên liệu & Sản phẩm
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs sm:text-sm text-gray-500">
              Đang tải danh sách nguyên liệu...
            </div>
          ) : error ? (
            <div className="py-4 text-center text-xs sm:text-sm text-red-500">
              {error}
            </div>
          ) : ingredients.length === 0 ? (
            <div className="py-4 text-center text-xs sm:text-sm text-gray-500">
              Không có thông tin nguyên liệu.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {ingredients.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col justify-between rounded-lg border border-gray-200 p-2.5 sm:p-3 relative bg-white hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleProductClick(item.productId)}
                >
                  <div>
                    <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] sm:text-xs text-white font-medium">
                            Tạm hết hàng
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs font-medium text-gray-800 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                      {item.name}
                    </p>

                    <p className="text-xs sm:text-sm font-bold text-green-700">
                      {item.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>

                  {item.hasSimilarProducts && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(item.productId);
                      }}
                      className="mt-2 sm:mt-3 w-full rounded-lg border border-green-600 py-1 text-[10px] sm:text-xs text-green-600 hover:bg-green-50 transition-colors"
                    >
                      Sản phẩm tương tự
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 sm:pt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
            Hướng dẫn thực hiện
          </h3>
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-lg">
            {recipeDescription && recipeDescription.trim() !== "" ? (
              <p className="whitespace-pre-line">{recipeDescription}</p>
            ) : (
              <p className="text-gray-500 italic">
                Chưa có hướng dẫn chi tiết cho món ăn này.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={handleAddAllToCart}
            disabled={addingToCart || availableIngredients.length === 0}
            className="rounded-lg bg-green-700 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-green-800 disabled:bg-green-300 transition-colors cursor-pointer shadow-sm"
          >
            {addingToCart ? "Đang thêm..." : "Thêm tất cả vào giỏ hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};
