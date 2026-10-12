import axiosClient from "../../lib/axiosClient";

export interface ProductDiscountItem {
  id: string;
  productId: string;
  productName: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDiscountRequest {
  productId: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const productDiscountService = {
  /**
   * GET: /api/admin/product-discounts
   * Lấy danh sách tất cả các chương trình giảm giá sản phẩm[cite: 24]
   */
  getDiscounts: async (): Promise<ApiResponse<ProductDiscountItem[]>> => {
    const response = await axiosClient.get<ApiResponse<ProductDiscountItem[]>>(
      "/api/admin/product-discounts",
    );
    return response.data;
  },

  /**
   * POST: /api/admin/product-discounts
   * Tạo mới một chương trình giảm giá cho sản phẩm[cite: 25]
   */
  createDiscount: async (
    data: ProductDiscountRequest,
  ): Promise<ApiResponse<ProductDiscountItem>> => {
    const response = await axiosClient.post<ApiResponse<ProductDiscountItem>>(
      "/api/admin/product-discounts",
      data,
    );
    return response.data;
  },

  /**
   * GET: /api/admin/product-discounts/{id}
   * Lấy chi tiết thông tin một chương trình giảm giá theo ID[cite: 26]
   */
  getDiscountById: async (
    id: string,
  ): Promise<ApiResponse<ProductDiscountItem>> => {
    const response = await axiosClient.get<ApiResponse<ProductDiscountItem>>(
      `/api/admin/product-discounts/${id}`,
    );
    return response.data;
  },

  /**
   * PUT: /api/admin/product-discounts/{id}
   * Cập nhật thông tin chương trình giảm giá theo ID[cite: 27]
   */
  updateDiscount: async (
    id: string,
    data: ProductDiscountRequest,
  ): Promise<ApiResponse<ProductDiscountItem>> => {
    const response = await axiosClient.put<ApiResponse<ProductDiscountItem>>(
      `/api/admin/product-discounts/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * DELETE: /api/admin/product-discounts/{id}
   * Xóa một chương trình giảm giá theo ID[cite: 28]
   */
  deleteDiscount: async (id: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/admin/product-discounts/${id}`,
    );
    return response.data;
  },
};
