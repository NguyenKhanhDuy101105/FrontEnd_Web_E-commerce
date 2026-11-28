"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import branchInventoryService, {
  CreateInventoryRequestPayload,
} from "@/src/services/store/branchInventoryService";
import { showToast } from "@/src/utils/toast";

export interface BranchProductOption {
  productId: string;
  productSku?: string;
  productName: string;
  unit?: string;
  currentStock?: number;
  categoryId?: string;
  categoryName?: string;
}

interface RequestItemDraft {
  productId: string;
  productSku?: string;
  productName: string;
  unit?: string;
  currentStock?: number;
  quantity: number;
}

interface CreateImportRequestModalProps {
  isOpen: boolean;
  branchId: string;
  availableProducts: BranchProductOption[];
  isLoadingProducts?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateImportRequestModal({
  isOpen,
  branchId,
  availableProducts,
  isLoadingProducts = false,
  onClose,
  onSuccess,
}: CreateImportRequestModalProps) {
  const [reason, setReason] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [selectedItems, setSelectedItems] = useState<RequestItemDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setReason("");
    setSearchKeyword("");
    setSelectedCategoryId("ALL");
    setSelectedItems([]);
  }, [isOpen]);

  // Lấy tối đa 8 danh mục thực tế (2 dòng × 4 cột)
  const categoryOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    availableProducts.forEach((p) => {
      if (!p.categoryId || !p.categoryName) return;
      const existing = map.get(p.categoryId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(p.categoryId, {
          id: p.categoryId,
          name: p.categoryName,
          count: 1,
        });
      }
    });

    return Array.from(map.values()).slice(0, 8);
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return availableProducts.filter((p) => {
      const alreadyAdded = selectedItems.some(
        (item) => item.productId === p.productId,
      );
      if (alreadyAdded) return false;

      if (selectedCategoryId !== "ALL" && p.categoryId !== selectedCategoryId) {
        return false;
      }

      if (!kw) return true;
      return (
        p.productName.toLowerCase().includes(kw) ||
        (p.productSku && p.productSku.toLowerCase().includes(kw))
      );
    });
  }, [availableProducts, selectedItems, selectedCategoryId, searchKeyword]);

  const handleAddProduct = (product: BranchProductOption) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productSku: product.productSku,
        productName: product.productName,
        unit: product.unit,
        currentStock: product.currentStock,
        quantity: 10,
      },
    ]);
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    const validQty = Number.isNaN(qty) ? 1 : Math.max(1, qty);
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: validQty } : item,
      ),
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      showToast.error("Không xác định được chi nhánh hiện tại!");
      return;
    }
    if (selectedItems.length === 0) {
      showToast.error("Vui lòng chọn ít nhất 1 sản phẩm cần nhập hàng!");
      return;
    }

    const payload: CreateInventoryRequestPayload = {
      reason: reason.trim() || "Bổ sung tồn kho định kỳ tại chi nhánh",
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      setIsSubmitting(true);
      await branchInventoryService.createInventoryRequest(branchId, payload);
      showToast.success("Tạo yêu cầu nhập hàng thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Lỗi tạo yêu cầu nhập hàng:", error);
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể tạo yêu cầu nhập hàng!";
      showToast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Tạo yêu cầu nhập hàng mới
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn sản phẩm và số lượng đề xuất nhập về kho chi nhánh
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lý do / Ghi chú yêu cầu nhập hàng
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Bổ sung hàng sắp hết cuối tuần, chuẩn bị khuyến mãi..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* 8 danh mục sản phẩm: 2 dòng × 4 danh mục + nút Bỏ lọc ở góc phải */}
          {categoryOptions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Squares2X2Icon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lọc nhanh theo danh mục</span>
                </div>

                {selectedCategoryId !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId("ALL")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    <span>Bỏ lọc</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categoryOptions.map((cat) => {
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryId((prev) =>
                          prev === cat.id ? "ALL" : cat.id,
                        )
                      }
                      title={`${cat.name} (${cat.count} sản phẩm)`}
                      className={`px-3 py-2 rounded-lg border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-slate-50/80 hover:bg-emerald-50/60 text-slate-700 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">
                        {cat.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200/80 text-slate-600"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col h-80 bg-slate-50/50">
              <div className="relative mb-3">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm tên sản phẩm hoặc mã SKU..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {isLoadingProducts ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Đang tải danh sách sản phẩm...
                  </p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Không tìm thấy sản phẩm phù hợp
                  </p>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2 hover:border-emerald-200 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {product.productName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {product.productSku && (
                            <span>SKU: {product.productSku}</span>
                          )}
                          {typeof product.currentStock === "number" && (
                            <span
                              className={
                                product.currentStock <= 5
                                  ? "text-rose-500 font-semibold"
                                  : ""
                              }
                            >
                              • Tồn: {product.currentStock} {product.unit || ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-semibold rounded-md transition cursor-pointer"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>Chọn</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col h-80 bg-white">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CubeIcon className="w-4 h-4 text-emerald-600" />
                  Danh sách đề xuất nhập ({selectedItems.length})
                </span>
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedItems([])}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Xóa hết
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {selectedItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 px-4">
                    <p className="text-xs">Chưa có sản phẩm nào được chọn.</p>
                    <p className="text-[11px] mt-1">
                      Bấm &ldquo;Chọn&rdquo; ở danh sách bên trái để thêm vào
                      phiếu yêu cầu.
                    </p>
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.productSku ? `SKU: ${item.productSku}` : ""}
                          {typeof item.currentStock === "number"
                            ? ` • Tồn hiện tại: ${item.currentStock}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.productId,
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-20 px-2 py-1 text-xs font-bold text-center bg-white border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.productId)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu nhập hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
