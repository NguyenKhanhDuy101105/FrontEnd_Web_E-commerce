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

export type IngredientGroup = "MAIN" | "SUB" | "SPICE" | string;

export interface RecipeIngredient {
  productId: string;
  quantity: number;
  isRequired: boolean;
  group: IngredientGroup;
  note?: string;
}

export interface GetAdminRecipesParams {
  keyword?: string;
  categoryMonAn?: CategoryMonAn;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface RecipePayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  categoryMonAn: CategoryMonAn;
  isActive: boolean;
  ingredients: RecipeIngredient[];
}

export interface RecipeItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  categoryMonAn: CategoryMonAn;
  categoryLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}

export interface AdminRecipeListResponse {
  status: string;
  message: string;
  data: {
    content: RecipeItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AdminRecipeDetailResponse {
  status: string;
  message: string;
  data: RecipeItem;
}

export interface DeleteAdminRecipeResponse {
  status: string;
  message: string;
  data: string;
}

export const adminRecipeService = {
  /**
   * 1. Lấy danh sách công thức món ăn (Có tìm kiếm, lọc & phân trang)
   * GET /api/v1/admin/recipes
   */
  getRecipes: async (
    params?: GetAdminRecipesParams,
  ): Promise<AdminRecipeListResponse> => {
    const response = await axiosClient.get<AdminRecipeListResponse>(
      "/api/v1/admin/recipes",
      {
        params: {
          keyword: params?.keyword,
          categoryMonAn: params?.categoryMonAn,
          isActive: params?.isActive,
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      },
    );
    return response.data;
  },

  /**
   * 2. Tạo công thức món ăn mới
   * POST /api/v1/admin/recipes
   */
  createRecipe: async (
    payload: RecipePayload,
  ): Promise<AdminRecipeDetailResponse> => {
    const response = await axiosClient.post<AdminRecipeDetailResponse>(
      "/api/v1/admin/recipes",
      payload,
    );
    return response.data;
  },

  /**
   * 3. Lấy chi tiết công thức món ăn theo ID
   * GET /api/v1/admin/recipes/{id}
   */
  getRecipeById: async (id: string): Promise<AdminRecipeDetailResponse> => {
    const response = await axiosClient.get<AdminRecipeDetailResponse>(
      `/api/v1/admin/recipes/${id}`,
    );
    return response.data;
  },

  /**
   * 4. Cập nhật công thức món ăn theo ID
   * PUT /api/v1/admin/recipes/{id}
   */
  updateRecipe: async (
    id: string,
    payload: RecipePayload,
  ): Promise<AdminRecipeDetailResponse> => {
    const response = await axiosClient.put<AdminRecipeDetailResponse>(
      `/api/v1/admin/recipes/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * 5. Xóa công thức món ăn theo ID
   * DELETE /api/v1/admin/recipes/{id}
   */
  deleteRecipe: async (id: string): Promise<DeleteAdminRecipeResponse> => {
    const response = await axiosClient.delete<DeleteAdminRecipeResponse>(
      `/api/v1/admin/recipes/${id}`,
    );
    return response.data;
  },
};
