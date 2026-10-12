import axiosClient from "@/src/lib/axiosClient";

export interface BranchItem {
  id: string;
  accountId?: string | null;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  deliveryRadiusKm: number;
  isWarehouse: boolean;
  openingHours?: Record<string, string> | null;
  status: string;
  createdAt: string;
}

export interface SpringPageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface GetBranchesParams {
  page?: number;
  size?: number;
  search?: string;
}

export const branchService = {
  /**
   * GET: /api/branches
   * Lấy danh sách tất cả chi nhánh (Phân trang & tìm kiếm)
   */
  getBranches: async (
    params?: GetBranchesParams,
  ): Promise<ApiResponse<SpringPageResponse<BranchItem>>> => {
    const response = await axiosClient.get<
      ApiResponse<SpringPageResponse<BranchItem>>
    >("/api/branches", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.search && { search: params.search }),
      },
    });
    return response.data;
  },
};
