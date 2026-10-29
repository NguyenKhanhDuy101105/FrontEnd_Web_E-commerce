"use client";

import React from "react";
import Header from "@/src/components/common/Header";
import Footer from "@/src/components/common/Footer";
import ChatWidget from "@/src/components/common/ChatWidget";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthGuard();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 relative">
      <Header />

      <main className="flex-1 pb-2 md:pb-0">{children}</main>

      <div className="hidden md:block">
        <Footer />
        <ChatWidget />
      </div>
    </div>
  );
}
