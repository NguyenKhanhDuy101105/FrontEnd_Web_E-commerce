"use client";

import React, { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { authService } from "@/src/services/authService";
import { showToast } from "@/src/utils/toast";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const criteria = {
    length: formData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[^A-Za-z0-9]/.test(formData.newPassword),
  };

  const getPasswordStrength = () => {
    if (!formData.newPassword)
      return { score: 0, label: "", color: "bg-slate-200" };

    const passedCount = Object.values(criteria).filter(Boolean).length;

    switch (passedCount) {
      case 1:
        return {
          score: 25,
          label: "Yếu",
          color: "bg-red-500",
          textColor: "text-red-500",
        };
      case 2:
        return {
          score: 50,
          label: "Trung bình",
          color: "bg-amber-500",
          textColor: "text-amber-500",
        };
      case 3:
        return {
          score: 75,
          label: "Khá mạnh",
          color: "bg-blue-500",
          textColor: "text-blue-500",
        };
      case 4:
        return {
          score: 100,
          label: "Mạnh",
          color: "bg-emerald-600",
          textColor: "text-emerald-600",
        };
      default:
        return {
          score: 15,
          label: "Rất yếu",
          color: "bg-red-400",
          textColor: "text-red-400",
        };
    }
  };

  const strength = getPasswordStrength();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.oldPassword) {
      showToast.error("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }

    if (!formData.newPassword) {
      showToast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    if (formData.newPassword.length < 8) {
      showToast.error("Mật khẩu mới phải chứa ít nhất 8 ký tự!");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      showToast.error("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      showToast.error("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });

      showToast.success(res.message || "Đổi mật khẩu thành công!");

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Đổi mật khẩu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-[#0d5c3a] focus:ring-1 focus:ring-[#0d5c3a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showOldPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-[#0d5c3a] focus:ring-1 focus:ring-[#0d5c3a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {formData.newPassword && (
              <div className="pt-1.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Độ bảo mật:
                  </span>
                  <span className={`font-bold ${strength.textColor}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-[#0d5c3a] focus:ring-1 focus:ring-[#0d5c3a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/account/profile")}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-xs sm:text-sm rounded-lg transition-all text-center cursor-pointer"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0d5c3a] hover:bg-[#094229] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Cập nhật mật khẩu</span>
              )}
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 p-5 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-[#0d5c3a] font-bold text-sm">
            <ShieldCheckIcon className="w-5 h-5 shrink-0" />
            <h3>Gợi ý mật khẩu an toàn</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Mật khẩu mạnh giúp bảo vệ tài khoản khỏi các nguy cơ truy cập trái
            phép. Mật khẩu nên chứa:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li
              className={`flex items-center space-x-2.5 transition-colors ${criteria.length ? "text-emerald-700 font-semibold" : "text-slate-600"}`}
            >
              {criteria.length ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>Tối thiểu 8 ký tự</span>
            </li>

            <li
              className={`flex items-center space-x-2.5 transition-colors ${criteria.uppercase ? "text-emerald-700 font-semibold" : "text-slate-600"}`}
            >
              {criteria.uppercase ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>Ít nhất 1 chữ cái in hoa (A-Z)</span>
            </li>

            <li
              className={`flex items-center space-x-2.5 transition-colors ${criteria.number ? "text-emerald-700 font-semibold" : "text-slate-600"}`}
            >
              {criteria.number ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>Ít nhất 1 chữ số (0-9)</span>
            </li>

            <li
              className={`flex items-center space-x-2.5 transition-colors ${criteria.special ? "text-emerald-700 font-semibold" : "text-slate-600"}`}
            >
              {criteria.special ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>Ít nhất 1 ký tự đặc biệt (@, #, $,...)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
