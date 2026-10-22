import axiosClient from "@/src/lib/axiosClient";

export interface BranchInventorySummaryItem {
  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  totalStock: number;
}

export interface InventoryProductItem {
  inventoryId: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  stockQuantity: number;
  updatedAt: string;
}

export interface InventorySubGroupItem {
  subCategoryId: string;
  parentCategoryName: string;
  subCategoryName: string;
  totalProducts: number;
  totalGroupStock: number;
  products: InventoryProductItem[];
}

export interface InventoryCategoryItem {
  categoryId: string;
  categoryName: string;
  totalStock: number;
  subGroups: InventorySubGroupItem[];
}

export interface BranchInventoryByCategoryData {
  branchId: string;
  branchName: string;
  branchAddress: string;
  totalBranchStock: number;
  categories: InventoryCategoryItem[];
}

export interface UpdateInventoryRequest {
  productId: string;
  branchId: string;
  stockQuantity: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const adminInventoryService = {
  /**
   * GET: /api/admin/branches/inventory/summary
   * Lấy danh sách tổng quan số lượng tồn kho của tất cả chi nhánh
   */
  getInventorySummary: async (): Promise<
    ApiResponse<BranchInventorySummaryItem[]>
  > => {
    const response = await axiosClient.get<
      ApiResponse<BranchInventorySummaryItem[]>
    >("/api/admin/branches/inventory/summary");
    return response.data;
  },

  /**
   * GET: /api/admin/branches/{branchId}/inventory/by-categories
   * Lấy chi tiết hàng tồn kho của một chi nhánh phân cấp theo danh mục sản phẩm
   */
  getBranchInventoryByCategories: async (
    branchId: string,
  ): Promise<ApiResponse<BranchInventoryByCategoryData>> => {
    const response = await axiosClient.get<
      ApiResponse<BranchInventoryByCategoryData>
    >(`/api/admin/branches/${branchId}/inventory/by-categories`);
    return response.data;
  },
};
