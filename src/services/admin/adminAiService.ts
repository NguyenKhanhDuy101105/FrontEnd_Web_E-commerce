import axiosClient from "@/src/lib/axiosClient";

export interface ReindexRecipesData {
  indexedRecipes: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const adminAiService = {
  reindexRecipes: async (): Promise<ApiResponse<ReindexRecipesData>> => {
    const response = await axiosClient.post<ApiResponse<ReindexRecipesData>>(
      "/api/v1/admin/ai/recipes/reindex",
    );
    return response.data;
  },
};
