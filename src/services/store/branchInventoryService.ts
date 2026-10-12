import axiosClient from "@/src/lib/axiosClient";

export interface AdminBranchInventoryItem {
  inventoryId: string;
  branchId: string;
  branchName: string;
  productId: string;
  sku: string;
  productName: string;
  stockQuantity: number;
  updatedAt: string;
}

export interface UpdateInventoryRequest {
  productId: string;
  branchId: string;
  stockQuantity: number;
}

// Format Response API Chuẩn
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const adminInventoryService = {
  /**
   * GET: /api/admin/branches/{branchId}/inventory
   * Lấy danh sách danh mục tồn kho sản phẩm của một chi nhánh cụ thể
   */
  getBranchInventory: async (
    branchId: string,
  ): Promise<ApiResponse<AdminBranchInventoryItem[]>> => {
    const response = await axiosClient.get<
      ApiResponse<AdminBranchInventoryItem[]>
    >(`/api/admin/branches/${branchId}/inventory`);
    return response.data;
  },

  /**
   * POST: /api/admin/branches/inventory
   * Cập nhật / Nhập số lượng tồn kho cho sản phẩm tại chi nhánh
   */
  updateStock: async (
    payload: UpdateInventoryRequest,
  ): Promise<ApiResponse<AdminBranchInventoryItem>> => {
    const response = await axiosClient.post<
      ApiResponse<AdminBranchInventoryItem>
    >("/api/admin/branches/inventory", payload);
    return response.data;
  },
};
