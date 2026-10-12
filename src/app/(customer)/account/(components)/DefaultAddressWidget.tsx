"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  addressService,
  AddressItem,
} from "@/src/services/customer/addressService";
import { MapPinIcon } from "@heroicons/react/24/outline";

export type AddressData = AddressItem;

interface DefaultAddressWidgetProps {
  address?: AddressData;
  isLoading?: boolean;
}

export default function DefaultAddressWidget({
  address: propAddress,
  isLoading: propIsLoading,
}: DefaultAddressWidgetProps) {
  const [fetchedAddress, setFetchedAddress] = useState<AddressItem | null>(
    null,
  );
  const [internalLoading, setInternalLoading] = useState<boolean>(true);

  const defaultAddress =
    propAddress !== undefined ? propAddress : fetchedAddress;
  const isLoading =
    propIsLoading !== undefined ? propIsLoading : internalLoading;

  useEffect(() => {
    if (propAddress !== undefined) {
      setInternalLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDefaultAddress = async () => {
      try {
        setInternalLoading(true);
        const res = await addressService.getAddresses();
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            const foundDefault = res.data.find(
              (item) => item.default || item.isDefault,
            );
            setFetchedAddress(foundDefault || res.data[0]);
          } else {
            setFetchedAddress(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Lỗi khi tải địa chỉ mặc định:", error);
          if (axios.isAxiosError(error)) {
            console.error(error.response?.data?.message);
          }
        }
      } finally {
        if (isMounted) {
          setInternalLoading(false);
        }
      }
    };

    fetchDefaultAddress();

    return () => {
      isMounted = false;
    };
  }, [propAddress]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-100 shadow-xs space-y-3 animate-pulse">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded-md w-1/3" />
          <div className="h-4 bg-slate-200 rounded-md w-10" />
        </div>
        <div className="h-3 bg-slate-100 rounded-md w-1/4" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
        <div className="h-3 bg-slate-100 rounded-md w-3/4" />
        <div className="h-44 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (!defaultAddress) {
    return (
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs sm:text-sm">
            <MapPinIcon className="w-4 h-4 text-[#0d5c3a]" />
            <h3>Địa chỉ nhận hàng</h3>
          </div>
          <Link
            href="/account/address"
            className="text-xs font-semibold text-[#0d5c3a] hover:underline"
          >
            Thêm mới
          </Link>
        </div>
        <div className="py-6 text-center text-slate-400 text-xs">
          Bạn chưa có địa chỉ nhận hàng mặc định nào.
        </div>
      </div>
    );
  }

  const fullAddressString = [
    defaultAddress.line,
    defaultAddress.ward,
    defaultAddress.district,
    defaultAddress.city,
  ]
    .filter((item) => item && item.trim() !== "")
    .join(", ");

  const lat =
    defaultAddress.lat && defaultAddress.lat !== 0
      ? defaultAddress.lat
      : 21.0537;
  const lng =
    defaultAddress.lng && defaultAddress.lng !== 0
      ? defaultAddress.lng
      : 105.7351;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=vi&z=15&output=embed`;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs sm:text-sm">
          <MapPinIcon className="w-4 h-4 text-[#0d5c3a]" />
          <h3>Địa chỉ nhận hàng</h3>
        </div>
        <Link
          href="/account/address"
          className="text-xs font-semibold text-[#0d5c3a] hover:underline"
        >
          Sửa
        </Link>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800">Nhà riêng</span>
          {(defaultAddress.default || defaultAddress.isDefault) && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Mặc định
            </span>
          )}
        </div>
        <p className="font-semibold text-slate-700">
          {defaultAddress.recipientName} • {defaultAddress.phone}
        </p>
        <p className="text-slate-500 leading-relaxed">{fullAddressString}</p>
      </div>

      <div className="relative w-full h-44 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shadow-inner group">
        <iframe
          title="Bản đồ địa chỉ giao hàng"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapEmbedUrl}
          className="w-full h-full border-0 pointer-events-none"
        />

        <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-700 shadow-xs border border-slate-200/60 flex items-center space-x-1 pointer-events-none">
          <MapPinIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate max-w-37.5">
            {defaultAddress.city || "Thành phố Hà Nội"}
          </span>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 z-10 bg-white/95 hover:bg-white text-slate-700 hover:text-[#0d5c3a] px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-xs border border-slate-200/60 transition-all cursor-pointer flex items-center space-x-1"
        >
          <span>Xem bản đồ lớn</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
