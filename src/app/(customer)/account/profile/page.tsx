"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Link from "next/link";
import {
  authService,
  UpdateProfileRequest,
} from "@/src/services/customer/authService";
import { showToast } from "@/src/utils/toast";
import LoadingSpinner from "@/src/components/common/LoadingSpinner";

const profileSchema = yup.object().shape({
  fullName: yup
    .string()
    .transform((value) =>
      typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value,
    )
    .required("Vui lòng nhập họ và tên")
    .min(2, "Họ và tên quá ngắn"),
  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Địa chỉ email không hợp lệ",
    ),
  phone: yup.string().optional(),
  birthDate: yup
    .string()
    .required("Vui lòng chọn ngày sinh")
    .test(
      "not-in-future",
      "Ngày sinh không được lớn hơn ngày hiện tại",
      (value) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return selectedDate <= today;
      },
    ),
  gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"] as const, "Giới tính không hợp lệ")
    .required("Vui lòng chọn giới tính"),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "MALE",
    },
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res?.data) {
        const userData = res.data;

        const validGender: "MALE" | "FEMALE" | "OTHER" =
          userData.gender === "FEMALE" || userData.gender === "OTHER"
            ? userData.gender
            : "MALE";

        reset({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          birthDate: userData.birthDate
            ? new Date(userData.birthDate).toISOString().split("T")[0]
            : userData.createdAt
              ? new Date(userData.createdAt).toISOString().split("T")[0]
              : "",
          gender: validGender,
        });

        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin cá nhân:", error);
      let message = "Không thể tải thông tin cá nhân. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const cleanedFullName = data.fullName.trim().replace(/\s+/g, " ");
      const cleanedEmail = data.email.trim();

      const payload: UpdateProfileRequest = {
        fullName: cleanedFullName,
        email: cleanedEmail,
        birthDate: data.birthDate,
        gender: data.gender,
      };

      const res = await authService.updateMe(payload);

      if (res?.data) {
        showToast.success("Cập nhật thông tin tài khoản thành công!");

        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, ...res.data }),
        );
        reset({
          ...data,
          fullName: cleanedFullName,
          email: cleanedEmail,
        });

        setIsReloading(true);
        window.location.reload();
      }
    } catch (error) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
      let message = "Cập nhật thông tin thất bại. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showToast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 font-medium text-sm">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-6">
      {isReloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-xs">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Thông tin tài khoản
        </h1>

        <Link
          href="/account/change_password"
          className="text-sm text-[#0d5c3a] hover:text-[#083c26] hover:underline font-semibold transition-colors cursor-pointer"
        >
          Đổi mật khẩu
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ tên
            </label>
            <input
              type="text"
              {...register("fullName")}
              placeholder="Nhập họ và tên"
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800"
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Số điện thoại
            </label>
            <input
              type="text"
              {...register("phone")}
              readOnly
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Ngày sinh
            </label>
            <input
              type="date"
              max={todayStr}
              {...register("birthDate")}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800"
            />
            {errors.birthDate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.birthDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Giới tính
            </label>
            <div className="flex items-center space-x-6">
              {[
                { label: "Nam", value: "MALE" },
                { label: "Nữ", value: "FEMALE" },
                { label: "Khác", value: "OTHER" },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    value={item.value}
                    {...register("gender")}
                    className="w-4 h-4 cursor-pointer accent-[#0d5c3a] focus:ring-[#0d5c3a]"
                  />
                  <span className="font-medium">{item.label}</span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="text-xs text-red-500 mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-6 py-2.5 bg-[#0d5c3a] hover:bg-[#094229] active:scale-[0.98] text-white font-medium text-sm rounded-lg transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
}
