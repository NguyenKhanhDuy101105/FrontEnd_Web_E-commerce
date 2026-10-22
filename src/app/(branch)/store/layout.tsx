"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  ArrowDownOnSquareIcon,
  SparklesIcon,
  ReceiptPercentIcon,
  StarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getUserFromStorage, User } from "@/src/utils/getUser";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import Cookies from "js-cookie";

import BranchSidebarHeader from "./components/BranchSidebarHeader";
import SidebarNav from "./components/SidebarNav";
import UserCard from "./components/UserCard";

interface BranchData {
  id: string;
  name: string;
  address: string;
  [key: string]: unknown;
}

export default function BranchPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { isChecking } = useAuthGuard({
    allowedRoles: ["BRANCH"],
  });

  const [user, setUser] = useState<User | null>(null);
  const [currentBranch, setCurrentBranch] = useState<BranchData | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    const userData = getUserFromStorage();
    if (userData) {
      setUser(userData);
    }

    const savedBranch = localStorage.getItem("currentBranch");
    if (savedBranch) {
      try {
        setCurrentBranch(JSON.parse(savedBranch));
      } catch (e) {
        console.error("Lỗi parse currentBranch:", e);
      }
    }
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Tổng quan", href: "/store", icon: Squares2X2Icon },
    {
      name: "Đơn hàng Trực tuyến",
      href: "/store/orders",
      icon: ShoppingBagIcon,
      badge: "12",
      badgeColor: "bg-[#10b981] text-white",
    },
    {
      name: "Tư vấn & Chat",
      href: "/store/chats",
      icon: ChatBubbleLeftRightIcon,
      badge: "4",
      badgeColor: "bg-[#f59e0b] text-white",
    },
    {
      name: "Quản lý Kho & Tồn kho",
      href: "/store/inventory",
      icon: ArchiveBoxIcon,
    },
    {
      name: "Yêu cầu Nhập hàng",
      href: "/store/import-requests",
      icon: ArrowDownOnSquareIcon,
      badge: "2",
      badgeColor: "bg-[#10b981] text-white",
    },
    {
      name: "Báo cáo Dự báo AI",
      href: "/store/ai-report",
      icon: SparklesIcon,
      badge: "AI",
      badgeColor:
        "bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-500/40",
    },
    { name: "POS & Đổi trả", href: "/store/pos", icon: ReceiptPercentIcon },
    { name: "Đánh giá chi nhánh", href: "/store/reviews", icon: StarIcon },
    {
      name: "Cài đặt & Tài khoản",
      href: "/store/settings",
      icon: Cog6ToothIcon,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("branchId");
    localStorage.removeItem("currentBranch");

    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    Cookies.remove("branchId", { path: "/" });

    router.push("/auth/login");
  };

  const headerAvatarLetter = currentBranch?.name
    ? currentBranch.name.trim().charAt(0).toUpperCase()
    : "U";

  if (isChecking) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300 font-sans space-y-3">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-[#10b981]" />
        <span className="text-xs font-semibold tracking-wide">
          Đang xác thực quyền truy cập Chi nhánh...
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#1e293b] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-700/50 shadow-xl transition-all duration-300 ease-in-out overflow-x-hidden ${
          isMobileOpen
            ? "translate-x-0 w-72 sm:w-80"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div
          className={`flex flex-col h-full overflow-y-auto no-scrollbar py-5 space-y-5 ${
            isCollapsed ? "px-2" : "px-3.5"
          }`}
        >
          <BranchSidebarHeader
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            setIsMobileOpen={setIsMobileOpen}
            currentBranch={currentBranch}
            isMounted={isMounted}
          />

          <SidebarNav
            navItems={navItems}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        </div>

        <UserCard
          user={user}
          currentBranch={currentBranch}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
          onLogout={handleLogout}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-[#1e293b] border-b border-slate-700/50 px-4 py-3 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="font-bold text-sm">Branch Portal</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#0d5c3a] text-white flex items-center justify-center font-bold text-xs">
              {isMounted ? headerAvatarLetter : "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
