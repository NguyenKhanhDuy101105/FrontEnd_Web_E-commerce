"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { authService } from "@/src/services/customer/authService";
import axios from "axios";
import { formatDate } from "@/src/lib/utils";
import { showToast } from "@/src/utils/toast";
import {
  PhoneIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Vui lòng nhập họ và tên")
    .test(
      "single-space-between-words",
      "Mỗi từ trong họ và tên chỉ được cách nhau bởi 1 khoảng trắng",
      (value) => {
        if (!value) return false;
        return !/\s{2,}/.test(value);
      },
    )
    .matches(
      /^[\p{L}]+(?:\s[\p{L}]+)*$/u,
      "Họ và tên chỉ bao gồm chữ cái và mỗi từ cách nhau 1 khoảng trắng",
    )
    .min(2, "Họ và tên quá ngắn"),
  phone: yup
    .string()
    .trim()
    .required("Vui lòng nhập số điện thoại")
    .matches(/^\d+$/, "Số điện thoại chỉ được chứa chữ số")
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ"),
  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Địa chỉ email không hợp lệ",
    ),
  dob: yup
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
  gender: yup.string().required("Vui lòng chọn giới tính"),
  password: yup
    .string()
    .test("required-no-only-spaces", "Vui lòng nhập mật khẩu", (value) =>
      Boolean(value && value.trim().length > 0),
    )
    .test(
      "no-spaces",
      "Mật khẩu không được chứa khoảng trắng",
      (value) => !value || !/\s/.test(value),
    )
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .test(
      "no-spaces",
      "Mật khẩu xác nhận không được chứa khoảng trắng",
      (value) => !value || !/\s/.test(value),
    )
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không trùng khớp"),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "Bạn cần đồng ý với Chính sách bảo mật để đăng ký"),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      gender: "MALE",
    },
  });

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/^\s+/, "");
    setValue("fullName", cleanedValue, { shouldValidate: true });
  };

  const handleFullNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const trimmedValue = e.target.value.trim();
    setValue("fullName", trimmedValue, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, "");
    setValue("phone", numericOnly, { shouldValidate: true });
  };

  const handlePasswordChange = (
    field: "password" | "confirmPassword",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const noSpacesValue = e.target.value.replace(/\s+/g, "");
    setValue(field, noSpacesValue, { shouldValidate: true });
  };

  const preventSpaceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        fullName: data.fullName.trim(),
        phone: data.phone,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        birthDate: formatDate(data.dob),
        gender: data.gender,
      };

      await authService.register(payload);

      showToast.success("Mã OTP đã được gửi đến email của bạn!");
      router.push(`/auth/otp_verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);

      let message = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      showToast.error(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full bg-white p-5 sm:p-8 rounded-3xl border border-slate-100 shadow-xl max-w-140 mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto space-x-2.5">
          <div className="relative w-8 h-8">
            <Image
              src="/images/Logo.jpeg"
              alt="UrbanMart Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">
            Urban<span className="text-emerald-600">Mart</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center bg-slate-100 p-1.5 rounded-full text-xs font-semibold">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Đăng nhập
          </Link>
          <span className="px-4 py-2 bg-[#0d5c3a] text-white rounded-full shadow-xs">
            Đăng ký
          </span>
        </div>
      </div>

      <div className="mb-4 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
          Tạo tài khoản UrbanMart
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              {...register("fullName", {
                onChange: handleFullNameChange,
                onBlur: handleFullNameBlur,
              })}
              placeholder="Nhập họ và tên đầy đủ"
              className={`w-full pl-11 pr-4 py-3 text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.fullName
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-600"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              {...register("phone", {
                onChange: handlePhoneChange,
              })}
              placeholder="Nhập số điện thoại"
              className={`w-full pl-11 pr-4 py-3 text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.phone
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-600"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Địa chỉ Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <EnvelopeIcon className="w-4 h-4" />
            </div>
            <input
              type="email"
              {...register("email")}
              placeholder="example@gmail.com"
              className={`w-full pl-11 pr-4 py-3 text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-600"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                max={todayStr}
                {...register("dob")}
                className={`w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 ${
                  errors.dob
                    ? "border-red-400 focus:ring-red-400"
                    : "border-slate-200 focus:ring-emerald-600"
                }`}
              />
            </div>
            {errors.dob && (
              <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
                {errors.dob.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Giới tính
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserGroupIcon className="w-4 h-4" />
              </div>
              <select
                {...register("gender")}
                className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all duration-200 text-slate-800 cursor-pointer"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              onKeyDown={preventSpaceKeyDown}
              {...register("password", {
                onChange: (e) => handlePasswordChange("password", e),
              })}
              placeholder="Tối thiểu 8 ký tự"
              className={`w-full pl-11 pr-11 py-3 text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.password
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-600"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <ArrowPathIcon className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              onKeyDown={preventSpaceKeyDown}
              {...register("confirmPassword", {
                onChange: (e) => handlePasswordChange("confirmPassword", e),
              })}
              placeholder="Nhập lại mật khẩu"
              className={`w-full pl-11 pr-11 py-3 text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.confirmPassword
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-600"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="acceptTerms"
              {...register("acceptTerms")}
              className="mt-1 w-4 h-4 text-[#0d5c3a] bg-slate-50 border-slate-300 rounded focus:ring-0 focus:outline-none cursor-pointer shrink-0"
            />
            <label
              htmlFor="acceptTerms"
              className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify cursor-pointer select-none"
            >
              Bằng việc đánh dấu vào ô này, Tôi xác nhận đã đọc và đồng ý với{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
              >
                Chính sách bảo mật
              </Link>{" "}
              của UrbanMart, bao gồm quyền thu thập, sử dụng và tiết lộ dữ liệu
              cá nhân của tôi theo pháp luật quy định.
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500 font-medium pl-6 animate-fadeIn">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#0d5c3a] hover:bg-[#09472d] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 mt-3"
        >
          {isSubmitting ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Đăng ký tài khoản</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-4 text-center text-xs sm:text-sm text-slate-600">
        Bạn đã có tài khoản?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-[#0d5c3a] hover:underline transition-all"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </motion.div>
  );
}
