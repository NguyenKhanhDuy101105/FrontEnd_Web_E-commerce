import axiosClient from "@/src/lib/axiosClient";

export interface AdminBranchItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  deliveryRadiusKm: number;
  isWarehouse: boolean;
  openingHours?: Record<string, string>;
  status: string;
  createdAt: string;
}

export interface SaveAdminBranchRequest {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  deliveryRadiusKm: number;
  isWarehouse: boolean;
  openingHours?: Record<string, string>;
  status?: string; // Mặc định: "ACTIVE"
}

export interface SpringPageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  empty: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface GetAdminBranchesParams {
  page?: number;
  size?: number;
  search?: string;
}

export const adminBranchService = {
  /**
   * GET: /api/admin/branches
   * Lấy danh sách chi nhánh (Phân trang)
   */
  getBranches: async (
    params?: GetAdminBranchesParams,
  ): Promise<ApiResponse<SpringPageResponse<AdminBranchItem>>> => {
    const response = await axiosClient.get<
      ApiResponse<SpringPageResponse<AdminBranchItem>>
    >("/api/admin/branches", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.search && { search: params.search }),
      },
    });
    return response.data;
  },

  /**
   * GET: /api/admin/branches/{branchId}
   * Lấy chi tiết một chi nhánh theo ID
   */
  getBranchById: async (
    branchId: string,
  ): Promise<ApiResponse<AdminBranchItem>> => {
    const response = await axiosClient.get<ApiResponse<AdminBranchItem>>(
      `/api/admin/branches/${branchId}`,
    );
    return response.data;
  },

  /**
   * POST: /api/admin/branches
   * Tạo mới một chi nhánh / kho siêu thị
   */
  createBranch: async (
    payload: SaveAdminBranchRequest,
  ): Promise<ApiResponse<AdminBranchItem>> => {
    const response = await axiosClient.post<ApiResponse<AdminBranchItem>>(
      "/api/admin/branches",
      payload,
    );
    return response.data;
  },

  /**
   * PUT: /api/admin/branches/{branchId}
   * Cập nhật thông tin chi nhánh / kho siêu thị theo ID
   */
  updateBranch: async (
    branchId: string,
    payload: SaveAdminBranchRequest,
  ): Promise<ApiResponse<AdminBranchItem>> => {
    const response = await axiosClient.put<ApiResponse<AdminBranchItem>>(
      `/api/admin/branches/${branchId}`,
      payload,
    );
    return response.data;
  },

  /**
   * DELETE: /api/admin/branches/{branchId}
   * Xóa một chi nhánh / kho siêu thị theo ID
   */
  deleteBranch: async (branchId: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/admin/branches/${branchId}`,
    );
    return response.data;
  },
};
