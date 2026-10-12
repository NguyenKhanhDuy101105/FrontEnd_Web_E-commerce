"use client";

import React from "react";
import Link from "next/link";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface AdminSidebarNavProps {
  navItems: AdminNavItem[];
  pathname: string;
  isCollapsed: boolean;
}

export default function AdminSidebarNav({
  navItems,
  pathname,
  isCollapsed,
}: AdminSidebarNavProps) {
  return (
    <nav className="space-y-1.5 pt-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={isCollapsed ? item.name : undefined}
            className={`flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all relative group ${
              isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2.5"
            } ${
              isActive
                ? "bg-indigo-600/20 text-white font-semibold border border-indigo-500/30 shadow-xs"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
            }`}
          >
            <div
              className={`flex items-center shrink-0 ${
                isCollapsed ? "justify-center" : "space-x-3"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-indigo-400" : "text-zinc-400"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">{item.name}</span>
              )}
            </div>

            {!isCollapsed && item.badge && (
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            )}

            {/* Desktop Tooltip when collapsed */}
            {isCollapsed && (
              <div className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-950 text-white text-xs rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-zinc-800">
                {item.name}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
