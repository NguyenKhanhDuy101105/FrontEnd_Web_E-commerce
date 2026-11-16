"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { adminProductService } from "@/src/services/admin/adminProductService";

interface ProductOption {
  id: string;
  name: string;
  imageUrl?: string;
  basePrice?: number;
  unit?: string;
}

interface ProductSearchSelectProps {
  value: string;
  onChange: (productId: string, productObj?: ProductOption) => void;
}

export default function ProductSearchSelect({
  value,
  onChange,
}: ProductSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value) {
      setSelectedProduct(null);
      return;
    }

    if (selectedProduct && selectedProduct.id === value) {
      return;
    }

    const fetchDetail = async () => {
      try {
        const detailRes = await adminProductService.getProductById(value);
        const data = detailRes.data || detailRes;
        if (data) {
          setSelectedProduct(data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin sản phẩm theo ID:", error);
      }
    };

    fetchDetail();
  }, [value, selectedProduct]);

  const loadInitialProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminProductService.getProducts({ page: 0, size: 50 });
      const items = res.data?.content || [];
      setProducts(items);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProductsApi = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) {
        loadInitialProducts();
        return;
      }
      try {
        setLoading(true);
        const res = await adminProductService.searchProducts({
          keyword: keyword.trim(),
          page: 0,
          size: 20,
        });
        setProducts(res.data?.content || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    },
    [loadInitialProducts],
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchProductsApi(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, searchProductsApi]);

  const handleSelect = (product: ProductOption) => {
    setSelectedProduct(product);
    onChange(product.id, product);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedProduct(null);
    onChange("");
    setSearchTerm("");
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      {selectedProduct ? (
        <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedProduct.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-6 h-6 rounded object-cover border border-slate-100"
              />
            )}
            <span className="font-semibold text-slate-800 truncate">
              {selectedProduct.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm (ví dụ: Cá lóc, Cà chua...)"
            value={searchTerm}
            onFocus={() => {
              setIsOpen(true);
              if (products.length === 0) loadInitialProducts();
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white font-medium"
          />
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />

          {isOpen && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-36 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
              {loading ? (
                <div className="p-3 text-center text-xs text-slate-400 animate-pulse">
                  Đang tìm kiếm sản phẩm...
                </div>
              ) : products.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 font-medium">
                  Không tìm thấy sản phẩm phù hợp.
                </div>
              ) : (
                products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelect(prod)}
                    className="flex items-center gap-2.5 p-2 hover:bg-emerald-50/60 cursor-pointer transition-colors"
                  >
                    <img
                      src={prod.imageUrl || "/images/placeholder.png"}
                      alt={prod.name}
                      className="w-7 h-7 rounded-lg object-contain border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {prod.name}
                      </p>
                      {prod.basePrice !== undefined && (
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          {prod.basePrice.toLocaleString("vi-VN")} đ /{" "}
                          {prod.unit || "phần"}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
