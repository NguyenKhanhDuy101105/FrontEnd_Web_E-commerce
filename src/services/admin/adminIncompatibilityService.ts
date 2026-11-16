import axiosClient from "@/src/lib/axiosClient";

export type IncompatibilitySeverity = "LOW" | "MEDIUM" | "HIGH" | "DANGEROUS";

export interface FoodTag {
  code: string;
  name: string;
}

export interface CreateFoodTagPayload {
  code: string;
  name: string;
}

export interface FoodTagResponse {
  status: string;
  message: string;
  data: FoodTag;
}

export interface FoodTagListResponse {
  status: string;
  message: string;
  data: FoodTag[];
}

export interface GetAdminIncompatibilitiesParams {
  search?: string;
  severity?: IncompatibilitySeverity;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface FoodIncompatibilityItem {
  id: string;
  tagA: string;
  tagB: string;
  severity: IncompatibilitySeverity;
  title: string;
  effect: string;
  recommendation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodIncompatibilityPayload {
  tagA: string;
  tagB: string;
  severity: IncompatibilitySeverity;
  title: string;
  effect: string;
  recommendation: string;
  isActive: boolean;
}

export interface IncompatibilityListResponse {
  status: string;
  message: string;
  data: {
    content: FoodIncompatibilityItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface IncompatibilityDetailResponse {
  status: string;
  message: string;
  data: FoodIncompatibilityItem;
}

export interface DeleteIncompatibilityResponse {
  status: string;
  message: string;
  data: string;
}

export interface UpdateProductFoodTagsPayload {
  tagCodes: string[];
}

export interface UpdateProductFoodTagsResponse {
  status: string;
  message: string;
  data: {
    productId: string;
    productName: string;
    tags: FoodTag[];
  };
}

export const adminIncompatibilityService = {
  /**
   * 1. Lấy danh sách tất cả các nhãn thực phẩm (Food Tags)
   * GET /api/v1/admin/food-tags
   */
  getFoodTags: async (): Promise<FoodTagListResponse> => {
    const response = await axiosClient.get<FoodTagListResponse>(
      "/api/v1/admin/food-tags",
    );
    return response.data;
  },

  /**
   * 2. Tạo nhãn thực phẩm mới
   * POST /api/v1/admin/food-tags
   */
  createFoodTag: async (
    payload: CreateFoodTagPayload,
  ): Promise<FoodTagResponse> => {
    const response = await axiosClient.post<FoodTagResponse>(
      "/api/v1/admin/food-tags",
      payload,
    );
    return response.data;
  },

  /**
   * 3. Lấy danh sách quy tắc kỵ thực phẩm (Có lọc & Phân trang)
   * GET /api/v1/admin/food-incompatibilities
   */
  getIncompatibilities: async (
    params?: GetAdminIncompatibilitiesParams,
  ): Promise<IncompatibilityListResponse> => {
    const response = await axiosClient.get<IncompatibilityListResponse>(
      "/api/v1/admin/food-incompatibilities",
      {
        params: {
          search: params?.search,
          severity: params?.severity,
          isActive: params?.isActive,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      },
    );
    return response.data;
  },

  /**
   * 4. Tạo quy tắc kỵ thực phẩm mới
   * POST /api/v1/admin/food-incompatibilities
   */
  createIncompatibility: async (
    payload: FoodIncompatibilityPayload,
  ): Promise<IncompatibilityDetailResponse> => {
    const response = await axiosClient.post<IncompatibilityDetailResponse>(
      "/api/v1/admin/food-incompatibilities",
      payload,
    );
    return response.data;
  },

  /**
   * 5. Lấy chi tiết quy tắc kỵ thực phẩm theo ID
   * GET /api/v1/admin/food-incompatibilities/{id}
   */
  getIncompatibilityById: async (
    id: string,
  ): Promise<IncompatibilityDetailResponse> => {
    const response = await axiosClient.get<IncompatibilityDetailResponse>(
      `/api/v1/admin/food-incompatibilities/${id}`,
    );
    return response.data;
  },

  /**
   * 6. Cập nhật quy tắc kỵ thực phẩm theo ID
   * PUT /api/v1/admin/food-incompatibilities/{id}
   */
  updateIncompatibility: async (
    id: string,
    payload: FoodIncompatibilityPayload,
  ): Promise<IncompatibilityDetailResponse> => {
    const response = await axiosClient.put<IncompatibilityDetailResponse>(
      `/api/v1/admin/food-incompatibilities/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * 7. Xóa quy tắc kỵ thực phẩm theo ID
   * DELETE /api/v1/admin/food-incompatibilities/{id}
   */
  deleteIncompatibility: async (
    id: string,
  ): Promise<DeleteIncompatibilityResponse> => {
    const response = await axiosClient.delete<DeleteIncompatibilityResponse>(
      `/api/v1/admin/food-incompatibilities/${id}`,
    );
    return response.data;
  },

  /**
   * 8. Gán/Cập nhật danh sách nhãn thực phẩm cho một sản phẩm cụ thể
   * PUT /api/v1/admin/products/{productId}/food-tags
   */
  updateProductFoodTags: async (
    productId: string,
    payload: UpdateProductFoodTagsPayload,
  ): Promise<UpdateProductFoodTagsResponse> => {
    const response = await axiosClient.put<UpdateProductFoodTagsResponse>(
      `/api/v1/admin/products/${productId}/food-tags`,
      payload,
    );
    return response.data;
  },
};
