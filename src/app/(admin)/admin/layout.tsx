"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartBarIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  CircleStackIcon,
  InboxArrowDownIcon,
  Squares2X2Icon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { getUserFromStorage, User } from "@/src/utils/getUser";
import Cookies from "js-cookie";

import AdminSidebarHeader from "./components/AdminSidebarHeader";
import AdminSidebarNav, { AdminNavItem } from "./components/AdminSidebarNav";
import AdminUserCard from "./components/AdminUserCard";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const userData = getUserFromStorage();
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems: AdminNavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: ChartBarIcon },
    {
      name: "Quản lý chuỗi chi nhánh",
      href: "/admin/stores",
      icon: BuildingStorefrontIcon,
    },
    {
      name: "Tài khoản và phân quyền",
      href: "/admin/accounts",
      icon: UserGroupIcon,
    },
    {
      name: "Quản lý danh mục",
      href: "/admin/categories",
      icon: Squares2X2Icon,
    },
    {
      name: "Quản lý sản phẩm",
      href: "/admin/products",
      icon: CubeIcon,
    },
    {
      name: "Quản lý tồn kho",
      href: "/admin/inventory",
      icon: CircleStackIcon,
    },
    {
      name: "Quản lý nhập hàng",
      href: "/admin/replenishment",
      icon: InboxArrowDownIcon,
      badge: "6",
      badgeColor: "bg-rose-500 text-white font-bold",
    },
    {
      name: "Quản lý khuyến mãi",
      href: "/admin/promotions",
      icon: TagIcon,
    },
    {
      name: "Đánh giá và phản hồi",
      href: "/admin/reviews",
      icon: ChatBubbleLeftRightIcon,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });

    router.push("/auth/login");
  };

  const firstLetter = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : "A";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0f172a] text-zinc-300 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out overflow-x-hidden ${
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
          {/* Header & Brand */}
          <AdminSidebarHeader
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            setIsMobileOpen={setIsMobileOpen}
          />

          {/* Nav Menu */}
          <AdminSidebarNav
            navItems={navItems}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* User Card Bottom */}
        <AdminUserCard
          user={user}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
          firstLetter={firstLetter}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header cho Mobile */}
        <header className="lg:hidden bg-[#0f172a] border-b border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-zinc-300 hover:text-white bg-zinc-900 rounded-lg"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="font-bold text-sm">UrbanMart Admin</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {isMounted ? firstLetter : "A"}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
