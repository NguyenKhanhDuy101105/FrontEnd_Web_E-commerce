"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { authService } from "@/src/services/customer/authService";
import { branchService } from "@/src/services/store/branchService";
import {
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/src/utils/toast";

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login({
        phone: data.phone,
        password: data.password,
      });

      if (res?.data) {
        const { accessToken, user } = res.data;
        const role = user?.role || "CUSTOMER";

        if (accessToken) {
          localStorage.setItem("token", accessToken);
          localStorage.setItem("accessToken", accessToken);
          Cookies.set("token", accessToken, { expires: 7, path: "/" });
        }
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (role) {
          Cookies.set("role", role, { expires: 7, path: "/" });
        }

        const normalizedRole = role.toUpperCase();

        if (normalizedRole === "BRANCH") {
          try {
            const branchRes = await branchService.getBranches({
              page: 0,
              size: 100,
            });
            const branchList = branchRes.data?.content || [];

            const userRecord = user as unknown as Record<
              string,
              unknown
            > | null;
            const currentUserId = (userRecord?.id || userRecord?.accountId) as
              | string
              | undefined;
            const userBranchId = userRecord?.branchId as string | undefined;

            const matchedBranch = branchList.find(
              (b) =>
                (currentUserId && b.accountId === currentUserId) ||
                (userBranchId && b.id === userBranchId),
            );

            if (matchedBranch) {
              localStorage.setItem("branchId", matchedBranch.id);
              localStorage.setItem(
                "currentBranch",
                JSON.stringify(matchedBranch),
              );
              Cookies.set("branchId", matchedBranch.id, {
                expires: 7,
                path: "/",
              });

              showToast.success(
                `Đăng nhập thành công! Chi nhánh: ${matchedBranch.name}`,
              );
            } else {
              showToast.success(
                "Đăng nhập thành công! Đang chuyển đến không gian chi nhánh.",
              );
            }
          } catch (branchError) {
            console.error("Lỗi lấy thông tin chi nhánh:", branchError);
            showToast.success("Đăng nhập thành công!");
          }

          router.push("/store");
          return;
        }

        showToast.success("Đăng nhập thành công!");
        switch (normalizedRole) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "CUSTOMER":
          default:
            router.push("/");
            break;
        }
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      let message = "Số điện thoại hoặc mật khẩu không chính xác.";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      showToast.error("Số điện thoại hoặc mật khẩu không chính xác.");
      console.log(message);
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
          <span className="px-4 py-2 bg-[#0d5c3a] text-white rounded-full shadow-xs">
            Đăng nhập
          </span>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Đăng ký
          </Link>
        </div>
      </div>

      <div className="mb-6 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
          Đăng nhập UrbanMart
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Định dạng 10 số
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <input
              type="tel"
              maxLength={10}
              {...register("phone")}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
              }}
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
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">
              Mật khẩu <span className="text-red-500">*</span>
            </label>

            <Link
              href="/auth/forgot_pass"
              className="text-xs font-semibold text-[#0d5c3a] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Nhập mật khẩu của bạn"
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

        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#0d5c3a] hover:bg-[#09472d] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 mt-2"
        >
          {isSubmitting ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </>
          )}
        </motion.button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-medium">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => console.log("Login with Google")}
        className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer shadow-2xs"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Đăng nhập với Google</span>
      </button>

      <div className="mt-8 text-center text-xs sm:text-sm text-slate-600">
        Chưa có tài khoản?{" "}
        <Link
          href="/auth/register"
          className="font-bold text-[#0d5c3a] hover:underline transition-all"
        >
          Đăng ký ngay
        </Link>
      </div>
    </motion.div>
  );
}
