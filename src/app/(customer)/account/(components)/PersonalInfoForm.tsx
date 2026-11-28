"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  authService,
  UpdateProfileRequest,
} from "@/src/services/customer/authService";
import { showToast } from "@/src/utils/toast";
import UnsavedChangesModal from "@/src/components/common/UnsavedChangesModal";

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

interface PersonalInfoFormProps {
  onUpdateSuccess?: (skipReload?: boolean) => void;
}

export default function PersonalInfoForm({
  onUpdateSuccess,
}: PersonalInfoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  const allowNavigationRef = useRef<boolean>(false);

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

        const formattedBirthDate = userData.birthDate
          ? new Date(userData.birthDate).toISOString().split("T")[0]
          : userData.createdAt
            ? new Date(userData.createdAt).toISOString().split("T")[0]
            : "";

        const validGender: "MALE" | "FEMALE" | "OTHER" =
          userData.gender === "FEMALE" || userData.gender === "OTHER"
            ? userData.gender
            : "MALE";

        const formValues: ProfileFormData = {
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          birthDate: formattedBirthDate,
          gender: validGender,
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

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowNavigationRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const handleDocumentClick = (e: MouseEvent) => {
      if (allowNavigationRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(href, window.location.origin);

      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(
        `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
      );
      setIsLeaveModalOpen(true);
    };

    window.history.pushState({ guardUnsaved: true }, "", window.location.href);
    const handlePopState = () => {
      if (allowNavigationRef.current) return;
      window.history.pushState(
        { guardUnsaved: true },
        "",
        window.location.href,
      );
      setPendingHref("BACK");
      setIsLeaveModalOpen(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  const proceedPendingNavigation = useCallback(() => {
    allowNavigationRef.current = true;
    const destination = pendingHref;
    setIsLeaveModalOpen(false);
    setPendingHref(null);

    if (destination === "BACK") {
      window.history.go(-2);
    } else if (destination) {
      router.push(destination);
    }
  }, [pendingHref, router]);

  const saveProfile = async (
    data: ProfileFormData,
    navigateAfterSave = false,
  ) => {
    try {
      const cleanedFullName = data.fullName.trim().replace(/\s+/g, " ");

      const payload: UpdateProfileRequest = {
        fullName: cleanedFullName,
        email: data.email.trim(),
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
          email: data.email.trim(),
        });

        if (onUpdateSuccess) {
          onUpdateSuccess(navigateAfterSave);
        }

        if (navigateAfterSave) {
          proceedPendingNavigation();
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

  const onSubmit = async (data: ProfileFormData) => {
    await saveProfile(data, false);
  };

  const handleSaveAndLeave = () => {
    setIsLeaveModalOpen(false);
    handleSubmit(async (data) => {
      await saveProfile(data, true);
    })();
  };

  const handleDiscardAndLeave = () => {
    reset();
    proceedPendingNavigation();
  };

  const handleStayOnPage = () => {
    setIsLeaveModalOpen(false);
    setPendingHref(null);
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
    <>
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-100 shadow-xs space-y-5">
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
            <span>Đổi mật khẩu</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  max={todayStr}
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
                  <span className="text-slate-700 font-medium">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="text-[11px] text-red-500 mt-0.5">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
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

      <UnsavedChangesModal
        isOpen={isLeaveModalOpen}
        isSubmitting={isSubmitting}
        subtitle="Bạn đã chỉnh sửa thông tin cá nhân nhưng chưa lưu lại."
        onStay={handleStayOnPage}
        onDiscard={handleDiscardAndLeave}
        onSave={handleSaveAndLeave}
      />
    </>
  );
}
