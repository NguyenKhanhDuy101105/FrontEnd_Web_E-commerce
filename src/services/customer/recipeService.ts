import axiosClient from "@/src/lib/axiosClient";

export type CategoryMonAn =
  | "VEGETABLE"
  | "MEAT"
  | "SEAFOOD"
  | "SOUP"
  | "HOTPOT"
  | "VEGETARIAN"
  | "DESSERT"
  | "OTHER";

export interface GetRecipesParams {
  keyword?: string;
  categoryMonAn?: CategoryMonAn;
  page?: number;
  size?: number;
}

export interface RecipeSummaryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  categoryMonAn: CategoryMonAn;
  categoryLabel: string;
  totalIngredients: number;
}

export interface RecipeListResponse {
  status: string;
  message: string;
  data: {
    content: RecipeSummaryItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetRecipeIngredientsParams {
  branchId: string;
}

export interface SimilarProduct {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  unit: string;
}

export interface IngredientProductItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  unit: string;
  quantity: number;
  isRequired: boolean;
  note: string;
  inStock: boolean;
  availableQuantity: number;
  hasSimilarProducts: boolean;
  similarProducts: SimilarProduct[];
}

export interface IngredientGroupData {
  group: string;
  groupName: string;
  items: IngredientProductItem[];
}

export interface RecipeIngredientsData {
  recipeId: string;
  recipeName: string;
  branchId: string;
  groups: IngredientGroupData[];
}

export interface RecipeIngredientsResponse {
  status: string;
  message: string;
  data: RecipeIngredientsData;
}

export const recipeService = {
  /**
   * 1. Lấy danh sách công thức món ăn (Public - Có tìm kiếm & phân trang)
   * GET /api/v1/recipes
   */
  getRecipes: async (
    params?: GetRecipesParams,
  ): Promise<RecipeListResponse> => {
    const response = await axiosClient.get<RecipeListResponse>(
      "/api/v1/recipes",
      {
        params: {
          keyword: params?.keyword,
          categoryMonAn: params?.categoryMonAn,
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      },
    );
    return response.data;
  },

  /**
   * 2. Lấy danh sách nguyên liệu và trạng thái tồn kho theo chi nhánh chọn trước
   * GET /api/v1/recipes/{id}/ingredients
   */
  getRecipeIngredients: async (
    id: string,
    params: GetRecipeIngredientsParams,
  ): Promise<RecipeIngredientsResponse> => {
    const response = await axiosClient.get<RecipeIngredientsResponse>(
      `/api/v1/recipes/${id}/ingredients`,
      {
        params: {
          branchId: params.branchId,
        },
      },
    );
    return response.data;
  },
};
