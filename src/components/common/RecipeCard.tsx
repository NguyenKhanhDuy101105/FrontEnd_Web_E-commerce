import React from "react";
import { RecipeSummaryItem } from "@/src/services/customer/recipeService";

interface RecipeCardProps {
  recipe: RecipeSummaryItem;
  onViewRecipe: (recipe: RecipeSummaryItem) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onViewRecipe,
}) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm line-clamp-1">
          {recipe.name}
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={() => onViewRecipe(recipe)}
          className="w-full rounded-lg bg-green-700 py-2.5 text-xs font-semibold text-white hover:bg-green-800 transition-colors cursor-pointer"
        >
          Xem công thức
        </button>
      </div>
    </div>
  );
};
