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
  stockRequestItemId?: string;
  expiryDate: string;
}
export interface UpdateLotPayload {
  expiryDate: string;
}

export type InventoryRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "PARTIALLY_RECEIVED"
  | "REJECTED"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELLED"
  | string;

export interface InventoryRequestItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  unit: string;
  requestedQuantity: number;
  approvedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
}

export interface InventoryRequest {
  id: string;
  branchId: string;
  branchName: string;
  requestedById: string;
  requestedByName: string;
  status: InventoryRequestStatus;
  reason: string;
  adminNote: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  closeNote: string | null;
  closedById: string | null;
  closedByName: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: InventoryRequestItem[];
}

export interface PageableInventoryRequestsResponse {
  content: InventoryRequest[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetInventoryRequestsParams {
  page?: number;
  size?: number;
}

export interface CreateInventoryRequestItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateInventoryRequestPayload {
  reason: string;
  items: CreateInventoryRequestItemPayload[];
}

export interface SearchInventoryProduct {
  productId: string;
  sku: string;
  productName: string;
  imageUrl: string | null;
  unit: string;
  categoryId: string;
  categoryName: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

export interface PageableSearchInventoryResponse {
  content: SearchInventoryProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchBranchInventoryParams {
  keyword: string;
  page?: number;
  size?: number;
}

export const branchInventoryService = {
  getInventoryCategories: async (
    branchId: string,
  ): Promise<ApiResponse<CategoryInventory[]>> => {
    const response = await axiosClient.get<ApiResponse<CategoryInventory[]>>(
      `/api/branches/${branchId}/inventory/categories`,
    );
    return response.data;
  },

  getInventoryByCategories: async (
    branchId: string,
  ): Promise<ApiResponse<InventoryByCategoriesData>> => {
    const response = await axiosClient.get<
      ApiResponse<InventoryByCategoriesData>
    >(`/api/branches/${branchId}/inventory/by-categories`);
    return response.data;
  },

  getInventorySummary: async (
    branchId: string,
  ): Promise<ApiResponse<InventorySummary>> => {
    const response = await axiosClient.get<ApiResponse<InventorySummary>>(
      `/api/branches/${branchId}/inventory/summary`,
    );
    return response.data;
  },

  getProductLots: async (
    branchId: string,
    productId: string,
  ): Promise<ApiResponse<InventoryLot[]>> => {
    const response = await axiosClient.get<ApiResponse<InventoryLot[]>>(
      `/api/branches/${branchId}/inventory/${productId}/lots`,
    );
    return response.data;
  },

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

  getInventoryRequests: async (
    branchId: string,
    params?: GetInventoryRequestsParams,
  ): Promise<ApiResponse<PageableInventoryRequestsResponse>> => {
    const response = await axiosClient.get<
      ApiResponse<PageableInventoryRequestsResponse>
    >(`/api/branches/${branchId}/inventory-requests`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return response.data;
  },

  getInventoryRequestDetail: async (
    branchId: string,
    requestId: string,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.get<ApiResponse<InventoryRequest>>(
      `/api/branches/${branchId}/inventory-requests/${requestId}`,
    );
    return response.data;
  },

  createInventoryRequest: async (
    branchId: string,
    payload: CreateInventoryRequestPayload,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.post<ApiResponse<InventoryRequest>>(
      `/api/branches/${branchId}/inventory-requests`,
      payload,
    );
    return response.data;
  },

  deleteInventoryRequest: async (
    branchId: string,
    requestId: string,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.delete<ApiResponse<InventoryRequest>>(
      `/api/branches/${branchId}/inventory-requests/${requestId}`,
    );
    return response.data;
  },

  searchBranchInventory: async (
    branchId: string,
    params: SearchBranchInventoryParams,
  ): Promise<ApiResponse<PageableSearchInventoryResponse>> => {
    const response = await axiosClient.get<
      ApiResponse<PageableSearchInventoryResponse>
    >(`/api/branches/${branchId}/inventory/search`, {
      params: {
        keyword: params.keyword,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return response.data;
  },
};

export default branchInventoryService;
