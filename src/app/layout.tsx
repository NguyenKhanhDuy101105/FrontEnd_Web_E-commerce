import "./globals.css";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BranchProvider } from "@/src/context/BranchContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import { CartProvider } from "@/src/context/CartContext";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-jakarta",
});

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
    <html lang="vi" className={`${jakarta.variable} font-sans`}>
      <body className="bg-slate-50 text-slate-800 antialiased">
        <BranchProvider>
          <WishlistProvider>
            <CartProvider>
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
            </CartProvider>
          </WishlistProvider>
        </BranchProvider>
      </body>
    </html>
  );
}
