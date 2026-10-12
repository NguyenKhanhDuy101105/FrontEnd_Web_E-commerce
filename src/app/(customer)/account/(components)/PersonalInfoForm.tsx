"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  authService,
  UpdateProfileRequest,
} from "@/src/services/customer/authService";
import { showToast } from "@/src/utils/toast";

// 1. Validation Schema chuẩn Yup
const profileSchema = yup.object().shape({
  fullName: yup.string().required("Vui lòng nhập họ và tên"),
  email: yup
    .string()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ"),
  phone: yup.string().optional(),
  birthDate: yup.string().required("Vui lòng chọn ngày sinh"),
  gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"], "Giới tính không hợp lệ")
    .required("Vui lòng chọn giới tính"),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

interface PersonalInfoFormProps {
  onUpdateSuccess?: () => void;
}

export default function PersonalInfoForm({
  onUpdateSuccess,
}: PersonalInfoFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Setup React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "MALE",
    },
  });

  // 3. Call API Lấy thông tin cá nhân (getMe)
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authService.getMe();
      if (res?.data) {
        const userData = res.data;

        const formattedBirthDate = userData.birthDate
          ? new Date(userData.birthDate).toISOString().split("T")[0]
          : userData.createdAt
            ? new Date(userData.createdAt).toISOString().split("T")[0]
            : "";

        const formValues: ProfileFormData = {
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          birthDate: formattedBirthDate,
          gender: userData.gender || "MALE",
        };

        reset(formValues);
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

  // 4. Call API Cập nhật thông tin (updateMe)
  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: UpdateProfileRequest = {
        fullName: data.fullName,
        email: data.email,
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

        reset(data); // Cập nhật lại form state (isDirty = false)

        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
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
      <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xs space-y-4">
        <div className="h-6 bg-slate-200 rounded-md w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-100 shadow-xs space-y-5">
      {/* Header Form */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Thông tin cá nhân
          </h2>
        </div>
        <Link
          href="/account/change_password"
          className="text-xs font-semibold text-slate-600 hover:text-[#0d5c3a] flex items-center space-x-1"
        >
          <span> Đổi mật khẩu</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Họ và tên */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                {...register("fullName")}
                placeholder="Nhập họ và tên"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-[#0d5c3a] transition-all"
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-red-500 mt-0.5">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* 2. Số điện thoại */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Số điện thoại
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <PhoneIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                {...register("phone")}
                disabled
                placeholder="Số điện thoại"
                className="w-full pl-9 pr-12 py-2 text-xs sm:text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 3. Địa chỉ Email */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <EnvelopeIcon className="w-4 h-4" />
              </div>
              <input
                type="email"
                {...register("email")}
                placeholder="Nhập địa chỉ email"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-[#0d5c3a] transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-0.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 4. Ngày sinh */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Ngày sinh
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                {...register("birthDate")}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-[#0d5c3a] transition-all"
              />
            </div>
            {errors.birthDate && (
              <p className="text-[11px] text-red-500 mt-0.5">
                {errors.birthDate.message}
              </p>
            )}
          </div>
        </div>

        {/* 5. Giới tính */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            Giới tính
          </label>
          <div className="flex items-center space-x-6 text-xs sm:text-sm">
            {[
              { label: "Nam", value: "MALE" },
              { label: "Nữ", value: "FEMALE" },
              { label: "Khác", value: "OTHER" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={item.value}
                  {...register("gender")}
                  className="accent-[#0d5c3a]"
                />
                <span className="text-slate-700 font-medium">{item.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="text-[11px] text-red-500 mt-0.5">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Nhóm nút bấm action */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {/* Nút Lưu thay đổi */}
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="px-5 py-2.5 bg-[#0d5c3a] hover:bg-[#094229] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-2xs disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Cập nhật</span>
              )}
            </button>

            {/* Nút Hủy (Reset form về dữ liệu ban đầu) */}
            <button
              type="button"
              disabled={!isDirty || isSubmitting}
              onClick={() => reset()}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-600 font-semibold text-xs sm:text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
