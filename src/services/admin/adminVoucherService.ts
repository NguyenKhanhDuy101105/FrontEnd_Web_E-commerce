import axiosClient from "@/src/lib/axiosClient";

export type DiscountType = "PERCENT" | "FIXED";

export type VoucherStatus = "AVAILABLE" | "EXHAUSTED" | "EXPIRED" | "INACTIVE";

export interface VoucherConditions {
  isFirstOrder?: boolean;
  applicableCategoryIds?: string[];
  specialDaysOfMonth?: number[];
}

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
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

export interface SaveVoucherRequest {
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  branchId?: string;
  usageLimit?: number;
  userLimit?: number;
  isActive: boolean;
  conditions?: VoucherConditions;
}

export interface GetVouchersParams {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
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

export const adminVoucherService = {
  /**
   * 1. GET: /api/admin/vouchers
   * Lấy danh sách voucher quản trị có phân trang & tìm kiếm
   */
  getVouchers: async (
    params?: GetVouchersParams,
  ): Promise<ApiResponse<PageResponse<VoucherItem>>> => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<VoucherItem>>
    >("/api/admin/vouchers", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.keyword && { keyword: params.keyword }),
        ...(params?.isActive !== undefined && { isActive: params.isActive }),
      },
    });
    return response.data;
  },

  /**
   * 2. POST: /api/admin/vouchers
   * Tạo mới một voucher
   */
  createVoucher: async (
    payload: SaveVoucherRequest,
  ): Promise<ApiResponse<VoucherItem>> => {
    const response = await axiosClient.post<ApiResponse<VoucherItem>>(
      "/api/admin/vouchers",
      payload,
    );
    return response.data;
  },

  /**
   * 3. GET: /api/admin/vouchers/{id}
   * Lấy thông tin chi tiết của 1 voucher theo ID
   */
  getVoucherById: async (id: string): Promise<ApiResponse<VoucherItem>> => {
    const response = await axiosClient.get<ApiResponse<VoucherItem>>(
      `/api/admin/vouchers/${id}`,
    );
    return response.data;
  },

  /**
   * 4. PUT: /api/admin/vouchers/{id}
   * Cập nhật thông tin voucher theo ID
   */
  updateVoucher: async (
    id: string,
    payload: SaveVoucherRequest,
  ): Promise<ApiResponse<VoucherItem>> => {
    const response = await axiosClient.put<ApiResponse<VoucherItem>>(
      `/api/admin/vouchers/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * 5. DELETE: /api/admin/vouchers/{id}
   * Xóa một voucher theo ID
   */
  deleteVoucher: async (id: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/admin/vouchers/${id}`,
    );
    return response.data;
  },
};
