"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  User,
  UserRole,
  UserStatus,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/src/services/admin/adminAccountService";
import axiosClient from "@/src/lib/axiosClient";

interface BranchOption {
  id: string;
  name: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  editingUser: User | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
}

export default function UserFormModal({
  isOpen,
  editingUser,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    birthDate: "",
    gender: "NAM",
    role: "BRANCH" as UserRole,
    status: "ACTIVE" as UserStatus,
    branchId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await axiosClient.get("/api/branches", {
          params: { page: 0, size: 100, status: "ACTIVE" },
        });
        if (response.data?.data?.content) {
          setBranches(response.data.data.content);
        } else if (Array.isArray(response.data?.data)) {
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách chi nhánh:", error);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [isOpen]);

  useEffect(() => {
    setShowPassword(false);
    if (editingUser) {
      setFormData({
        fullName: editingUser.fullName || "",
        phone: editingUser.phone || "",
        email: editingUser.email || "",
        password: "",
        birthDate: editingUser.birthDate || "",
        gender: editingUser.gender || "NAM",
        role: editingUser.role === "ADMIN" ? "ADMIN" : "BRANCH",
        status: editingUser.status || "ACTIVE",
        branchId: editingUser.branchId || "",
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        birthDate: "",
        gender: "NAM",
        role: "BRANCH",
        status: "ACTIVE",
        branchId: "",
      });
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        role: formData.role,
        branchId: formData.role === "BRANCH" ? formData.branchId || null : null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        payload.status = formData.status;
      }

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Submit form error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-base sm:text-lg text-slate-800">
            {editingUser ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0912345678"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu{" "}
              {editingUser ? (
                "(Bỏ trống nếu không đổi)"
              ) : (
                <span className="text-rose-500">*</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!editingUser}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vai trò
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="BRANCH">Nhân viên Chi nhánh</option>
                <option value="ADMIN">Quản trị viên (Admin)</option>
              </select>
            </div>

            {editingUser && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as UserStatus,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="LOCKED">Tạm khóa (LOCKED)</option>
                </select>
              </div>
            )}
          </div>

          {formData.role === "BRANCH" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chi nhánh quản lý <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">
                  {loadingBranches
                    ? "Đang tải danh sách chi nhánh..."
                    : "-- Chọn chi nhánh --"}
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
            >
              {loading
                ? "Đang xử lý..."
                : editingUser
                  ? "Lưu thay đổi"
                  : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
