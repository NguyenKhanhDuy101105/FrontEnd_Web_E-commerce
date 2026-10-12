"use client";

import React from "react";
import Link from "next/link";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface SidebarNavProps {
  navItems: NavItem[];
  pathname: string;
  isCollapsed: boolean;
}

export default function SidebarNav({
  navItems,
  pathname,
  isCollapsed,
}: SidebarNavProps) {
  return (
    <nav className="space-y-1.5 pt-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/store"
            ? pathname === "/store"
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
                ? "bg-slate-700/70 text-white font-semibold shadow-xs"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div
              className={`flex items-center shrink-0 ${
                isCollapsed ? "justify-center" : "space-x-3"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-[#10b981]" : "text-slate-400"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">{item.name}</span>
              )}
            </div>

            {!isCollapsed && item.badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            )}

            {isCollapsed && (
              <div className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
                {item.name}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
