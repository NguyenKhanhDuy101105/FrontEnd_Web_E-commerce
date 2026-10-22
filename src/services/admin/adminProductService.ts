import axiosClient from "@/src/lib/axiosClient";

export interface AdminProductItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  unit: string;
  basePrice: number;
  imageUrl: string;
  status: string;
}

export interface SaveAdminProductRequest {
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  unit: string;
  basePrice: number;
  imageUrl: string;
}

export interface SpringPageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  empty: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface GetAdminProductsParams {
  page?: number;
  size?: number;
  search?: string;
}

export const adminProductService = {
  /**
   * GET: /api/admin/products
   * Lấy danh sách sản phẩm quản trị có phân trang
   */
  getProducts: async (
    params?: GetAdminProductsParams,
  ): Promise<ApiResponse<SpringPageResponse<AdminProductItem>>> => {
    const response = await axiosClient.get<
      ApiResponse<SpringPageResponse<AdminProductItem>>
    >("/api/admin/products", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100,
        ...(params?.search && { search: params.search }),
      },
    });
    return response.data;
  },

  /**
   * GET: /api/admin/products/{productId}
   * Lấy thông tin chi tiết của 1 sản phẩm theo ID
   */
  getProductById: async (
    productId: string,
  ): Promise<ApiResponse<AdminProductItem>> => {
    const response = await axiosClient.get<ApiResponse<AdminProductItem>>(
      `/api/admin/products/${productId}`,
    );
    return response.data;
  },

  /**
   * POST: /api/admin/products
   * Thêm mới một sản phẩm vào hệ thống
   */
  createProduct: async (
    payload: SaveAdminProductRequest,
  ): Promise<ApiResponse<AdminProductItem>> => {
    const response = await axiosClient.post<ApiResponse<AdminProductItem>>(
      "/api/admin/products",
      payload,
    );
    return response.data;
  },

  /**
   * PUT: /api/admin/products/{productId}
   * Cập nhật thông tin sản phẩm theo ID
   */
  updateProduct: async (
    productId: string,
    payload: SaveAdminProductRequest,
  ): Promise<ApiResponse<AdminProductItem>> => {
    const response = await axiosClient.put<ApiResponse<AdminProductItem>>(
      `/api/admin/products/${productId}`,
      payload,
    );
    return response.data;
  },

  /**
   * DELETE: /api/admin/products/{productId}
   * Xóa sản phẩm khỏi hệ thống theo ID
   */
  deleteProduct: async (productId: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/admin/products/${productId}`,
    );
    return response.data;
  },
  /**
   * PATCH: /api/admin/products/{productId}/restore
   * Khôi phục sản phẩm đã bị xóa/vô hiệu hóa
   */
  restoreProduct: async (
    productId: string,
  ): Promise<ApiResponse<AdminProductItem>> => {
    const response = await axiosClient.patch<ApiResponse<AdminProductItem>>(
      `/api/admin/products/${productId}/restore`,
    );
    return response.data;
  },
};
