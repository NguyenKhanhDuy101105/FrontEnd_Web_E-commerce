import axiosClient from "@/src/lib/axiosClient";

export type IncompatibilitySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface CheckIncompatibilitiesPayload {
  productIds: string[];
}

export interface ConflictingProduct {
  id: string;
  name: string;
  imageUrl: string;
  matchedTag: string;
}

export interface IncompatibilityWarning {
  id: string;
  severity: IncompatibilitySeverity;
  title: string;
  effect: string;
  recommendation: string;
  conflictingProducts: ConflictingProduct[];
}

export interface CartIncompatibilityData {
  hasConflict: boolean;
  warnings: IncompatibilityWarning[];
}

export interface CartIncompatibilityResponse {
  status: string;
  message: string;
  data: CartIncompatibilityData;
}

export interface IncompatibleRule {
  id: string;
  matchedTag: string;
  incompatibleTag: string;
  incompatibleTagName: string;
  severity: IncompatibilitySeverity;
  title: string;
  effect: string;
  recommendation: string;
}

export interface ProductIncompatibilityData {
  productId: string;
  productName: string;
  tags: string[];
  incompatibleRules: IncompatibleRule[];
}

export interface ProductIncompatibilityResponse {
  status: string;
  message: string;
  data: ProductIncompatibilityData;
}

export const incompatibilityService = {
  /**
   * 1. Kiểm tra kỵ nhau giữa các sản phẩm trong giỏ hàng (Customer)
   * POST /api/v1/customer/cart/check-incompatibilities
   */
  checkCartIncompatibilities: async (
    payload: CheckIncompatibilitiesPayload,
  ): Promise<CartIncompatibilityResponse> => {
    const response = await axiosClient.post<CartIncompatibilityResponse>(
      "/api/v1/customer/cart/check-incompatibilities",
      payload,
    );
    return response.data;
  },

  /**
   * 2. Lấy thông tin cảnh báo kỵ nhau của một sản phẩm cụ thể (Customer)
   * GET /api/v1/customer/products/{productId}/incompatibilities
   */
  getProductIncompatibilities: async (
    productId: string,
  ): Promise<ProductIncompatibilityResponse> => {
    const response = await axiosClient.get<ProductIncompatibilityResponse>(
      `/api/v1/customer/products/${productId}/incompatibilities`,
    );
    return response.data;
  },
};
