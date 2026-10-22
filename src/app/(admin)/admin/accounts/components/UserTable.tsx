"use client";

import React from "react";
import {
  User,
  UserRole,
  UserStatus,
} from "@/src/services/admin/adminAccountService";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return (
        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[11px] font-bold">
          Admin
        </span>
      );
    case "BRANCH":
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
          Chi nhánh
        </span>
      );
    case "CUSTOMER":
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[11px] font-bold">
          Khách hàng
        </span>
      );
  }
};

const getStatusBadge = (status: UserStatus) => {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
          Hoạt động
        </span>
      );
    case "LOCKED":
      return (
        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold">
          Tạm khóa
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">
          {status}
        </span>
      );
  }
};

export default function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/80 p-8 text-center text-xs text-slate-400 animate-pulse">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/80 p-12 text-center space-y-2">
        <p className="text-sm font-bold text-slate-700">
          Không tìm thấy người dùng nào
        </p>
        <p className="text-xs text-slate-400">
          Thử thay đổi bộ lọc hoặc thêm tài khoản mới.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
              <th className="p-3.5 pl-5">Người dùng</th>
              <th className="p-3.5">Liên hệ</th>
              <th className="p-3.5">Vai trò</th>
              <th className="p-3.5">Trạng thái</th>
              <th className="p-3.5">Ngày tạo</th>
              <th className="p-3.5 pr-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isCustomer = user.role === "CUSTOMER";

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-800">
                      {user.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ID: {user.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="text-slate-700 font-medium">
                      {user.email}
                    </div>
                    <div className="text-slate-400">{user.phone}</div>
                  </td>
                  <td className="p-3.5">{getRoleBadge(user.role)}</td>
                  <td className="p-3.5">{getStatusBadge(user.status)}</td>
                  <td className="p-3.5 text-slate-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="p-3.5 pr-5 text-right space-x-1">
                    {!isCustomer && (
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Xóa tài khoản"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
