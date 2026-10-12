import axiosClient from "@/src/lib/axiosClient";

export interface AdminCategoryItem {
  id: string;
  name: string;
  children?: string[] | AdminCategoryItem[];
}

export interface CreateCategoryRequest {
  name: string;
  children?: string[];
}

export interface UpdateCategoryRequest {
  name: string;
  parentId?: string | null;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const adminCategoryService = {
  /**
   * POST: /api/admin/categories
   * Thêm mới một danh mục
   */
  createCategory: async (
    payload: CreateCategoryRequest,
  ): Promise<ApiResponse<AdminCategoryItem>> => {
    const response = await axiosClient.post<ApiResponse<AdminCategoryItem>>(
      "/api/admin/categories",
      payload,
    );
    return response.data;
  },

  /**
   * PUT: /api/admin/categories/{id}
   * Cập nhật thông tin danh mục theo ID
   */
  updateCategory: async (
    id: string,
    payload: UpdateCategoryRequest,
  ): Promise<ApiResponse<AdminCategoryItem>> => {
    const response = await axiosClient.put<ApiResponse<AdminCategoryItem>>(
      `/api/admin/categories/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * DELETE: /api/admin/categories/{id}
   * Xóa danh mục theo ID
   */
  deleteCategory: async (id: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/admin/categories/${id}`,
    );
    return response.data;
  },
};
