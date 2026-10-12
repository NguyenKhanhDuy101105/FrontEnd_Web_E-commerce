"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  addressService,
  AddressItem,
} from "@/src/services/customer/addressService";
import AddressFormModal from "@/src/components/addresses/AddAddressModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { showToast } from "@/src/utils/toast";

export default function AddressBook() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
    null,
  );

  const [defaultLoadingId, setDefaultLoadingId] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setErrorMsg("");
      const res = await addressService.getAddresses();
      if (res?.data) {
        const sortedAddresses = [...res.data].sort((a, b) => {
          const isADefault = a.default || a.isDefault ? 1 : 0;
          const isBDefault = b.default || b.isDefault ? 1 : 0;
          return isBDefault - isADefault;
        });
        setAddresses(sortedAddresses);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách địa chỉ:", error);
      let message = "Không thể tải danh sách địa chỉ. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: AddressItem) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setDefaultLoadingId(addressId);
      await addressService.setDefaultAddress(addressId);
      showToast.success("Đã đặt làm địa chỉ mặc định!");
      await fetchAddresses();
    } catch (error) {
      console.error("Lỗi thiết lập địa chỉ mặc định:", error);
      let message = "Không thể đặt làm mặc định. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showToast.error(message);
    } finally {
      setDefaultLoadingId(null);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa địa chỉ này không?",
    );
    if (!isConfirmed) return;

    try {
      await addressService.deleteAddress(addressId);
      showToast.success("Đã xóa địa chỉ thành công!");
      await fetchAddresses();
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      let message = "Không thể xóa địa chỉ. Vui lòng thử lại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showToast.error(message);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800">
          Sổ địa chỉ
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddNewAddress}
        className="w-full py-3.5 border-2 border-dashed border-emerald-200 hover:border-[#0d5c3a] rounded-lg bg-emerald-50/40 hover:bg-emerald-50 text-[#0d5c3a] font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer group shadow-2xs"
      >
        <PlusIcon className="w-5 h-5 text-[#0d5c3a] group-hover:scale-110 transition-transform" />
        <span>Thêm địa chỉ mới</span>
      </button>

      {isLoading ? (
        <div className="py-10 text-center text-slate-400 font-medium text-xs sm:text-sm">
          Đang tải danh sách địa chỉ...
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs sm:text-sm bg-slate-50/50 rounded-lg border border-slate-100">
              Bạn chưa có địa chỉ nào trong sổ địa chỉ.
            </div>
          ) : (
            addresses.map((item) => {
              const isDefault = item.default || item.isDefault;

              return (
                <div
                  key={item.id}
                  className={`w-full bg-white rounded-lg border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    isDefault
                      ? "border-emerald-200 bg-emerald-50/10"
                      : "border-slate-100"
                  }`}
                >
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm sm:text-base">
                        {item.recipientName}
                      </span>
                      {isDefault && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-800 rounded-full uppercase">
                          Mặc định
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Địa chỉ: {item.line}, {item.ward}, {item.district},{" "}
                      {item.city}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-500">
                      Điện thoại: {item.phone}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2.5 self-end sm:self-center shrink-0">
                    {!isDefault && (
                      <button
                        type="button"
                        disabled={defaultLoadingId === item.id}
                        onClick={() => handleSetDefault(item.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {defaultLoadingId === item.id
                          ? "Đang xử lý..."
                          : "Thiết lập mặc định"}
                      </button>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditAddress(item)}
                        className="px-4 py-1.5 border border-slate-200 hover:border-[#0d5c3a] text-slate-700 hover:text-[#0d5c3a] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Chỉnh sửa
                      </button>

                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(item.id)}
                          className="px-4 py-1.5 border border-red-200 hover:border-red-400 text-red-500 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        initialData={selectedAddress}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}
