import axiosClient from "@/src/lib/axiosClient";

export interface GetProductReviewsParams {
  rating?: number;
  page?: number;
  size?: number;
}

export interface CreateOrderReviewPayload {
  deliveryRating: number;
  serviceRating: number;
  comment?: string;
  images?: string[];
}

export interface CreateProductReviewPayload {
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export const reviewService = {
  /**
   * 1. Lấy danh sách đánh giá của một sản phẩm (Public)
   * GET /api/v1/products/{productId}/reviews
   */
  getProductReviews: async (
    productId: string,
    params?: GetProductReviewsParams,
  ) => {
    const response = await axiosClient.get(
      `/api/v1/products/${productId}/reviews`,
      {
        params: {
          rating: params?.rating,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      },
    );
    return response.data;
  },

  /**
   * 2. Đánh giá đơn hàng (Dịch vụ & Giao hàng) (Customer)
   * POST /api/v1/customer/orders/{orderId}/reviews
   */
  createOrderReview: async (
    orderId: string,
    payload: CreateOrderReviewPayload,
  ) => {
    const response = await axiosClient.post(
      `/api/v1/customer/orders/${orderId}/reviews`,
      payload,
    );
    return response.data;
  },

  /**
   * 3. Đánh giá một sản phẩm theo đơn hàng (Customer)
   * POST /api/v1/customer/products/{productId}/reviews
   */
  createProductReview: async (
    productId: string,
    payload: CreateProductReviewPayload,
  ) => {
    const response = await axiosClient.post(
      `/api/v1/customer/products/${productId}/reviews`,
      payload,
    );
    return response.data;
  },
};
