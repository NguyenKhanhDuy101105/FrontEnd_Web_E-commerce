import axiosClient from "../../lib/axiosClient";

// 1. Interface đại diện cho sản phẩm
export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  unit: string;
  basePrice: number;
  displayPrice: number;
  discountPercent: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  dailyFresh: boolean;
  imageUrl: string | null;
  stockQuantity: number;
  inStock: boolean;
}

// 2. Interface phân trang chuẩn Spring Boot
export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 3. Interface Response API tổng quát
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 4. Interface các Query Parameters khi lọc danh sách sản phẩm
export interface GetProductsParams {
  branchId: string; // Required
  keyword?: string;
  categoryId?: string;
  includeDescendants?: boolean;
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  size?: number;
  sort?: string;
  sortBy?: string;
  direction?: "ASC" | "DESC" | string;
}

// 5. Product Service Module
export const productService = {
  /**
   * GET: /api/products
   * Lấy danh sách sản phẩm chung theo branchId và các bộ lọc
   */
  getProducts: async (
    params: GetProductsParams,
  ): Promise<ApiResponse<PageResponse<ProductItem>>> => {
    const queryParams = {
      includeDescendants: true,
      page: 0,
      size: 20,
      ...params,
    };

    const response = await axiosClient.get<
      ApiResponse<PageResponse<ProductItem>>
    >("/api/products", { params: queryParams });

    return response.data;
  },

  /**
   * GET: /api/products/{productId}?branchId={branchId}
   * Lấy chi tiết 1 sản phẩm theo productId và branchId (Required cả 2)
   */
  getProductById: async (
    productId: string,
    branchId: string,
  ): Promise<ApiResponse<ProductItem>> => {
    const response = await axiosClient.get<ApiResponse<ProductItem>>(
      `/api/products/${productId}`,
      {
        params: { branchId },
      },
    );

    return response.data;
  },

  /**
   * GET: /api/products/promotions
   * Lấy danh sách sản phẩm khuyến mãi (Default sort: discount_desc)
   */
  getPromotionProducts: async (
    params: GetProductsParams,
  ): Promise<ApiResponse<PageResponse<ProductItem>>> => {
    const queryParams = {
      includeDescendants: true,
      page: 0,
      size: 20,
      sort: "discount_desc",
      ...params,
    };

    const response = await axiosClient.get<
      ApiResponse<PageResponse<ProductItem>>
    >("/api/products/promotions", { params: queryParams });

    return response.data;
  },

  /**
   * GET: /api/products/daily-fresh
   * Lấy danh sách sản phẩm tươi sống hàng ngày (Default sort: name_asc)
   */
  getDailyFreshProducts: async (
    params: GetProductsParams,
  ): Promise<ApiResponse<PageResponse<ProductItem>>> => {
    const queryParams = {
      includeDescendants: true,
      page: 0,
      size: 20,
      sort: "name_asc",
      ...params,
    };

    const response = await axiosClient.get<
      ApiResponse<PageResponse<ProductItem>>
    >("/api/products/daily-fresh", { params: queryParams });

    return response.data;
  },

  /**
   * GET: /api/products/category/{categoryId}
   * Lấy danh sách sản phẩm theo categoryId và branchId (Required categoryId & branchId)
   */
  getProductsByCategory: async (
    categoryId: string,
    params: GetProductsParams,
  ): Promise<ApiResponse<PageResponse<ProductItem>>> => {
    const queryParams = {
      includeDescendants: true,
      page: 0,
      size: 20,
      sort: "name_asc",
      ...params,
    };

    const response = await axiosClient.get<
      ApiResponse<PageResponse<ProductItem>>
    >(`/api/products/category/${categoryId}`, { params: queryParams });

    return response.data;
  },
};
