import axiosClient from "@/src/lib/axiosClient";

export interface Branch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  deliveryRadiusKm: number;
  distanceKm: number;
  deliverable: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const branchService = {
  /**
   * GET: /api/branches/nearby
   * Lấy danh sách các chi nhánh gần tọa độ vị trí cung cấp
   * @param lat Vĩ độ (Default: 21.0285 - Hà Nội)
   * @param lng Kinh độ (Default: 105.8542 - Hà Nội)
   * @param radiusKm Bán kính tìm kiếm tính theo Km (Default: 20)
   */
  getNearbyBranches: async (
    lat: number = 21.0285,
    lng: number = 105.8542,
    radiusKm: number = 50,
  ): Promise<ApiResponse<Branch[]>> => {
    const response = await axiosClient.get<ApiResponse<Branch[]>>(
      "/api/branches/nearby",
      {
        params: { lat, lng, radiusKm },
      },
    );
    return response.data;
  },

  /**
   * GET: /api/branches
   * Lấy danh sách tất cả các chi nhánh
   */
  getAllBranches: async (): Promise<ApiResponse<Branch[]>> => {
    const response =
      await axiosClient.get<ApiResponse<Branch[]>>("/api/branches");
    return response.data;
  },

  /**
   * GET: /api/branches/{branchId}
   * Lấy chi tiết thông tin 1 chi nhánh theo ID
   */
  getBranchById: async (branchId: string): Promise<ApiResponse<Branch>> => {
    const response = await axiosClient.get<ApiResponse<Branch>>(
      `/api/branches/${branchId}`,
    );
    return response.data;
  },
};
