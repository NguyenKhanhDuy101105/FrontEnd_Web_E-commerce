import axiosClient from "@/src/lib/axiosClient";

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface SubCategoryInventory {
  categoryId: string;
  categoryName: string;
  totalSkus: number;
  totalOnHand: number;
  totalAvailable: number;
}

export interface CategoryInventory {
  categoryId: string;
  categoryName: string;
  totalSkus: number;
  totalOnHand: number;
  totalAvailable: number;
  lowStockSkus: number;
  subCategories: SubCategoryInventory[];
}

export interface InventoryProduct {
  inventoryId: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  stockQuantity: number;
  updatedAt: string;
}

export interface InventorySubGroup {
  subCategoryId: string;
  parentCategoryName: string;
  subCategoryName: string;
  totalProducts: number;
  totalGroupStock: number;
  products: InventoryProduct[];
}

export interface InventoryCategoryGroup {
  categoryId: string;
  categoryName: string;
  totalStock: number;
  subGroups: InventorySubGroup[];
}

export interface InventoryByCategoriesData {
  branchId: string;
  branchName: string;
  branchAddress: string;
  totalBranchStock: number;
  categories: InventoryCategoryGroup[];
}

export interface InventorySummary {
  branchId: string;
  branchName: string;
  totalSkus: number;
  totalOnHandQuantity: number;
  totalAvailableQuantity: number;
  totalReservedQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
}

export interface InventoryLot {
  lotId: string;
  productId: string;
  productName: string;
  quantity: number;
  expiryDate: string;
  receivedAt: string;
}

export interface UpdatedInventory {
  inventoryId: string;
  branchId: string;
  branchName: string;
  productId: string;
  sku: string;
  productName: string;
  stockQuantity: number;
  updatedAt: string;
}

export interface UpdateInventoryPayload {
  productId: string;
  stockQuantity: number;
  reason: "DAMAGED" | "EXPIRED" | "ADJUSTMENT" | "OTHER" | string;
}

export interface CreateLotPayload {
  productId: string;
  quantity: number;
  expiryDate: string;
}

export interface UpdateLotPayload {
  expiryDate: string;
}

export const branchInventoryService = {
  /**
   * 1. GET /api/branches/{branchId}/inventory/categories
   * Lấy danh sách danh mục tồn kho của chi nhánh
   */
  getInventoryCategories: async (
    branchId: string,
  ): Promise<ApiResponse<CategoryInventory[]>> => {
    const response = await axiosClient.get<ApiResponse<CategoryInventory[]>>(
      `/api/branches/${branchId}/inventory/categories`,
    );
    return response.data;
  },

  /**
   * 2. GET /api/branches/{branchId}/inventory/by-categories
   * Lấy chi tiết tồn kho phân nhóm theo danh mục & sản phẩm
   */
  getInventoryByCategories: async (
    branchId: string,
  ): Promise<ApiResponse<InventoryByCategoriesData>> => {
    const response = await axiosClient.get<
      ApiResponse<InventoryByCategoriesData>
    >(`/api/branches/${branchId}/inventory/by-categories`);
    return response.data;
  },

  /**
   * 3. GET /api/branches/{branchId}/inventory/summary
   * Lấy tổng quan (thống kê) tồn kho của chi nhánh
   */
  getInventorySummary: async (
    branchId: string,
  ): Promise<ApiResponse<InventorySummary>> => {
    const response = await axiosClient.get<ApiResponse<InventorySummary>>(
      `/api/branches/${branchId}/inventory/summary`,
    );
    return response.data;
  },

  /**
   * 4. GET /api/branches/{branchId}/inventory/{productId}/lots
   * Lấy danh sách các lô hàng của 1 sản phẩm tại chi nhánh
   */
  getProductLots: async (
    branchId: string,
    productId: string,
  ): Promise<ApiResponse<InventoryLot[]>> => {
    const response = await axiosClient.get<ApiResponse<InventoryLot[]>>(
      `/api/branches/${branchId}/inventory/${productId}/lots`,
    );
    return response.data;
  },

  /**
   * 5. PUT /api/branches/{branchId}/inventory
   * Cập nhật số lượng tồn kho của sản phẩm tại chi nhánh (Điều chỉnh / Hỏng / Hết hạn...)
   */
  updateInventory: async (
    branchId: string,
    payload: UpdateInventoryPayload,
  ): Promise<ApiResponse<UpdatedInventory>> => {
    const response = await axiosClient.put<ApiResponse<UpdatedInventory>>(
      `/api/branches/${branchId}/inventory`,
      payload,
    );
    return response.data;
  },

  /**
   * 6. POST /api/branches/{branchId}/inventory/lots
   * Nhập / Tạo mới lô hàng cho sản phẩm tại chi nhánh
   */
  createLot: async (
    branchId: string,
    payload: CreateLotPayload,
  ): Promise<ApiResponse<InventoryLot>> => {
    const response = await axiosClient.post<ApiResponse<InventoryLot>>(
      `/api/branches/${branchId}/inventory/lots`,
      payload,
    );
    return response.data;
  },

  /**
   * 7. PATCH /api/branches/{branchId}/inventory/lots/{lotId}
   * Cập nhật ngày hết hạn cho lô hàng
   */
  updateLotExpiry: async (
    branchId: string,
    lotId: string,
    payload: UpdateLotPayload,
  ): Promise<ApiResponse<InventoryLot>> => {
    const response = await axiosClient.patch<ApiResponse<InventoryLot>>(
      `/api/branches/${branchId}/inventory/lots/${lotId}`,
      payload,
    );
    return response.data;
  },
};

export default branchInventoryService;
