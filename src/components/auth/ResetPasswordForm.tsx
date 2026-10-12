"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import axios from "axios";
import { authService } from "@/src/services/customer/authService";
import {
  ArrowLeftIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const resetSchema = yup.object().shape({
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu mới")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu mới")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không trùng khớp"),
});

type ResetFormData = yup.InferType<typeof resetSchema>;

interface ResetPasswordFormProps {
  phone?: string;
}

export default function ResetPasswordForm({
  phone: propPhone,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phoneParam = propPhone || searchParams.get("phone") || "090***4567";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countdown, setCountdown] = useState<number>(0);
  const [otpError, setOtpError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: yupResolver(resetSchema),
    mode: "onChange",
  });

  const watchPassword = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass)
      return { label: "Chưa nhập", color: "bg-slate-200", percent: "0%" };
    if (pass.length < 8)
      return { label: "Yếu", color: "bg-red-500", percent: "25%" };

    let score = 0;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 0)
      return { label: "Trung bình", color: "bg-yellow-500", percent: "50%" };
    if (score === 1)
      return { label: "Khá", color: "bg-blue-500", percent: "75%" };
    return { label: "Mạnh", color: "bg-emerald-600", percent: "100%" };
  };

  const strength = getPasswordStrength(watchPassword);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setOtpError("");
    setApiError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      setOtpError("");
      setApiError("");

      await authService.resendOtp({ phone: phoneParam });

      setCountdown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      let message = "Không thể gửi lại mã OTP. Vui lòng thử lại sau!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setOtpError(message);
    }
  };

  const onSubmit = async (data: ResetFormData) => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số mã OTP");
      return;
    }

    try {
      setApiError("");
      setOtpError("");

      await authService.resetPassword({
        phone: phoneParam,
        otp: fullOtp,
        newPassword: data.password,
      });

      router.push("/auth/login?reset=success");
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);

      let message = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setApiError(message);
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
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

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
      </div>

      <div className="mb-7 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Xác thực mã OTP
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Mã xác thực gồm 6 số đã gửi tới{" "}
          <strong className="text-slate-800 font-semibold">{phoneParam}</strong>{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/forgot_pass")}
            className="text-[#0d5c3a] font-semibold hover:underline cursor-pointer ml-1"
          >
            Đổi số khác
          </button>
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-2xl text-center font-medium">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <div className="grid grid-cols-6 gap-2 sm:gap-3 my-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className={`w-full h-12 sm:h-14 text-center text-lg sm:text-2xl font-bold bg-slate-50/80 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200 text-slate-800 ${
                  digit
                    ? "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20"
                    : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600"
                }`}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-xs text-red-500 font-medium text-center mb-2">
              {otpError}
            </p>
          )}

          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-1">
            <div className="flex items-center space-x-1.5">
              <ClockIcon className="w-4 h-4 text-slate-400" />
              <span>Gửi lại mã sau</span>
              <span className="font-semibold text-slate-700">
                0:{countdown < 10 ? `0${countdown}` : countdown}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0}
              className={`font-semibold transition-colors cursor-pointer ${
                countdown > 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-[#0d5c3a] hover:underline"
              }`}
            >
              Gửi lại mã
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">
              Mật khẩu mới
            </label>
            <span className="text-xs text-slate-400 font-medium">
              Tối thiểu 8 ký tự
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
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

          <div className="mt-2.5">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex space-x-1">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.percent }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
              <span>Độ bảo mật:</span>
              <span className="font-semibold text-slate-700">
                {strength.label}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <ArrowPathIcon className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Nhập lại mật khẩu mới"
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

        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#0d5c3a] hover:bg-[#09472d] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 mt-4"
        >
          {isSubmitting ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Xác nhận & Đổi mật khẩu</span>
              <CheckCircleIcon className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-500">
        Cần trợ giúp?{" "}
        <Link
          href="/support"
          className="font-semibold text-slate-700 hover:text-[#0d5c3a] hover:underline transition-all"
        >
          Liên hệ Chăm sóc khách hàng
        </Link>
      </div>
    </motion.div>
  );
}
