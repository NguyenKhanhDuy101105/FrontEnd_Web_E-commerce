"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import Cookies from "js-cookie";

interface UserData {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export default function UserMenu() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { isAuthenticated: authGuardStatus } = useAuthGuard();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      setIsLoggedIn(true);
      if (storedUser) {
        try {
          const parsedUser: UserData = JSON.parse(storedUser);
          setUserInfo(parsedUser);
        } catch (error) {
          console.error("Lỗi parse thông tin user từ localStorage:", error);
        }
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth, authGuardStatus]);

  const handleMouseEnter = () => {
    checkAuth();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getAvatarInitial = (fullName?: string) => {
    if (!fullName || !fullName.trim()) return "U";
    const nameParts = fullName.trim().split(" ");
    const lastName = nameParts[nameParts.length - 1];
    return lastName.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedBranch");

    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });

    setIsLoggedIn(false);
    setUserInfo(null);
    setIsHovered(false);
    router.push("/auth/login");
  };

  const handleOnClick = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      router.push("/account");
    }
  };

  return (
    <div
      className="relative py-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleOnClick}
        className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none cursor-pointer"
        title="Tài khoản"
      >
        <UserIcon className="w-6 h-6" />
      </button>

      {isHovered && (
        <div className="absolute right-0 top-full w-64 pt-0.5 z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
            {isLoggedIn && userInfo ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden select-none">
                    {getAvatarInitial(userInfo.fullName)}
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {userInfo.fullName || "Khách hàng"}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {userInfo.email || userInfo.phone || "Đã xác thực"}
                    </p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setIsHovered(false)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors font-medium"
                  >
                    <UserIcon className="w-5 h-5 text-slate-500" />
                    <span>Thông tin tài khoản</span>
                  </Link>

                  <Link
                    href="/account/orders"
                    onClick={() => setIsHovered(false)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors font-medium"
                  >
                    <ShoppingBagIcon className="w-5 h-5 text-slate-500" />
                    <span>Quản lý đơn hàng</span>
                  </Link>

                  <Link
                    href="/account/wish_list"
                    onClick={() => setIsHovered(false)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors font-medium"
                  >
                    <HeartIcon className="w-5 h-5 text-slate-500" />
                    <span>Sản phẩm yêu thích</span>
                  </Link>

                  <Link
                    href="/account/address"
                    onClick={() => setIsHovered(false)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors font-medium"
                  >
                    <MapPinIcon className="w-5 h-5 text-slate-500" />
                    <span>Sổ địa chỉ</span>
                  </Link>

                  <Link
                    href="/account/notifications"
                    onClick={() => setIsHovered(false)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors font-medium"
                  >
                    <BellIcon className="w-5 h-5 text-slate-500" />
                    <span>Thông báo</span>
                  </Link>
                </nav>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Xin chào quý khách
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đăng nhập để theo dõi đơn hàng và nhận ưu đãi
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsHovered(false)}
                    className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsHovered(false)}
                    className="block w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
                  >
                    Chưa có tài khoản? Đăng ký ngay
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
