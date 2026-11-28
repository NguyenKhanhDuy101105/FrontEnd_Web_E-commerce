import axiosClient from "../../lib/axiosClient";

export type InventoryRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "COMPLETED"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED";

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
  reason: string | null;
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

export interface PaginatedResponse<T> {
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

export interface GetInventoryRequestsParams {
  status?: InventoryRequestStatus;
  page?: number;
  size?: number;
}

export interface ApproveInventoryRequestItemPayload {
  itemId: string;
  approvedQuantity: number;
}

export interface ApproveInventoryRequestPayload {
  note?: string;
  items: ApproveInventoryRequestItemPayload[];
}

export interface NotePayload {
  note?: string;
}

export const inventoryRequestService = {
  /**
   * GET: /api/admin/inventory-requests
   * Lấy danh sách yêu cầu nhập hàng (có lọc theo trạng thái và phân trang)
   */
  getInventoryRequests: async (
    params?: GetInventoryRequestsParams,
  ): Promise<ApiResponse<PaginatedResponse<InventoryRequest>>> => {
    const response = await axiosClient.get<
      ApiResponse<PaginatedResponse<InventoryRequest>>
    >("/api/admin/inventory-requests", {
      params,
    });
    return response.data;
  },

  /**
   * GET: /api/admin/inventory-requests/{requestId}
   * Lấy chi tiết một yêu cầu nhập hàng
   */
  getInventoryRequestById: async (
    requestId: string,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.get<ApiResponse<InventoryRequest>>(
      `/api/admin/inventory-requests/${requestId}`,
    );
    return response.data;
  },

  /**
   * PATCH: /api/admin/inventory-requests/{requestId}/approve
   * Duyệt yêu cầu nhập hàng và số lượng được duyệt cho từng sản phẩm
   */
  approveInventoryRequest: async (
    requestId: string,
    data: ApproveInventoryRequestPayload,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.patch<ApiResponse<InventoryRequest>>(
      `/api/admin/inventory-requests/${requestId}/approve`,
      data,
    );
    return response.data;
  },

  /**
   * PATCH: /api/admin/inventory-requests/{requestId}/close
   * Đóng yêu cầu nhập hàng (thường dùng khi đã nhận một phần và không nhận tiếp)
   */
  closeInventoryRequest: async (
    requestId: string,
    data?: NotePayload,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.patch<ApiResponse<InventoryRequest>>(
      `/api/admin/inventory-requests/${requestId}/close`,
      data || {},
    );
    return response.data;
  },

  /**
   * PATCH: /api/admin/inventory-requests/{requestId}/reject
   * Từ chối yêu cầu nhập hàng
   */
  rejectInventoryRequest: async (
    requestId: string,
    data?: NotePayload,
  ): Promise<ApiResponse<InventoryRequest>> => {
    const response = await axiosClient.patch<ApiResponse<InventoryRequest>>(
      `/api/admin/inventory-requests/${requestId}/reject`,
      data || {},
    );
    return response.data;
  },
};
