"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

export default function BranchManagementPage() {
  const [activeTab, setActiveTab] = useState<"list" | "monitoring">("list");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<AdminBranchItem | null>(
    null,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<AdminBranchItem | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [allBranches, setAllBranches] = useState<AdminBranchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);

  const reloadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBranchService.getBranches({
        page,
        size: 100,
      });

      if (res.status === "success" && res.data?.content) {
        setAllBranches(res.data.content);
      } else {
        setAllBranches([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách chi nhánh:", error);
      showToast.error("Không thể tải danh sách chi nhánh!");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialBranches = async () => {
      try {
        const res = await adminBranchService.getBranches({
          page,
          size: 100,
        });

        if (!isMounted) return;

        if (res.status === "success" && res.data?.content) {
          setAllBranches(res.data.content);
        } else {
          setAllBranches([]);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Lỗi tải danh sách chi nhánh:", error);
        showToast.error("Không thể tải danh sách chi nhánh!");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialBranches();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const filteredBranches = useMemo(() => {
    const normalizedKeyword = normalizeText(searchTerm);
    const keywordTokens = normalizedKeyword.split(/\s+/).filter(Boolean);

    return allBranches.filter((branch) => {
      const matchesStatus = !statusFilter || branch.status === statusFilter;
      if (!matchesStatus) return false;

      if (keywordTokens.length === 0) return true;

      const searchableText = normalizeText(
        [branch.name, branch.address, branch.phone].filter(Boolean).join(" "),
      );

      return keywordTokens.every((token) => searchableText.includes(token));
    });
  }, [allBranches, searchTerm, statusFilter]);

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
      await reloadBranches();
    } catch (error) {
      console.error("Lỗi lưu chi nhánh:", error);
      showToast.error("Lưu thông tin chi nhánh thất bại!");
    }
  };

  const handleOpenDeleteModal = (branch: AdminBranchItem) => {
    setBranchToDelete(branch);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (branchId: string) => {
    setDeleteLoading(true);
    try {
      const res = await adminBranchService.deleteBranch(branchId);
      if (res.status === "success") {
        showToast.success("Xóa chi nhánh thành công!");
        setIsDeleteModalOpen(false);
        setBranchToDelete(null);
        await reloadBranches();
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
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
          branches={filteredBranches}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
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
        existingBranches={allBranches}
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
