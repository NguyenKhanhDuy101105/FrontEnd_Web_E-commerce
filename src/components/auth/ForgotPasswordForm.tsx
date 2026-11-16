"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { authService } from "@/src/services/customer/authService";
import { showToast } from "@/src/utils/toast";
import {
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const EMAIL_ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9._%+-@]*$/;
const EMAIL_STRICT_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const forgotSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập địa chỉ email")
    .matches(
      EMAIL_ALLOWED_CHARS_REGEX,
      "Email chỉ được chứa chữ cái không dấu, số và các ký tự . _ % + - @",
    )
    .matches(EMAIL_STRICT_REGEX, "Địa chỉ email không hợp lệ"),
});

type ForgotFormData = yup.InferType<typeof forgotSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: yupResolver(forgotSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const currentEmailVal = useWatch({
    control,
    name: "email",
    defaultValue: "",
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedEmail = e.target.value.replace(/[^a-zA-Z0-9._%+-@]/g, "");
    setValue("email", sanitizedEmail, { shouldValidate: true });
  };

  const preventSpaceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const onSubmit = async (data: ForgotFormData) => {
    const cleanEmail = data.email.trim();
    try {
      await authService.forgotPassword({
        email: cleanEmail,
      });

      showToast.success("Mã xác thực OTP đã được gửi tới email của bạn!");

      router.push(
        `/auth/reset_pass?email=${encodeURIComponent(cleanEmail)}&type=reset_password`,
      );
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", error);

      let message = "Không thể gửi mã xác thực. Vui lòng thử lại sau!";
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
      className="w-full bg-white p-7 sm:p-10 rounded-3xl border border-slate-100 shadow-xl max-w-140 mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
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

        <Link
          href="/auth/login"
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 rounded-full text-xs sm:text-sm font-semibold transition-all"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Quay lại đăng nhập</span>
        </Link>
      </div>

      <div className="mb-7 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
          Quên mật khẩu?
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">
              Email đăng ký <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">
              Định dạng email hợp lệ
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <EnvelopeIcon className="w-4 h-4" />
            </div>
            <input
              type="email"
              onKeyDown={preventSpaceKeyDown}
              {...register("email", {
                onChange: handleEmailChange,
              })}
              placeholder="Nhập địa chỉ email của bạn"
              className={`w-full pl-11 pr-10 py-3 text-sm bg-slate-50/60 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 focus:ring-emerald-600"
              }`}
            />
            {currentEmailVal && !errors.email && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-600">
                <CheckCircleIcon className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 font-medium animate-fadeIn">
              {errors.email.message}
            </p>
          )}
          <p className="text-[11px] text-slate-400 mt-1.5">
            * Mã xác nhận 6 số sẽ được gửi tới hộp thư email này.
          </p>
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
              <span>Gửi mã xác thực OTP</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 pt-2 flex items-center justify-center w-full">
        <div className="text-xs sm:text-sm text-slate-600 text-center">
          Nhớ lại mật khẩu?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-[#0d5c3a] hover:underline transition-all inline-block sm:inline mt-0.5 sm:mt-0"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
