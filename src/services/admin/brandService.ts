import axiosClient from "@/src/lib/axiosClient";

export interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const brandService = {
  /**
   * GET: /api/brands hoặc /api/admin/brands
   * Lấy danh sách thương hiệu
   */
  getBrands: async (): Promise<ApiResponse<BrandItem[]>> => {
    const response =
      await axiosClient.get<ApiResponse<BrandItem[]>>("/api/brands");
    return response.data;
  },
};
