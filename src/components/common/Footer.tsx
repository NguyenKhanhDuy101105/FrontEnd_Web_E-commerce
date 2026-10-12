"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d884f] text-slate-300 pt-5 pb-5 md:pb-10 border-t-2 border-emerald-600/40">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="relative w-9 h-9 bg-white rounded-xl p-0.5 shadow-sm">
              <Image
                src="/images/Logo.jpeg"
                alt="UrbanMart Logo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Urban<span className="text-emerald-400">Mart</span>
            </span>
          </Link>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider hover:text-emerald-400">
            Về chúng tôi
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/about"
                className="hover:text-emerald-400 transition-colors"
              >
                Giới thiệu về UrbanMart
              </Link>
            </li>
            <li>
              <Link
                href="/stores"
                className="hover:text-emerald-400 transition-colors"
              >
                Danh sách cửa hàng
              </Link>
            </li>
            <li>
              <Link
                href="/quality"
                className="hover:text-emerald-400 transition-colors"
              >
                Quản lý chất lượng
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-emerald-400 transition-colors"
              >
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-emerald-400 transition-colors"
              >
                Điều khoản và điều kiện giao dịch
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider hover:text-emerald-400">
            Hỗ trợ khách hàng
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/help"
                className="hover:text-emerald-400 transition-colors"
              >
                Trung tâm hỗ trợ khách hàng
              </Link>
            </li>
            <li>
              <Link
                href="/shipping-policy"
                className="hover:text-emerald-400 transition-colors"
              >
                Chính sách giao hàng
              </Link>
            </li>
            <li>
              <Link
                href="/payment-policy"
                className="hover:text-emerald-400 transition-colors"
              >
                Chính sách thanh toán
              </Link>
            </li>
            <li>
              <Link
                href="/return-policy"
                className="hover:text-emerald-400 transition-colors"
              >
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="hover:text-emerald-400 transition-colors"
              >
                Đánh giá góp ý
              </Link>
            </li>
            <li>
              <Link
                href="/winners"
                className="hover:text-emerald-400 transition-colors"
              >
                Danh sách trúng thưởng
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider hover:text-emerald-400">
            Chăm sóc khách hàng
          </h4>

          <div className="space-y-2 text-xs">
            <p>
              <span className="text-slate-400">Mua Online:</span>{" "}
              <a
                href="tel:02471066866"
                className="font-bold text-emerald-400 hover:underline"
              >
                0247 1066866
              </a>
            </p>
            <p className="break-all">
              <span className="text-slate-400">Email:</span>{" "}
              <a
                href="mailto:cskh@urbanmart.vn"
                className="font-bold text-white hover:text-emerald-400 transition-colors"
              >
                cskh@urbanmart.vn
              </a>
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <h5 className="text-xs font-semibold text-slate-300">
              Kết nối với chúng tôi
            </h5>

            <div className="flex items-center space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                title="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-blue-500 hover:bg-blue-400 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md p-1.5"
                title="Zalo"
              >
                <svg className="w-full h-full fill-current" viewBox="0 0 48 48">
                  <path d="M24 4C12.95 4 4 11.83 4 21.48c0 5.62 3.09 10.6 7.89 13.92-.35 2.16-1.55 5.38-2.31 6.84-.23.44.22.92.68.72 2.92-1.28 6.51-3.23 8.78-4.48 1.6.35 3.26.54 4.96.54 11.05 0 20-7.83 20-17.48S35.05 4 24 4zm-7.6 22.8h-3.6V16.8h3.6v10zm2.4-10h6.4v2.4h-4v1.4h3.6v2.4h-3.6v1.4h4v2.4h-6.4V16.8zm11.6 0h2.8l3.2 5.4v-5.4h2.4v10h-2.8l-3.2-5.4v5.4h-2.4V16.8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
