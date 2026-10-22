import axiosClient from "@/src/lib/axiosClient";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type BranchOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "READY_FOR_PICKUP"
  | "DELIVERY_FAILED"
  | "DELIVERED_PENDING_CONFIRMATION"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED";

export type DeliveryType = "DELIVERY" | "PICKUP";
export type PaymentMethod = "COD" | "VNPAY";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

// Item sản phẩm trong đơn hàng chi nhánh
export interface BranchOrderItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Tóm tắt đơn hàng trong danh sách (GET /api/branches/{branchId}/orders)
export interface BranchOrderSummary {
  id: string;
  orderCode: string;
  branchId: string;
  branchName: string;
  deliveryType: DeliveryType;
  status: BranchOrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  deliveredAt?: string | null;
}

// Chi tiết đơn hàng chi nhánh đầy đủ
export interface BranchOrderDetail {
  id: string;
  orderCode: string;
  branchId: string;
  deliveryType: DeliveryType;
  status: BranchOrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  note?: string;
  createdAt: string;
  receiveFrom?: string;
  receiveTo?: string;
  deliveredAt?: string | null;
  completedAt?: string | null;
  promotionCode?: string | null;
  items: BranchOrderItem[];
}

// Phân trang Spring Data
export interface PageableBranchOrdersResponse {
  content: BranchOrderSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Params cho GET /api/branches/{branchId}/orders
export interface GetBranchOrdersParams {
  status?: BranchOrderStatus;
  page?: number;
  size?: number;
}

// Request Payload cho Hủy đơn hoặc Giao hàng thất bại
export interface OrderReasonPayload {
  reason: string;
}

// ==========================================
// 2. SERVICE API (8 ENDPOINTS)
// ==========================================

export const branchOrderService = {
  /**
   * 1. GET /api/branches/{branchId}/orders
   * Lấy danh sách đơn hàng của chi nhánh (hỗ trợ lọc theo status và phân trang)
   */
  getBranchOrders: async (
    branchId: string,
    params?: GetBranchOrdersParams,
  ): Promise<ApiResponse<PageableBranchOrdersResponse>> => {
    const response = await axiosClient.get<
      ApiResponse<PageableBranchOrdersResponse>
    >(`/api/branches/${branchId}/orders`, {
      params: {
        status: params?.status,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return response.data;
  },

  /**
   * 2. GET /api/branches/{branchId}/orders/{orderId}
   * Lấy thông tin chi tiết 1 đơn hàng tại chi nhánh
   */
  getBranchOrderById: async (
    branchId: string,
    orderId: string,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.get<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}`,
    );
    return response.data;
  },

  /**
   * 3. PATCH /api/branches/{branchId}/orders/{orderId}/confirm
   * Xác nhận đơn hàng (Duyệt đơn)
   */
  confirmOrder: async (
    branchId: string,
    orderId: string,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}/confirm`,
    );
    return response.data;
  },

  /**
   * 4. PATCH /api/branches/{branchId}/orders/{orderId}/preparation-complete
   * Hoàn tất chuẩn bị hàng (Sẵn sàng giao / chờ tài xế)
   */
  completePreparation: async (
    branchId: string,
    orderId: string,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}/preparation-complete`,
    );
    return response.data;
  },

  /**
   * 5. PATCH /api/branches/{branchId}/orders/{orderId}/handover
   * Bàn giao đơn hàng cho đơn vị vận chuyển / Shipper
   */
  handoverOrder: async (
    branchId: string,
    orderId: string,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}/handover`,
    );
    return response.data;
  },

  /**
   * 6. PATCH /api/branches/{branchId}/orders/{orderId}/delivery-failed
   * Báo cáo giao hàng thất bại (Kèm lý do)
   */
  reportDeliveryFailed: async (
    branchId: string,
    orderId: string,
    payload: OrderReasonPayload,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}/delivery-failed`,
      payload,
    );
    return response.data;
  },

  /**
   * 7. PATCH /api/branches/{branchId}/orders/{orderId}/retry-delivery
   * Thử lại giao hàng (Chuyển trạng thái để shipper giao lại)
   */
  retryDelivery: async (
    branchId: string,
    orderId: string,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}/retry-delivery`,
    );
    return response.data;
  },

  /**
   * 8. PATCH /api/branches/{branchId}/orders/{orderId}/cancel
   * Hủy đơn hàng bởi chi nhánh (Kèm lý do)
   */
  cancelOrder: async (
    branchId: string,
    orderId: string,
    payload: OrderReasonPayload,
  ): Promise<ApiResponse<BranchOrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<BranchOrderDetail>>(
      `/api/branches/${branchId}/orders/${orderId}/cancel`,
      payload,
    );
    return response.data;
  },
};

export default branchOrderService;
