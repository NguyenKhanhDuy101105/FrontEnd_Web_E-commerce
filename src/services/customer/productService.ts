import axiosClient from "../../lib/axiosClient";

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

export interface ProductSearchSuggestion {
  id: string;
  name: string;
  imageUrl: string | null;
  displayPrice: number;
  basePrice: number;
  unit: string;
  categoryName: string;
}

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

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface GetProductsParams {
  branchId: string;
  keyword?: string;
  search?: string;
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

export interface GetSearchSuggestionsParams {
  branchId: string;
  keyword: string;
  limit?: number;
}

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
   * GET: /api/products/search-suggestions
   * Lấy danh sách gợi ý tìm kiếm sản phẩm theo branchId và keyword
   */
  getSearchSuggestions: async (
    params: GetSearchSuggestionsParams,
  ): Promise<ApiResponse<ProductSearchSuggestion[]>> => {
    const response = await axiosClient.get<
      ApiResponse<ProductSearchSuggestion[]>
    >("/api/products/search-suggestions", {
      params: {
        branchId: params.branchId,
        keyword: params.keyword,
        limit: params.limit ?? 3,
      },
    });

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
