import React from "react";
import Header from "@/src/components/common/Header";
import Footer from "@/src/components/common/Footer";
import ChatWidget from "@/src/components/common/ChatWidget";
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-1">{children}</main>
      <div className="hidden md:block">
        <Footer />
        <ChatWidget />
      </div>
    </div>
  );
}
