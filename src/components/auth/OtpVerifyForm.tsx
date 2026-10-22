"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { authService } from "@/src/services/customer/authService";
import axios from "axios";
import { showToast } from "@/src/utils/toast";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface OtpVerifyFormProps {
  phone?: string;
  onBack?: () => void;
  onVerifySuccess?: (otp: string) => void;
}

export default function OtpVerifyForm({
  phone: propPhone,
  onBack,
  onVerifySuccess,
}: OtpVerifyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phoneParam = propPhone || searchParams.get("phone") || "***";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [countdown, setCountdown] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setErrorMsg("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      setErrorMsg("");

      const response = await authService.resendOtp({ phone: phoneParam });

      console.log("Kết quả gửi lại OTP:", response);

      showToast.success("Mã OTP mới đã được gửi lại thành công!");
      setCountdown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);

      let message = "Không thể gửi lại mã OTP. Vui lòng thử lại sau!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorMsg(message);
      showToast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      const msg = "Vui lòng nhập đủ 6 chữ số mã xác nhận";
      setErrorMsg(msg);
      showToast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const res = await authService.verifyOtp({
        phone: phoneParam,
        otp: fullOtp,
      });

      console.log("Xác thực OTP thành công:", res);

      showToast.success("Xác thực OTP thành công!");

      if (res?.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
      }

      if (onVerifySuccess) {
        onVerifySuccess(fullOtp);
      } else {
        router.push("/auth/login?registered=success");
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);

      let message = "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại!";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorMsg(message);
      showToast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
          onClick={onBack || (() => router.back())}
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
            onClick={onBack || (() => router.back())}
            className="text-[#0d5c3a] font-semibold hover:underline cursor-pointer ml-1"
          >
            Đổi số khác
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-6 gap-2 sm:gap-3 my-4">
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
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-full h-12 sm:h-14 text-center text-lg sm:text-2xl font-bold bg-slate-50/80 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200 text-slate-800 ${
                digit
                  ? "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20"
                  : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600"
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 text-center font-medium">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-1">
          <div className="flex items-center space-x-1.5">
            <ClockIcon className="w-4 h-4 text-slate-400" />
            <span>Gửi lại mã sau</span>
            <span className="font-semibold text-slate-700">
              {formatTime(countdown)}
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
              <span>Xác nhận & Đăng ký</span>
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
