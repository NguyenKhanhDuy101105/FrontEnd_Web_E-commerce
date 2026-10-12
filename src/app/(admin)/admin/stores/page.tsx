"use client";

import { useState, useEffect, useCallback } from "react";
import BranchHeader from "./components/BranchHeader";
import BranchListTab from "./components/BranchListTab";
import BranchMonitoringTab from "./components/BranchMonitoringTab";
import AddBranchModal from "./components/AddBranchModal";
import DeleteBranchModal from "./components/DeleteBranchModal";
import {
  adminBranchService,
  AdminBranchItem,
  SaveAdminBranchRequest,
} from "@/src/services/admin/adminBranchService";
import { showToast } from "@/src/utils/toast";

export default function BranchManagementPage() {
  const [activeTab, setActiveTab] = useState<"list" | "monitoring">("list");

  // States Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<AdminBranchItem | null>(
    null,
  );

  // States Modal Xóa Chi Nhánh
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<AdminBranchItem | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // States Dữ liệu & Bảng
  const [branches, setBranches] = useState<AdminBranchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // States Bộ lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Call API Lấy danh sách Chi nhánh
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBranchService.getBranches({
        page,
        size: 20,
        search: searchTerm || undefined,
      });

      if (res.status === "success" && res.data?.content) {
        let list = res.data.content;
        if (statusFilter) {
          list = list.filter((b) => b.status === statusFilter);
        }
        setBranches(list);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách chi nhánh:", error);
      showToast.error("Không thể tải danh sách chi nhánh!");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Thêm mới hoặc Cập nhật chi nhánh
  const handleSaveBranch = async (payload: SaveAdminBranchRequest) => {
    try {
      if (selectedBranch) {
        const res = await adminBranchService.updateBranch(
          selectedBranch.id,
          payload,
        );
        if (res.status === "success") {
          showToast.success("Cập nhật chi nhánh thành công!");
        }
      } else {
        const res = await adminBranchService.createBranch(payload);
        if (res.status === "success") {
          showToast.success("Thêm chi nhánh mới thành công!");
        }
      }
      setIsModalOpen(false);
      setSelectedBranch(null);
      fetchBranches();
    } catch (error) {
      console.error("Lỗi lưu chi nhánh:", error);
      showToast.error("Lưu thông tin chi nhánh thất bại!");
    }
  };

  // Mở Modal Xóa từ danh sách
  const handleOpenDeleteModal = (branch: AdminBranchItem) => {
    setBranchToDelete(branch);
    setIsDeleteModalOpen(true);
  };

  // Thực thi gọi API Xóa khi người dùng nhấn xác nhận trong Modal
  const handleConfirmDelete = async (branchId: string) => {
    setDeleteLoading(true);
    try {
      const res = await adminBranchService.deleteBranch(branchId);
      if (res.status === "success") {
        showToast.success("Xóa chi nhánh thành công!");
        setIsDeleteModalOpen(false);
        setBranchToDelete(null);
        fetchBranches();
      }
    } catch (error) {
      console.error("Lỗi xóa chi nhánh:", error);
      showToast.error("Không thể xóa chi nhánh này!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: AdminBranchItem) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-5">
      <BranchHeader onOpenAddModal={handleOpenAddModal} />

      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-emerald-700 border border-b-0 border-slate-200 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Danh sách chi nhánh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monitoring")}
            className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "monitoring"
                ? "bg-white text-emerald-700 border border-b-0 border-slate-200 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Giám sát hoạt động</span>
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <BranchListTab
          branches={branches}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEditBranch={handleOpenEditModal}
          onDeleteBranch={handleOpenDeleteModal}
        />
      ) : (
        <BranchMonitoringTab />
      )}

      <AddBranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBranch(null);
        }}
        initialData={selectedBranch}
        onSave={handleSaveBranch}
      />

      <DeleteBranchModal
        isOpen={isDeleteModalOpen}
        branch={branchToDelete}
        loading={deleteLoading}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBranchToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
