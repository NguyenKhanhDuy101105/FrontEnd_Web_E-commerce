import axiosClient from "@/src/lib/axiosClient";

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type OrderGroup =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "WAITING"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export type DeliveryType = "DELIVERY" | "PICKUP";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "READY_FOR_PICKUP"
  | "DELIVERY_FAILED"
  | "DELIVERED_PENDING_CONFIRMATION"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "VNPAY";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderSummary {
  id: string;
  orderCode: string;
  branchId: string;
  branchName: string;
  deliveryType: DeliveryType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  deliveredAt?: string | null;
}

export interface OrderDetail {
  id: string;
  orderCode: string;
  branchId: string;
  deliveryType: DeliveryType;
  status: OrderStatus;
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
  items: OrderItem[];
}

export interface PageableOrdersResponse {
  content: OrderSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetOrdersParams {
  page?: number;
  size?: number;
  group?: OrderGroup;
}

export interface CreateOrderPayload {
  clientRequestId?: string;
  branchId: string;
  deliveryType?: DeliveryType;
  promotionCode?: string | null;
  addressId?: string;
  receiveFrom?: string;
  receiveTo?: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingLat?: number;
  shippingLng?: number;
  note?: string;
}

export const orderService = {
  getOrders: async (
    params?: GetOrdersParams,
  ): Promise<ApiResponse<PageableOrdersResponse>> => {
    const response = await axiosClient.get<ApiResponse<PageableOrdersResponse>>(
      "/api/orders",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          group: params?.group ?? "ALL",
        },
      },
    );
    return response.data;
  },

  createOrder: async (
    payload: CreateOrderPayload,
  ): Promise<ApiResponse<OrderDetail>> => {
    const response = await axiosClient.post<ApiResponse<OrderDetail>>(
      "/api/orders",
      payload,
    );
    return response.data;
  },

  confirmReceived: async (
    orderId: string,
  ): Promise<ApiResponse<OrderDetail>> => {
    const response = await axiosClient.patch<ApiResponse<OrderDetail>>(
      `/api/orders/${orderId}/confirm-received`,
    );
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<ApiResponse<OrderDetail>> => {
    const response = await axiosClient.get<ApiResponse<OrderDetail>>(
      `/api/orders/${orderId}`,
    );
    return response.data;
  },
};

export default orderService;
