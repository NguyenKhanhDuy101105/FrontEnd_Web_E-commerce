"use client";

import React from "react";
import Image from "next/image";
import { UserIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { ChatConversation } from "./ConversationList";

interface CustomerInfoSidebarProps {
  customer?: ChatConversation;
  onSendProductSuggestion: (text: string) => void;
}

export default function CustomerInfoSidebar({
  customer,
  onSendProductSuggestion,
}: CustomerInfoSidebarProps) {
  if (!customer) return null;

  return (
    <div className="w-80 bg-white border-l border-slate-200/80 flex flex-col shrink-0 hidden lg:flex overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
          Hồ sơ khách hàng
        </h3>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <UserIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{customer.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <PhoneIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-slate-600">
            <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{customer.address}</span>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex justify-between text-slate-500 text-[11px]">
            <span>Tổng đơn mua:</span>
            <strong className="text-slate-800 font-bold">
              {customer.totalOrders} đơn hàng
            </strong>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
          Đơn hàng gần đây
        </h3>
        {customer.recentOrder ? (
          <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-800">
                #{customer.recentOrder.code}
              </span>
              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-full">
                {customer.recentOrder.status}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Ngày đặt:</span>
              <span>{customer.recentOrder.createdAt}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold">
              <span>Tổng tiền:</span>
              <span className="text-emerald-700 font-black">
                {customer.recentOrder.totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Chưa có đơn hàng nào</p>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
          Gửi gợi ý sản phẩm
        </h3>
        <div className="space-y-2">
          <div className="p-2 border border-slate-200 hover:border-emerald-600 rounded-xl bg-white flex items-center justify-between text-xs transition">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 relative rounded bg-slate-50 shrink-0">
                <Image
                  src="/images/Banner1.jpeg"
                  alt=""
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-800 truncate">
                  Cá ngừ đại dương 300g
                </p>
                <p className="text-[11px] font-black text-emerald-700">
                  65.000đ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onSendProductSuggestion(
                  "Dạ mình gửi thông tin sản phẩm Cá ngừ đại dương khay 300g để bạn tham khảo nhé!",
                )
              }
              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[10px] rounded-lg transition cursor-pointer shrink-0"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
