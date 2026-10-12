import axiosClient from "../../lib/axiosClient";

export interface AddressItem {
  id: string;
  recipientName: string;
  phone: string;
  line: string;
  ward: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  createdAt: string;
  default: boolean;
  isDefault?: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  line: string;
  ward: string;
  district: string;
  city: string;
  lat?: number;
  lng?: number;
  default?: boolean;
  isDefault?: boolean;
}

export const addressService = {
  // GET: /api/addresses - Lấy danh sách tất cả địa chỉ
  getAddresses: async (): Promise<ApiResponse<AddressItem[]>> => {
    const response =
      await axiosClient.get<ApiResponse<AddressItem[]>>("/api/addresses");
    return response.data;
  },

  // GET: /api/addresses - Lấy địa chỉ mặc định từ danh sách
  getDefaultAddress: async (): Promise<AddressItem | null> => {
    const response =
      await axiosClient.get<ApiResponse<AddressItem[]>>("/api/addresses");
    const addressList = response.data?.data || [];
    return (
      addressList.find(
        (item) => item.default === true || item.isDefault === true,
      ) || null
    );
  },

  // GET: /api/addresses/{addressId} - Lấy chi tiết 1 địa chỉ theo ID
  getAddressById: async (
    addressId: string,
  ): Promise<ApiResponse<AddressItem>> => {
    const response = await axiosClient.get<ApiResponse<AddressItem>>(
      `/api/addresses/${addressId}`,
    );
    return response.data;
  },

  // POST: /api/addresses - Tạo mới địa chỉ
  createAddress: async (
    data: AddressRequest,
  ): Promise<ApiResponse<AddressItem>> => {
    const response = await axiosClient.post<ApiResponse<AddressItem>>(
      "/api/addresses",
      data,
    );
    return response.data;
  },

  // PUT: /api/addresses/{addressId} - Cập nhật địa chỉ theo ID
  updateAddress: async (
    addressId: string,
    data: AddressRequest,
  ): Promise<ApiResponse<AddressItem>> => {
    const response = await axiosClient.put<ApiResponse<AddressItem>>(
      `/api/addresses/${addressId}`,
      data,
    );
    return response.data;
  },

  // PATCH: /api/addresses/{addressId}/default - Đặt làm địa chỉ mặc định
  setDefaultAddress: async (
    addressId: string,
  ): Promise<ApiResponse<AddressItem>> => {
    const response = await axiosClient.patch<ApiResponse<AddressItem>>(
      `/api/addresses/${addressId}/default`,
    );
    return response.data;
  },

  // DELETE: /api/addresses/{addressId} - Xóa địa chỉ theo ID
  deleteAddress: async (addressId: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      `/api/addresses/${addressId}`,
    );
    return response.data;
  },
};
