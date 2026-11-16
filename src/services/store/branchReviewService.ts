import axiosClient from "@/src/lib/axiosClient";

export type ReviewType = "ORDER" | "PRODUCT" | "ALL";

export interface GetBranchReviewsParams {
  type?: ReviewType;
  rating?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface SimilarProduct {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  unit: string;
}

export interface BranchReviewItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  unit: string;
  quantity: number;
  isRequired: boolean;
  note: string;
  inStock: boolean;
  availableQuantity: number;
  hasSimilarProducts: boolean;
  similarProducts: SimilarProduct[];
}

export interface BranchSummary {
  averageOrderRating: number;
  averageProductRating: number;
  totalOrderReviews: number;
  totalProductReviews: number;
}

export interface BranchReviewsData {
  content: BranchReviewItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  branchSummary: BranchSummary;
}

export interface BranchReviewsResponse {
  status: string;
  message: string;
  data: BranchReviewsData;
}

export const branchReviewService = {
  /**
   * Lấy danh sách đánh giá của chi nhánh (Branch Workspace / Admin)
   * GET /api/v1/branch/reviews
   */
  getBranchReviews: async (
    params?: GetBranchReviewsParams,
  ): Promise<BranchReviewsResponse> => {
    const response = await axiosClient.get<BranchReviewsResponse>(
      "/api/v1/branch/reviews",
      {
        params: {
          type: params?.type ?? "ALL",
          rating: params?.rating,
          startDate: params?.startDate,
          endDate: params?.endDate,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      },
    );
    return response.data;
  },
};
