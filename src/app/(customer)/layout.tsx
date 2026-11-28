"use client";

import React from "react";
import Header from "@/src/components/common/Header";
import Footer from "@/src/components/common/Footer";
import ChatWidget from "@/src/components/common/ChatWidget";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthGuard();

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "411536265408-cv9nj49gbap6o5e5d02fq2un7qprcd51.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 relative">
        <Header />

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <div className="hidden md:block">
          <Footer />
        </div>
      </div>

      <div className="[&>div]:bottom-20! md:[&>div]:bottom-6! [&>button]:bottom-20! md:[&>button]:bottom-6!">
        <ChatWidget />
      </div>
    </GoogleOAuthProvider>
  );
}
