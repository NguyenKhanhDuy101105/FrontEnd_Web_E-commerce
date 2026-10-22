"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import adminAccountService, {
  User,
  UserRole,
  UserStatus,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/src/services/admin/adminAccountService";
import { showToast } from "@/src/utils/toast";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import UserDeleteModal from "./components/UserDeleteModal";
import Pagination from "@/src/components/common/Pagination";

const ROLE_TABS: { key: UserRole | "ALL"; label: string }[] = [
  { key: "CUSTOMER", label: "Khách hàng" },
  { key: "BRANCH", label: "Chi nhánh" },
  { key: "ADMIN", label: "Admin" },
  { key: "ALL", label: "Tất cả" },
];

export default function AdminAccountManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [keyword, setKeyword] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">(
    "CUSTOMER",
  );
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAccountService.getUsers({
        page,
        size: 10,
        keyword: keyword || undefined,
        role: selectedRole === "ALL" ? undefined : selectedRole,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      });

      if (res.status === "success" && res.data) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setUsers([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài khoản:", error);
      showToast.error("Không thể tải danh sách tài khoản!");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, selectedRole, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleTabChange = (roleKey: UserRole | "ALL") => {
    setSelectedRole(roleKey);
    setPage(0);
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (
    payload: CreateUserPayload | UpdateUserPayload,
  ) => {
    try {
      if (editingUser) {
        const res = await adminAccountService.updateUser(
          editingUser.id,
          payload as UpdateUserPayload,
        );
        if (res.status === "success") {
          showToast.success("Cập nhật tài khoản thành công!");
          fetchUsers();
        }
      } else {
        const res = await adminAccountService.createUser(
          payload as CreateUserPayload,
        );
        if (res.status === "success") {
          showToast.success("Tạo tài khoản mới thành công!");
          fetchUsers();
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu tài khoản:", error);
      showToast.error("Thao tác thất bại. Vui lòng kiểm tra lại!");
      throw error;
    }
  };

  const handleConfirmDelete = async (userId: string) => {
    try {
      const res = await adminAccountService.deleteUser(userId);
      if (res.status === "success") {
        showToast.success("Xóa tài khoản thành công!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      showToast.error("Xóa tài khoản thất bại!");
      throw error;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            Quản lý Tài khoản
          </h1>
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          Tạo tài khoản
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-60">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as UserStatus | "ALL");
              setPage(0);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="LOCKED">Tạm khóa (LOCKED)</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {ROLE_TABS.map((tab) => {
          const isActive = selectedRole === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleRoleTabChange(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      <UserFormModal
        isOpen={isFormModalOpen}
        editingUser={editingUser}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        user={deletingUser}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
