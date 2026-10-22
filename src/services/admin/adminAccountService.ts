import axiosClient from "@/src/lib/axiosClient";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type UserRole = "CUSTOMER" | "BRANCH" | "ADMIN";
export type UserStatus = "ACTIVE" | "LOCKED";

// Model Người dùng
export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: string;
  role: UserRole;
  status: UserStatus;
  branchId?: string | null;
  branchName?: string | null;
  createdAt: string;
}

// Phân trang Spring Data
export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  empty: boolean;
}

// Query Params cho GET /api/admin/users
export interface GetUsersParams {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
}

// Request Payload cho POST /api/admin/users
export interface CreateUserPayload {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: string;
  role: UserRole;
  branchId?: string | null;
}

// Request Payload cho PUT /api/admin/users/{userId}
export interface UpdateUserPayload {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: string;
  role: UserRole;
  status: UserStatus;
  branchId?: string | null;
}

// ==========================================
// 2. SERVICE API (5 ENDPOINTS)
// ==========================================

export const adminAccountService = {
  /**
   * 1. GET /api/admin/users
   * Lấy danh sách người dùng (hỗ trợ lọc theo keyword, role, status và phân trang)
   */
  getUsers: async (
    params?: GetUsersParams,
  ): Promise<ApiResponse<PageableResponse<User>>> => {
    const response = await axiosClient.get<ApiResponse<PageableResponse<User>>>(
      "/api/admin/users",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          keyword: params?.keyword,
          role: params?.role,
          status: params?.status,
        },
      },
    );
    return response.data;
  },

  /**
   * 2. GET /api/admin/users/{userId}
   * Lấy chi tiết thông tin 1 người dùng theo ID
   */
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await axiosClient.get<ApiResponse<User>>(
      `/api/admin/users/${userId}`,
    );
    return response.data;
  },

  /**
   * 3. POST /api/admin/users
   * Tạo mới người dùng (Khách hàng / Nhân viên chi nhánh / Admin)
   */
  createUser: async (
    payload: CreateUserPayload,
  ): Promise<ApiResponse<User>> => {
    const response = await axiosClient.post<ApiResponse<User>>(
      "/api/admin/users",
      payload,
    );
    return response.data;
  },

  /**
   * 4. PUT /api/admin/users/{userId}
   * Cập nhật thông tin người dùng theo ID
   */
  updateUser: async (
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<ApiResponse<User>> => {
    const response = await axiosClient.put<ApiResponse<User>>(
      `/api/admin/users/${userId}`,
      payload,
    );
    return response.data;
  },

  /**
   * 5. DELETE /api/admin/users/{userId}
   * Xóa người dùng theo ID
   */
  deleteUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await axiosClient.delete<ApiResponse<User>>(
      `/api/admin/users/${userId}`,
    );
    return response.data;
  },
};

export default adminAccountService;
