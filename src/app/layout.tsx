import "./globals.css";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BranchProvider } from "@/src/context/BranchContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
export const metadata = {
  title: "UrbanMart",
  description: "Ứng dụng mua sắm thực phẩm thông minh tích hợp AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-800 antialiased">
        <BranchProvider>
          <WishlistProvider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              limit={3}
              hideProgressBar={true}
              closeOnClick
              pauseOnHover
              theme="light"
              toastClassName="!bg-white !rounded-lg !shadow-xl !border !border-slate-100 !p-4 !font-sans"
            />

            {children}
          </WishlistProvider>
        </BranchProvider>
      </body>
    </html>
  );
}
