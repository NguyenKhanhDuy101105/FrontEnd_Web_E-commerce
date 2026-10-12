"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Squares2X2Icon,
  UserIcon,
} from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationBell";
import CartMenu from "./CartMenu";

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around py-2 px-1">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-colors ${
            pathname === "/" ? "text-emerald-600 font-bold" : "text-slate-500"
          }`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-[11px] leading-none">Trang chủ</span>
        </Link>

        <Link
          href="/categories"
          className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-colors ${
            pathname === "/categories"
              ? "text-emerald-600 font-bold"
              : "text-slate-500"
          }`}
        >
          <Squares2X2Icon className="w-6 h-6" />
          <span className="text-[11px] leading-none">Danh mục</span>
        </Link>

        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-colors ${
            pathname === "/cart"
              ? "text-emerald-600 font-bold"
              : "text-slate-500"
          }`}
        >
          <div className="pointer-events-none">
            {" "}
            <CartMenu />
          </div>
          <span className="text-[11px] leading-none -mt-1">Giỏ hàng</span>
        </Link>

        <Link
          href="/account/notifications"
          className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-colors ${
            pathname === "/account/notifications"
              ? "text-emerald-600 font-bold"
              : "text-slate-500"
          }`}
        >
          <div className="pointer-events-none">
            <NotificationBell />
          </div>
          <span className="text-[11px] leading-none -mt-1">Thông báo</span>
        </Link>

        <Link
          href="/account"
          className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-colors ${
            pathname.startsWith("/account") &&
            pathname !== "/account/notifications"
              ? "text-emerald-600 font-bold"
              : "text-slate-500"
          }`}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[11px] leading-none">Tài khoản</span>
        </Link>
      </div>
    </nav>
  );
}
