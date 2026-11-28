"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useBranch } from "@/src/context/BranchContext";
import branchInventoryService, {
  InventoryRequest,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";
import ImportRequestTable from "./(components)/ImportRequestTable";
import CreateImportRequestModal, {
  BranchProductOption,
} from "./(components)/CreateImportRequestModal";
import ImportRequestDetailModal from "./(components)/ImportRequestDetailModal";
import CancelRequestConfirmModal from "./(components)/CancelRequestConfirmModal";
import ReceiveImportRequestModal from "./(components)/ReceiveImportRequestModal";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "PARTIALLY_APPROVED", label: "Duyệt một phần" },
  { key: "PARTIALLY_RECEIVED", label: "Nhận một phần" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CLOSED", label: "Đã đóng" },
  { key: "REJECTED", label: "Từ chối" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export default function ImportRequestsPage() {
  const { branchId, selectedBranch } = useBranch();

  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [branchProducts, setBranchProducts] = useState<BranchProductOption[]>(
    [],
  );
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<InventoryRequest | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState<boolean>(false);
  const [receiveTarget, setReceiveTarget] = useState<InventoryRequest | null>(
    null,
  );
  const [isLoadingReceiveDetail, setIsLoadingReceiveDetail] =
    useState<boolean>(false);

  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRequests = useCallback(async () => {
    if (!branchId) return;
    try {
      setIsLoading(true);
      const res = await branchInventoryService.getInventoryRequests(branchId, {
        page,
        size,
      });
      if (res?.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách yêu cầu nhập hàng:", error);
      showToast.error("Không thể tải danh sách yêu cầu nhập hàng!");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, page, size]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchBranchProducts = useCallback(async () => {
    if (!branchId) return;
    try {
      setIsLoadingProducts(true);
      const res =
        await branchInventoryService.getInventoryByCategories(branchId);

      const categories = res?.data?.categories || [];
      const productMap = new Map<string, BranchProductOption>();

      categories.forEach((cat) => {
        (cat.subGroups || []).forEach((subGroup) => {
          (subGroup.products || []).forEach((prod) => {
            if (!productMap.has(prod.productId)) {
              productMap.set(prod.productId, {
                productId: prod.productId,
                productSku: prod.sku,
                productName: prod.productName,
                unit: prod.unit,
                currentStock: prod.stockQuantity,
                categoryId: cat.categoryId,
                categoryName: cat.categoryName,
              });
            }
          });
        });
      });

      setBranchProducts(Array.from(productMap.values()));
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm chi nhánh:", error);
      showToast.error("Không thể tải danh sách sản phẩm tồn kho!");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [branchId]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    if (branchProducts.length === 0) {
      fetchBranchProducts();
    }
  };

  const handleViewDetail = async (request: InventoryRequest) => {
    if (!branchId) return;
    setSelectedDetail(request);
    setIsDetailModalOpen(true);
    try {
      setIsLoadingDetail(true);
      const res = await branchInventoryService.getInventoryRequestDetail(
        branchId,
        request.id,
      );
      if (res?.data) {
        setSelectedDetail(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết yêu cầu:", error);
      showToast.error("Không thể tải chi tiết yêu cầu nhập hàng!");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenReceiveModal = async (request: InventoryRequest) => {
    if (!branchId) return;
    setReceiveTarget(request);
    setIsReceiveModalOpen(true);
    try {
      setIsLoadingReceiveDetail(true);
      const res = await branchInventoryService.getInventoryRequestDetail(
        branchId,
        request.id,
      );
      if (res?.data) {
        setReceiveTarget(res.data);
      }
    } catch {
      showToast.error("Không thể tải chi tiết phiếu để nhận hàng!");
    } finally {
      setIsLoadingReceiveDetail(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!branchId || !cancelTargetId || isDeleting) return;
    try {
      setIsDeleting(true);
      await branchInventoryService.deleteInventoryRequest(
        branchId,
        cancelTargetId,
      );
      showToast.success("Đã hủy yêu cầu nhập hàng!");
      setCancelTargetId(null);
      fetchRequests();
    } catch (error: unknown) {
      console.error("Lỗi hủy yêu cầu nhập hàng:", error);
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể hủy yêu cầu nhập hàng!";
      showToast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (selectedStatus === "ALL") return requests;
    return requests.filter((req) => req.status === selectedStatus);
  }, [requests, selectedStatus]);

  if (!branchId) {
    return (
      <div className="p-8 text-center text-slate-500">
        Vui lòng chọn chi nhánh để quản lý yêu cầu nhập hàng.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản lý yêu cầu nhập hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chi nhánh:{" "}
            <span className="font-semibold text-emerald-700">
              {selectedBranch?.name || branchId}
            </span>{" "}
            - Tổng cộng {totalElements} phiếu yêu cầu
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 stroke-2" />
          <span>Tạo yêu cầu nhập hàng</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => {
            const active = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                  active
                    ? "bg-green-700 text-white border-green-700 shadow-2xs"
                    : "bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <ImportRequestTable
        requests={filteredRequests}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onViewDetail={handleViewDetail}
        onOpenReceive={handleOpenReceiveModal}
        onCancelRequest={setCancelTargetId}
      />

      <CreateImportRequestModal
        isOpen={isCreateModalOpen}
        branchId={branchId}
        availableProducts={branchProducts}
        isLoadingProducts={isLoadingProducts}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchRequests();
          fetchBranchProducts();
        }}
      />

      <ImportRequestDetailModal
        isOpen={isDetailModalOpen}
        request={selectedDetail}
        isLoading={isLoadingDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetail(null);
        }}
      />

      <ReceiveImportRequestModal
        isOpen={isReceiveModalOpen}
        branchId={branchId}
        request={receiveTarget}
        isLoadingDetail={isLoadingReceiveDetail}
        onClose={() => {
          setIsReceiveModalOpen(false);
          setReceiveTarget(null);
        }}
        onSuccess={() => {
          fetchRequests();
          fetchBranchProducts();
        }}
      />

      <CancelRequestConfirmModal
        isOpen={Boolean(cancelTargetId)}
        requestId={cancelTargetId}
        isDeleting={isDeleting}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
