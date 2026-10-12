"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import {
  addressService,
  AddressItem,
} from "@/src/services/customer/addressService";
import { getCoordinatesFromAddress } from "@/src/utils/geocoding";
import SearchableSelect from "@/src/components/addresses/SearchableSelect";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { showToast } from "@/src/utils/toast";

interface Province {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

const addressSchema = yup.object().shape({
  recipientName: yup.string().required("Vui lòng nhập họ tên người nhận"),
  phone: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  email: yup.string().email("Email không hợp lệ").optional(),
  city: yup.string().required("Vui lòng chọn Tỉnh/Thành phố"),
  ward: yup.string().required("Vui lòng chọn Phường/Xã"),
  district: yup.string().optional(),
  line: yup.string().required("Vui lòng nhập địa chỉ cụ thể"),
  note: yup.string().optional(),
  isDefault: yup.boolean().default(false),
});

type AddressFormData = yup.InferType<typeof addressSchema>;

interface AddressFormModalProps {
  isOpen: boolean;
  initialData?: AddressItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddressFormModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: AddressFormModalProps) {
  const [apiError, setApiError] = useState<string>("");
  const isEditMode = !!initialData;

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    values: initialData
      ? {
          recipientName: initialData.recipientName || "",
          phone: initialData.phone || "",
          city: initialData.city || "",
          ward: initialData.ward || "",
          district: initialData.district || "",
          line: initialData.line || "",
          isDefault: !!(initialData.default || initialData.isDefault),
        }
      : {
          recipientName: "",
          phone: "",
          email: "",
          city: "",
          ward: "",
          district: "",
          line: "",
          note: "",
          isDefault: false,
        },
  });

  const selectedCityName = watch("city");

  useEffect(() => {
    if (!isOpen) return;

    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await axios.get<Province[]>(
          "https://provinces.open-api.vn/api/p/",
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách Tỉnh/Thành:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, [isOpen]);

  const fetchWardsByProvince = useCallback(async (cityName: string) => {
    if (!cityName) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    try {
      const resProvinces = await axios.get<Province[]>(
        "https://provinces.open-api.vn/api/p/",
      );
      const foundProvince = resProvinces.data.find((p) => p.name === cityName);

      if (foundProvince) {
        const resDetail = await axios.get(
          `https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=3`,
        );

        if (resDetail.data && resDetail.data.districts) {
          const allWards: Ward[] = resDetail.data.districts.flatMap(
            (district: { wards?: Ward[] }) => district.wards || [],
          );
          setWards(allWards);
        } else {
          setWards([]);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải Phường/Xã:", error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCityName) {
      fetchWardsByProvince(selectedCityName);
    } else {
      setWards([]);
    }
  }, [selectedCityName, fetchWardsByProvince]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setApiError("");
    reset();
    onClose();
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setApiError("");

      const coords = await getCoordinatesFromAddress(
        data.line,
        data.ward,
        data.district || "",
        data.city,
      );

      const payload = {
        recipientName: data.recipientName,
        phone: data.phone,
        line: data.line,
        ward: data.ward,
        district: data.district || "",
        city: data.city,
        lat: coords.lat ?? initialData?.lat ?? 0,
        lng: coords.lng ?? initialData?.lng ?? 0,
        default: !!data.isDefault,
        isDefault: !!data.isDefault,
      };

      if (isEditMode && initialData) {
        await addressService.updateAddress(initialData.id, payload);
        showToast.success("Cập nhật địa chỉ thành công!");
      } else {
        await addressService.createAddress(payload);
        showToast.success("Thêm địa chỉ mới thành công!");
      }

      if (onSuccess) {
        await onSuccess();
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      let message = "Không thể lưu địa chỉ. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      setApiError(message);
      showToast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? "Chỉnh sửa địa chỉ" : "Thông tin người nhận hàng"}
        </h2>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <span className="text-red-500">*</span> Họ tên
            </label>
            <input
              type="text"
              {...register("recipientName")}
              placeholder="Vui lòng nhập tên người nhận"
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d5c3a] transition-all text-slate-800 placeholder-slate-400"
            />
            {errors.recipientName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.recipientName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-red-500">*</span> Số điện thoại
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d5c3a] transition-all text-slate-800 placeholder-slate-400"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d5c3a] transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Địa chỉ nhận hàng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Ô Tìm Kiếm Tỉnh/Thành phố */}
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Tỉnh/Thành phố"
                    required
                    options={provinces}
                    value={field.value}
                    placeholder="-- Chọn Tỉnh/Thành phố --"
                    searchPlaceholder="Nhập tên tỉnh/thành (VD: Hà Nội, Đà Nẵng...)"
                    disabled={loadingProvinces}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("ward", "");
                    }}
                    error={errors.city?.message}
                  />
                )}
              />

              <Controller
                name="ward"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Phường/Xã"
                    required
                    options={wards}
                    value={field.value}
                    placeholder="-- Chọn Phường/Xã --"
                    searchPlaceholder="Nhập 1-2 từ (VD: Tây Tựu, Dịch Vọng...)"
                    disabled={!selectedCityName || loadingWards}
                    onChange={(val) => field.onChange(val)}
                    error={errors.ward?.message}
                  />
                )}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-red-500">*</span> Địa chỉ cụ thể
              </label>
              <input
                type="text"
                {...register("line")}
                placeholder="Số nhà, ngõ, tên đường..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d5c3a] transition-all text-slate-800 placeholder-slate-400"
              />
              {errors.line && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.line.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                {...register("note")}
                placeholder="Ví dụ: Cổng màu xanh, nhà bên cạnh cây xăng"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d5c3a] transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 mt-3">
              <input
                type="checkbox"
                id="isDefault"
                {...register("isDefault")}
                className="w-4 h-4 text-[#0d5c3a] border-slate-300 rounded focus:ring-[#0d5c3a] cursor-pointer accent-[#0d5c3a]"
              />
              <label
                htmlFor="isDefault"
                className="text-xs font-medium text-slate-700 cursor-pointer"
              >
                Đặt làm mặc định
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0d5c3a] hover:bg-[#094229] text-white font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer disabled:opacity-70 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý tọa độ...</span>
                </>
              ) : isEditMode ? (
                "Cập nhật địa chỉ"
              ) : (
                "Lưu địa chỉ"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
