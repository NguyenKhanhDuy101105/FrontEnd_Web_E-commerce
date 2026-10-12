import axiosClient from "../../lib/axiosClient";

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface UserInfo {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  gender: string;
  birthDate: string;
}

export interface LoginData {
  accessToken: string;
  user: UserInfo;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface ResendOtpRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  birthDate: string;
  gender: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const authService = {
  // POST: /api/auth/register
  register: async (data: RegisterRequest): Promise<ApiResponse<UserInfo>> => {
    const response = await axiosClient.post<ApiResponse<UserInfo>>(
      "/api/auth/register",
      data,
    );
    return response.data;
  },

  // POST: /api/auth/verify-otp
  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<UserInfo>> => {
    const response = await axiosClient.post<ApiResponse<UserInfo>>(
      "/api/auth/verify-otp",
      data,
    );
    return response.data;
  },

  // POST: /api/auth/login
  login: async (data: LoginRequest): Promise<ApiResponse<LoginData>> => {
    const response = await axiosClient.post<ApiResponse<LoginData>>(
      "/api/auth/login",
      data,
    );
    return response.data;
  },

  // POST: /api/auth/resend-otp
  resendOtp: async (
    data: ResendOtpRequest,
  ): Promise<ApiResponse<string | null>> => {
    const response = await axiosClient.post<ApiResponse<string | null>>(
      "/api/auth/resend-otp",
      data,
    );
    return response.data;
  },

  // POST: /api/auth/forgot-password
  forgotPassword: async (
    data: ResendOtpRequest,
  ): Promise<ApiResponse<string | null>> => {
    const response = await axiosClient.post<ApiResponse<string | null>>(
      "/api/auth/forgot-password",
      data,
    );
    return response.data;
  },

  // POST: /api/auth/reset-password
  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<ApiResponse<string | null>> => {
    const response = await axiosClient.post<ApiResponse<string | null>>(
      "/api/auth/reset-password",
      data,
    );
    return response.data;
  },

  // PATCH: /api/auth/change-password
  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await axiosClient.patch("/auth/change-password", payload);
    return response.data;
  },

  // GET: /api/users/me - Lấy thông tin tài khoản đang đăng nhập
  getMe: async (): Promise<ApiResponse<UserInfo>> => {
    const response =
      await axiosClient.get<ApiResponse<UserInfo>>("/api/users/me");
    return response.data;
  },

  // PATCH: /api/users/me - Cập nhật thông tin tài khoản
  updateMe: async (
    data: UpdateProfileRequest,
  ): Promise<ApiResponse<UserInfo>> => {
    const response = await axiosClient.patch<ApiResponse<UserInfo>>(
      "/api/users/me",
      data,
    );
    return response.data;
  },
};
