"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import {
  adminVoucherService,
  VoucherItem,
} from "@/src/services/admin/adminVoucherService";
import VoucherModal from "./components/VoucherModal";
import DeleteVoucherModal from "./components/DeleteVoucherModal";
import Pagination from "@/src/components/common/Pagination";
import { showToast } from "@/src/utils/toast";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [keyword, setKeyword] = useState<string>("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined,
  );

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(
    null,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [voucherToDelete, setVoucherToDelete] = useState<VoucherItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminVoucherService.getVouchers({
        page,
        size: 10,
        keyword: keyword.trim() || undefined,
        isActive: isActiveFilter,
      });

      if (res.status === "success" && res.data) {
        setVouchers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách Voucher:", error);
      showToast.error("Không thể tải danh sách Voucher!");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, isActiveFilter]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleCreateNew = () => {
    setSelectedVoucher(null);
    setIsModalOpen(true);
  };

  const handleEdit = (voucher: VoucherItem) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (voucher: VoucherItem) => {
    setVoucherToDelete(voucher);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;

    setDeleting(true);
    try {
      const res = await adminVoucherService.deleteVoucher(voucherToDelete.id);
      if (res.status === "success" || res.data) {
        showToast.success("Vô hiệu Voucher thành công!");
        setIsDeleteModalOpen(false);
        setVoucherToDelete(null);
        fetchVouchers();
      }
    } catch (error) {
      console.error("Lỗi khi vô hiệu Voucher:", error);
      showToast.error("Không thể vô hiệu Voucher này!");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (voucher: VoucherItem) => {
    try {
      const res = await adminVoucherService.updateVoucher(voucher.id, {
        code: voucher.code,
        title: voucher.title,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        minOrderAmount: voucher.minOrderAmount,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        usageLimit: voucher.usageLimit,
        userLimit: voucher.userLimit,
        conditions: voucher.conditions,
        isActive: !voucher.isActive,
      });

      if (res.status === "success" || res.data) {
        showToast.success(
          `Đã ${!voucher.isActive ? "kích hoạt" : "tạm dừng"} Voucher!`,
        );
        fetchVouchers();
      }
    } catch (error) {
      console.error("Lỗi khi đổi trạng thái Voucher:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TicketIcon className="w-6 h-6 text-emerald-600" />
            Quản lý Voucher
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tạo mã giảm giá, cấu hình khuyến mãi và quản lý giới hạn sử dụng.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm Voucher mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo mã hoặc tên voucher..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">
            Trạng thái:
          </span>
          <select
            value={
              isActiveFilter === undefined
                ? "ALL"
                : isActiveFilter
                  ? "ACTIVE"
                  : "INACTIVE"
            }
            onChange={(e) => {
              const val = e.target.value;
              setIsActiveFilter(
                val === "ALL" ? undefined : val === "ACTIVE" ? true : false,
              );
              setPage(0);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã tắt</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="block lg:hidden divide-y divide-slate-100 bg-slate-50/50">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-white space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 bg-slate-100 rounded w-28" />
                  <div className="h-5 bg-slate-100 rounded w-16" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-48" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-3 bg-slate-100 rounded w-20" />
                  <div className="h-3 bg-slate-100 rounded w-20" />
                </div>
              </div>
            ))
          ) : vouchers.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400 text-xs">
              Chưa có Voucher nào phù hợp.
            </div>
          ) : (
            vouchers.map((item) => (
              <div key={item.id} className="p-4 space-y-3 bg-white text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                      {item.code}
                    </div>
                    <div className="font-semibold text-slate-900 mt-1 text-sm line-clamp-1">
                      {item.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {item.isActive ? "Đang bật" : "Đã tắt"}
                    </button>

                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenDeleteModal(item)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      MỨC GIẢM
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.discountType === "PERCENT"
                        ? `${item.discountValue}%`
                        : `${item.discountValue.toLocaleString("vi-VN")} đ`}
                    </span>
                    {item.maxDiscountAmount && (
                      <div className="text-[10px] text-slate-400">
                        Tối đa {item.maxDiscountAmount.toLocaleString("vi-VN")}{" "}
                        đ
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      ĐƠN TỐI THIỂU
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.minOrderAmount
                        ? `${item.minOrderAmount.toLocaleString("vi-VN")} đ`
                        : "0 đ"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      LƯỢT SỬ DỤNG
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.usedCount}
                    </span>
                    <span className="text-slate-400">
                      /{item.usageLimit ? item.usageLimit : "∞"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      THỜI HẠN
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      {new Date(item.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(item.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  Mã & Tên Voucher
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  Loại & Giá trị giảm
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">Đơn tối thiểu</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Lượt sử dụng</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Thời hạn</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-32" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-20" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-16" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-16" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-12 mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Chưa có Voucher nào phù hợp.
                  </td>
                </tr>
              ) : (
                vouchers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                        {item.code}
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 line-clamp-1">
                        {item.title}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">
                        {item.discountType === "PERCENT"
                          ? `${item.discountValue}%`
                          : `${item.discountValue.toLocaleString("vi-VN")} đ`}
                      </span>
                      {item.maxDiscountAmount && (
                        <div className="text-[10px] text-slate-400">
                          Tối đa{" "}
                          {item.maxDiscountAmount.toLocaleString("vi-VN")} đ
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                      {item.minOrderAmount
                        ? `${item.minOrderAmount.toLocaleString("vi-VN")} đ`
                        : "0 đ"}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">
                        {item.usedCount}
                      </span>
                      <span className="text-slate-400">
                        /{item.usageLimit ? item.usageLimit : "∞"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                      <div>
                        Từ:{" "}
                        {new Date(item.startDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div>
                        Đến:{" "}
                        {new Date(item.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {item.isActive ? "Đang bật" : "Đã tắt"}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Tổng số: {totalElements} Voucher</span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      <VoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVouchers}
        voucherToEdit={selectedVoucher}
      />

      <DeleteVoucherModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVoucherToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        voucherCode={voucherToDelete?.code}
        loading={deleting}
      />
    </div>
  );
}
