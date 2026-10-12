"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UserIcon,
  CubeIcon,
  HeartIcon,
  MapPinIcon,
  BellIcon,
  TicketIcon,
  Squares2X2Icon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/src/utils/toast";

interface UserProfile {
  fullName?: string;
  name?: string;
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("Khách hàng");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          setUserName(parsedUser.fullName || parsedUser.name || "Khách hàng");
        } catch (error) {
          console.error("Lỗi parse thông tin user từ localStorage:", error);
        }
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast.success("Đã đăng xuất thành công!");
    router.push("/auth/login");
  };

  const navItems = [
    {
      name: "Tổng quan",
      href: "/account",
      icon: Squares2X2Icon,
    },
    {
      name: "Thông tin tài khoản",
      href: "/account/profile",
      icon: UserIcon,
    },
    {
      name: "Quản lý đơn hàng",
      href: "/account/orders",
      icon: CubeIcon,
    },
    {
      name: "Sản phẩm yêu thích",
      href: "/account/wish_list",
      icon: HeartIcon,
    },
    {
      name: "Sổ địa chỉ",
      href: "/account/address",
      icon: MapPinIcon,
    },
    {
      name: "Thông báo",
      href: "/account/notifications",
      icon: BellIcon,
      badge: 0,
    },
    {
      name: "Voucher & Ưu đãi",
      href: "/account/vouchers",
      icon: TicketIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-[#0d5c3a] text-white font-bold flex items-center justify-center text-lg shrink-0">
                {isMounted ? userName.charAt(0).toUpperCase() : ""}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Tài khoản của
                </p>
                {!isMounted || loading ? (
                  <div className="h-4 bg-slate-200 rounded-md w-28 animate-pulse mt-1" />
                ) : (
                  <h2 className="text-sm font-bold text-slate-800 leading-tight truncate">
                    {userName}
                  </h2>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg border border-red-200/60 transition-all cursor-pointer shrink-0 active:scale-95 ml-2"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>

          <nav className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    isActive
                      ? "text-[#0d5c3a] font-bold bg-emerald-50/80 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? "text-[#0d5c3a]" : "text-slate-500"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {!!item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="lg:col-span-9 bg-white rounded-lg border border-slate-100 p-6 sm:p-8 shadow-xs">
          {children}
        </main>
      </div>
    </div>
  );
}
