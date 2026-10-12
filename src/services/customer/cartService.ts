import axiosClient from "../../lib/axiosClient";

// 1. Interface đại diện cho từng sản phẩm trong Giỏ hàng
export interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  discountPercent: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  subtotal: number;
}

// 2. Interface đại diện cho Giỏ hàng đầy đủ
export interface CartData {
  cartId: string | null;
  branchId: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

// 3. Interface Response API chuẩn
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 4. Request Body khi thêm sản phẩm vào giỏ
export interface AddToCartRequest {
  branchId: string;
  productId: string;
  quantity: number;
}

// 5. Request Body khi cập nhật số lượng
export interface UpdateCartItemRequest {
  quantity: number;
}

// 6. Module Cart Service
export const cartService = {
  /**
   * GET: /api/cart?branchId={branchId}
   * Lấy thông tin giỏ hàng hiện tại của người dùng theo chi nhánh
   */
  getCart: async (branchId: string): Promise<ApiResponse<CartData>> => {
    const response = await axiosClient.get<ApiResponse<CartData>>("/api/cart", {
      params: { branchId },
    });
    return response.data;
  },

  /**
   * POST: /api/cart/items
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart: async (data: AddToCartRequest): Promise<ApiResponse<CartData>> => {
    const response = await axiosClient.post<ApiResponse<CartData>>(
      "/api/cart/items",
      data,
    );
    return response.data;
  },

  /**
   * PATCH: /api/cart/items/{itemId}
   * Cập nhật số lượng của item trong giỏ hàng
   */
  updateCartItem: async (
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<ApiResponse<CartData>> => {
    const response = await axiosClient.patch<ApiResponse<CartData>>(
      `/api/cart/items/${itemId}`,
      data,
    );
    return response.data;
  },

  /**
   * DELETE: /api/cart/items/{itemId}
   * Xóa 1 sản phẩm ra khỏi giỏ hàng
   */
  removeCartItem: async (itemId: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/cart/items/${itemId}`,
    );
    return response.data;
  },

  /**
   * DELETE: /api/cart?branchId={branchId}
   * Xóa toàn bộ giỏ hàng thuộc chi nhánh đang chọn
   */
  clearCart: async (branchId: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      "/api/cart",
      {
        params: { branchId },
      },
    );
    return response.data;
  },
};
