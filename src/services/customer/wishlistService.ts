import axiosClient from "../../lib/axiosClient";

// 1. Interface đại diện cho sản phẩm trong danh sách Yêu thích
export interface WishlistItem {
  wishlistId: string;
  productId: string;
  sku: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  displayPrice: number;
  discountPercent: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  addedAt: string;
}

// 2. Interface Response API chuẩn
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 3. Module Wishlist Service
export const wishlistService = {
  /**
   * GET: /api/wishlists
   * Lấy danh sách toàn bộ sản phẩm yêu thích của người dùng
   */
  getWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    const response =
      await axiosClient.get<ApiResponse<WishlistItem[]>>("/api/wishlists");
    return response.data;
  },

  /**
   * POST: /api/wishlists/{productId}
   * Thêm sản phẩm vào danh sách yêu thích theo productId
   */
  addToWishlist: async (productId: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>(
      `/api/wishlists/${productId}`,
    );
    return response.data;
  },

  /**
   * DELETE: /api/wishlists/{productId}
   * Xóa sản phẩm khỏi danh sách yêu thích theo productId
   */
  removeFromWishlist: async (
    productId: string,
  ): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/wishlists/${productId}`,
    );
    return response.data;
  },
};
