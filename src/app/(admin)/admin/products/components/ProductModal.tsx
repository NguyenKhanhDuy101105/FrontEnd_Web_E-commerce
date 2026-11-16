"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  LinkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";
import { ProductItem } from "./ProductTable";
import { adminProductService } from "@/src/services/admin/adminProductService";
import { brandService, BrandItem } from "@/src/services/admin/brandService";
import { showToast } from "@/src/utils/toast";
import CategoryCascader from "./CategoryCascader";

interface Props {
  isOpen: boolean;
  categories: CategoryItem[];
  editingProduct?: ProductItem | null;
  initialCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CLOUDINARY_CLOUD_NAME = "dak681rft";
const CLOUDINARY_UPLOAD_PRESET = "urbanmart_products";
const DEFAULT_PRODUCT_PLACEHOLDER =
  "https://placehold.co/600x600/f1f5f9/64748b?text=San+Pham+UrbanMart";

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    throw new Error("Không thể tải ảnh lên Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
};

export default function ProductModal({
  isOpen,
  categories,
  editingProduct,
  initialCategoryId,
  onClose,
  onSuccess,
}: Props) {
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formUnit, setFormUnit] = useState<string>("Kg");

  const [formBasePrice, setFormBasePrice] = useState<number | "">("");
  const [formBrandId, setFormBrandId] = useState<string>("");

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);

  const [isBrandDropdownOpen, setIsBrandDropdownOpen] =
    useState<boolean>(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState<string>("");
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [selectedL1Id, setSelectedL1Id] = useState<string>("");
  const [selectedL2Id, setSelectedL2Id] = useState<string>("");
  const [selectedL3Id, setSelectedL3Id] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const findCategoryPath = (
    catList: CategoryItem[],
    targetId: string,
  ): { l1: string; l2: string; l3: string } | null => {
    for (const l1 of catList) {
      if (l1.id === targetId) return { l1: l1.id, l2: "", l3: "" };
      if (l1.children) {
        for (const l2 of l1.children) {
          if (l2.id === targetId) return { l1: l1.id, l2: l2.id, l3: "" };
          if (l2.children) {
            for (const l3 of l2.children) {
              if (l3.id === targetId)
                return { l1: l1.id, l2: l2.id, l3: l3.id };
            }
          }
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const res = await brandService.getBrands();
        if (res?.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data as any).content || [];
          setBrands(list);
        }
      } catch (error) {
        console.error("Lỗi khi tải thương hiệu:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    if (isOpen) {
      fetchBrands();
      setIsBrandDropdownOpen(false);
      setBrandSearchTerm("");

      if (editingProduct) {
        setFormName(editingProduct.name || "");
        setFormDescription(editingProduct.description || "");
        setFormUnit(editingProduct.unit || "Kg");
        setFormBasePrice(editingProduct.basePrice ?? "");
        setFormBrandId(editingProduct.brandId || "");
        setFormImageUrl(editingProduct.imageUrl || "");
        setImagePreview(editingProduct.imageUrl || "");
        setSelectedFile(null);
        setImageMode("url");

        const path = findCategoryPath(categories, editingProduct.categoryId);
        if (path) {
          setSelectedL1Id(path.l1);
          setSelectedL2Id(path.l2);
          setSelectedL3Id(path.l3);
        } else {
          setSelectedL1Id(editingProduct.categoryId);
        }
      } else {
        setFormName("");
        setFormDescription("");
        setFormUnit("Kg");
        setFormBasePrice("");
        setFormImageUrl("");
        setSelectedFile(null);
        setImagePreview("");
        setImageMode("file");
        setFormBrandId("");

        if (initialCategoryId) {
          const path = findCategoryPath(categories, initialCategoryId);
          if (path) {
            setSelectedL1Id(path.l1);
            setSelectedL2Id(path.l2);
            setSelectedL3Id(path.l3);
          } else {
            setSelectedL1Id(initialCategoryId);
            setSelectedL2Id("");
            setSelectedL3Id("");
          }
        } else {
          setSelectedL1Id("");
          setSelectedL2Id("");
          setSelectedL3Id("");
        }
      }
    }
  }, [isOpen, editingProduct, initialCategoryId, categories]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast.error("Vui lòng chọn định dạng file hình ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Dung lượng ảnh tối đa là 5MB!");
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const getSelectedCategoryId = (): string => {
    if (selectedL3Id) return selectedL3Id;
    if (selectedL2Id) return selectedL2Id;
    if (selectedL1Id) return selectedL1Id;
    return "";
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearchTerm.toLowerCase()),
  );

  const selectedBrand = brands.find((b) => b.id === formBrandId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategoryId = getSelectedCategoryId();

    if (!formName.trim()) {
      showToast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!finalCategoryId) {
      showToast.error("Vui lòng chọn danh mục cho sản phẩm!");
      return;
    }

    const priceNum = Number(formBasePrice);
    if (formBasePrice === "" || isNaN(priceNum) || priceNum < 0) {
      showToast.error("Giá sản phẩm phải là số hợp lệ và không được âm!");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl: string = "";

      if (imageMode === "url") {
        finalImageUrl = formImageUrl.trim();
      } else if (selectedFile) {
        finalImageUrl = await uploadToCloudinary(selectedFile);
      } else if (editingProduct?.imageUrl) {
        finalImageUrl = editingProduct.imageUrl.trim();
      }

      if (!finalImageUrl) {
        finalImageUrl = DEFAULT_PRODUCT_PLACEHOLDER;
      }

      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        categoryId: finalCategoryId,
        brandId: formBrandId.trim() || null,
        unit: formUnit.trim(),
        basePrice: priceNum,
        imageUrl: finalImageUrl,
      };

      if (editingProduct) {
        await adminProductService.updateProduct(editingProduct.id, payload);
        showToast.success("Cập nhật sản phẩm thành công!");
      } else {
        await adminProductService.createProduct(payload);
        showToast.success("Thêm mới sản phẩm thành công!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      showToast.error("Thao tác thất bại, vui lòng kiểm tra lại dữ liệu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm mới sản phẩm"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              placeholder="Nhập tên sản phẩm (VD: Thịt bò Wagyu Úc...)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium text-slate-800"
            />
          </div>

          <CategoryCascader
            categories={categories}
            selectedL1Id={selectedL1Id}
            selectedL2Id={selectedL2Id}
            selectedL3Id={selectedL3Id}
            onSelectL1={(id) => {
              setSelectedL1Id(id);
              setSelectedL2Id("");
              setSelectedL3Id("");
            }}
            onSelectL2={(id) => {
              setSelectedL2Id(id);
              setSelectedL3Id("");
            }}
            onSelectL3={(id) => setSelectedL3Id(id)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative" ref={brandDropdownRef}>
              <label className="block font-bold text-slate-700 mb-1">
                Thương hiệu
              </label>

              <button
                type="button"
                onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition"
              >
                <span
                  className={`truncate ${selectedBrand ? "text-slate-900 font-bold" : "text-slate-400"}`}
                >
                  {selectedBrand
                    ? selectedBrand.name
                    : "-- Chọn thương hiệu --"}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>

              {isBrandDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm thương hiệu..."
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      autoFocus
                    />
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setFormBrandId("");
                        setIsBrandDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 rounded-md font-medium text-xs flex items-center justify-between cursor-pointer"
                    >
                      <span>-- Chọn thương hiệu --</span>
                      {!formBrandId && (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>

                    {loadingBrands ? (
                      <div className="p-3 text-center text-slate-400">
                        Đang tải...
                      </div>
                    ) : filteredBrands.length === 0 ? (
                      <div className="p-3 text-center text-slate-400">
                        Không tìm thấy thương hiệu
                      </div>
                    ) : (
                      filteredBrands.map((b) => {
                        const isSelected = formBrandId === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setFormBrandId(b.id);
                              setIsBrandDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 rounded-md font-medium text-xs flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? "text-emerald-700 bg-emerald-50/60 font-bold"
                                : "text-slate-700"
                            }`}
                          >
                            <span className="truncate">{b.name}</span>
                            {isSelected && (
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Giá gốc (VNĐ) *
              </label>
              <input
                type="number"
                min={0}
                placeholder="Nhập giá bán..."
                value={formBasePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setFormBasePrice("");
                  } else {
                    const num = Number(val);
                    setFormBasePrice(num >= 0 ? num : 0);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Đơn vị tính *
              </label>
              <input
                type="text"
                placeholder="VD: Kg, Khay 500g, Hộp, Chai..."
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700">
                Hình ảnh sản phẩm
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageMode("file")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                    imageMode === "file"
                      ? "bg-white text-[#0d5c3a] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                  <span>Từ máy tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                    imageMode === "url"
                      ? "bg-white text-[#0d5c3a] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Đường dẫn URL</span>
                </button>
              </div>
            </div>

            {imageMode === "file" ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                <label className="flex flex-col items-center justify-center px-4 py-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition shrink-0">
                  <ArrowUpTrayIcon className="w-5 h-5 text-slate-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700">
                    Chọn tệp ảnh
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  {imagePreview ? (
                    <div className="relative w-14 h-14 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-200/60 border border-slate-200 flex items-center justify-center shrink-0">
                      <PhotoIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 truncate">
                    {selectedFile ? (
                      <span className="font-bold text-slate-800 block truncate">
                        {selectedFile.name}
                      </span>
                    ) : (
                      "Chưa chọn tệp (tự động dùng ảnh mặc định nếu bỏ trống)"
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg (bỏ trống để dùng ảnh mặc định)"
                  value={formImageUrl}
                  onChange={(e) => {
                    setFormImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-800"
                />
                {imagePreview && (
                  <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              rows={3}
              placeholder="Nhập mô tả chi tiết sản phẩm..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-800"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 font-bold text-white bg-[#0d5c3a] hover:bg-[#094229] rounded-lg shadow-xs transition disabled:bg-slate-300 cursor-pointer"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
