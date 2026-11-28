"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  InventoryRequest,
  InventoryRequestStatus,
  inventoryRequestService,
} from "@/src/services/admin/adminInventoryRequestService";
import { showToast } from "@/src/utils/toast";
import ReplenishmentRequestTable from "./(components)/ReplenishmentRequestTable";
import ApproveRequestModal from "./(components)/ApproveRequestModal";
import RejectOrCloseRequestModal from "./(components)/RejectOrCloseRequestModal";
import AdminRequestDetailModal from "./(components)/AdminRequestDetailModal";

const STATUS_TABS: { key: "ALL" | InventoryRequestStatus; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "PARTIALLY_RECEIVED", label: "Nhận một phần" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CLOSED", label: "Đã đóng" },
  { key: "REJECTED", label: "Từ chối" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export default function AdminReplenishmentPage() {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | InventoryRequestStatus
  >("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(8);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<InventoryRequest | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [approveTarget, setApproveTarget] = useState<InventoryRequest | null>(
    null,
  );
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    mode: "REJECT" | "CLOSE";
    request: InventoryRequest | null;
  }>({
    isOpen: false,
    mode: "REJECT",
    request: null,
  });

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await inventoryRequestService.getInventoryRequests({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        page,
        size,
      });
      if (res?.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
        window.dispatchEvent(new Event("refresh-replenishment-badge"));
      }
    } catch {
      showToast.error("Không thể tải danh sách yêu cầu nhập hàng!");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, page, size]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = (status: "ALL" | InventoryRequestStatus) => {
    setSelectedStatus(status);
    setPage(0);
  };

  const handleOpenDetail = async (request: InventoryRequest) => {
    setSelectedDetail(request);
    setDetailModalOpen(true);
    try {
      setIsLoadingDetail(true);
      const res = await inventoryRequestService.getInventoryRequestById(
        request.id,
      );
      if (res?.data) {
        setSelectedDetail(res.data);
      }
    } catch {
      showToast.error("Không thể tải chi tiết phiếu yêu cầu!");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenApprove = async (request: InventoryRequest) => {
    setApproveTarget(request);
    try {
      const res = await inventoryRequestService.getInventoryRequestById(
        request.id,
      );
      if (res?.data) {
        setApproveTarget(res.data);
      }
    } catch {}
  };

  const visibleRequests = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return requests;
    return requests.filter(
      (req) =>
        req.id.toLowerCase().includes(kw) ||
        req.branchName.toLowerCase().includes(kw) ||
        req.requestedByName.toLowerCase().includes(kw) ||
        (req.reason && req.reason.toLowerCase().includes(kw)),
    );
  }, [requests, searchKeyword]);

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Quản lý nhập hàng chi nhánh
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kiểm tra, phê duyệt hoặc từ chối các đề xuất bổ sung tồn kho từ toàn
          chuỗi ({totalElements} phiếu)
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusChange(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                  isActive
                    ? "bg-green-700 text-white border-green-700 shadow-2xs"
                    : "bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full xl:w-72 shrink-0">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm mã phiếu, chi nhánh, người tạo..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <ReplenishmentRequestTable
        requests={visibleRequests}
        isLoading={isLoading}
        page={page}
        size={size}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onViewDetail={handleOpenDetail}
        onApprove={handleOpenApprove}
        onReject={(req) =>
          setActionModalState({
            isOpen: true,
            mode: "REJECT",
            request: req,
          })
        }
        onCloseRequest={(req) =>
          setActionModalState({
            isOpen: true,
            mode: "CLOSE",
            request: req,
          })
        }
      />

      <ApproveRequestModal
        isOpen={Boolean(approveTarget)}
        request={approveTarget}
        onClose={() => setApproveTarget(null)}
        onSuccess={fetchRequests}
      />

      <RejectOrCloseRequestModal
        isOpen={actionModalState.isOpen}
        mode={actionModalState.mode}
        request={actionModalState.request}
        onClose={() =>
          setActionModalState((prev) => ({
            ...prev,
            isOpen: false,
            request: null,
          }))
        }
        onSuccess={fetchRequests}
      />

      <AdminRequestDetailModal
        isOpen={detailModalOpen}
        request={selectedDetail}
        isLoading={isLoadingDetail}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetail(null);
        }}
        onApproveClick={(req) => handleOpenApprove(req)}
        onRejectClick={(req) =>
          setActionModalState({
            isOpen: true,
            mode: "REJECT",
            request: req,
          })
        }
        onCloseRequestClick={(req) =>
          setActionModalState({
            isOpen: true,
            mode: "CLOSE",
            request: req,
          })
        }
      />
    </div>
  );
}
