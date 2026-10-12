import axiosClient from "../../lib/axiosClient";

export interface CategoryItem {
  id: string;
  name: string;
  children: CategoryItem[];
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const categoriesService = {
  /**
   * GET: /api/categories
   * Lấy toàn bộ cây danh mục sản phẩm (bao gồm danh mục cha và các danh mục con lồng nhau)
   */
  getCategories: async (): Promise<ApiResponse<CategoryItem[]>> => {
    const response =
      await axiosClient.get<ApiResponse<CategoryItem[]>>("/api/categories");
    return response.data;
  },
};
