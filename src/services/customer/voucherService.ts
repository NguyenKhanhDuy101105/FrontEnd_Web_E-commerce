import axiosClient from "@/src/lib/axiosClient";

export type DiscountType = "PERCENT" | "FIXED";

export type VoucherStatus = "AVAILABLE" | "EXHAUSTED" | "EXPIRED" | "INACTIVE";

export interface VoucherConditions {
  isFirstOrder?: boolean;
  applicableCategoryIds?: string[];
  specialDaysOfMonth?: number[];
}

export interface CustomerVoucherItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  branchId?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  userLimit?: number | null;
  isActive: boolean;
  conditions?: VoucherConditions;
  createdAt: string;
  updatedAt: string;
  usedByCurrentUser?: boolean | null;
  userUsageCount?: number | null;
  status?: VoucherStatus | null;
  canApply?: boolean | null;
  ineligibilityReasons?: string[] | null;
}

export interface GetCustomerVouchersParams {
  keyword?: string;
  isAvailableOnly?: boolean;
  page?: number;
  size?: number;
}

export interface ApplyVoucherRequest {
  code: string;
  branchId: string;
}

export interface ApplyVoucherResponseData {
  code: string;
  discountAmount: number;
  finalAmount: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const voucherService = {
  /**
   * 1. GET: /api/vouchers
   * Lấy danh sách voucher cho khách hàng (có hỗ trợ lọc & phân trang)
   */
  getVouchers: async (
    params?: GetCustomerVouchersParams,
  ): Promise<ApiResponse<PageResponse<CustomerVoucherItem>>> => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<CustomerVoucherItem>>
    >("/api/vouchers", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        isAvailableOnly: params?.isAvailableOnly ?? true,
        ...(params?.keyword && { keyword: params.keyword }),
      },
    });
    return response.data;
  },

  /**
   * 2. GET: /api/vouchers/{id}
   * Xem chi tiết 1 voucher theo ID
   */
  getVoucherById: async (
    id: string,
  ): Promise<ApiResponse<CustomerVoucherItem>> => {
    const response = await axiosClient.get<ApiResponse<CustomerVoucherItem>>(
      `/api/vouchers/${id}`,
    );
    return response.data;
  },

  /**
   * 3. POST: /api/vouchers/apply
   * Áp dụng mã giảm giá tính toán số tiền giảm
   */
  applyVoucher: async (
    payload: ApplyVoucherRequest,
  ): Promise<ApiResponse<ApplyVoucherResponseData>> => {
    const response = await axiosClient.post<
      ApiResponse<ApplyVoucherResponseData>
    >("/api/vouchers/apply", payload);
    return response.data;
  },
};
