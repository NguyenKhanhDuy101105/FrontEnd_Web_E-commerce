"use client";

import Image from "next/image";
import Link from "next/link";
import CategoryDropdown from "./CategoryDropdown";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import CartMenu from "./CartMenu";
import BranchSelector from "./BranchSelector";
import TopBanner from "./TopBanner";
import BottomNavigation from "./BottomNavigation";

export default function Header() {
  return (
    <>
      <div className="hidden md:block">
        <TopBanner />
      </div>
      <header className="w-full bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-3 py-2.5 md:py-3.5 space-y-2 md:space-y-0">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <Link href="/" className="flex items-center space-x-2 shrink-0">
                <div className="relative w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl p-0.5 border border-slate-100 shadow-sm">
                  <Image
                    src="/images/Logo.jpeg"
                    alt="UrbanMart Logo"
                    fill
                    className="object-contain rounded-lg"
                    priority
                  />
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
                  Urban
                  <span className="text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
                    Mart
                  </span>
                </span>
              </Link>

              <div className="hidden lg:block">
                <CategoryDropdown />
              </div>

              <div className="hidden md:block flex-1 max-w-2xl">
                <SearchBar />
              </div>

              <div className="hidden md:flex items-center space-x-3 shrink-0">
                <UserMenu />
                <NotificationBell />
                <CartMenu />
                <div className="h-6 w-px bg-slate-200"></div>
                <BranchSelector />
              </div>
            </div>

            <div className="block md:hidden pt-1">
              <SearchBar />
            </div>

            <div className="block md:hidden border-t border-slate-100 pt-1.5">
              <BranchSelector />
            </div>
          </div>
        </div>
      </header>

      <BottomNavigation />
    </>
  );
}
