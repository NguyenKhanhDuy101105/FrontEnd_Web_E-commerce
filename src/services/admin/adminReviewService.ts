import axiosClient from "@/src/lib/axiosClient";

export type ReviewType = "ORDER" | "PRODUCT" | "ALL";

export interface GetAdminReviewsParams {
  branchId?: string;
  type?: ReviewType;
  rating?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface AdminReviewItem {
  id: string;
  branchId: string;
  branchName: string;
  reviewType: string;
  orderId: string;
  orderCode: string;
  targetName: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  deliveryRating: number;
  serviceRating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface AdminReviewsData {
  content: AdminReviewItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminReviewsResponse {
  status: string;
  message: string;
  data: AdminReviewsData;
}

export const adminReviewService = {
  /**
   * Lấy danh sách đánh giá toàn hệ thống (Admin Dashboard)
   * GET /api/v1/admin/reviews
   */
  getAdminReviews: async (
    params?: GetAdminReviewsParams,
  ): Promise<AdminReviewsResponse> => {
    const response = await axiosClient.get<AdminReviewsResponse>(
      "/api/v1/admin/reviews",
      {
        params: {
          branchId: params?.branchId,
          type: params?.type ?? "ALL",
          rating: params?.rating,
          startDate: params?.startDate,
          endDate: params?.endDate,
          keyword: params?.keyword,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      },
    );
    return response.data;
  },
};
