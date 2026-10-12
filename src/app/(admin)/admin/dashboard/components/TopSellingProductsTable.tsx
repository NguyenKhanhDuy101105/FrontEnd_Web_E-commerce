"use client";

import { useState } from "react";
import AdminPagination from "@/src/components/common/AdminPagination";

const FAKE_PRODUCTS = [
  {
    sku: "MEAT-AU-9901",
    name: "Thịt ba chỉ bò Úc Excel Cuộn Lẩu (500g)",
    unit: "Khay 500g",
    category: "Thịt tươi sống",
    sold: 14280,
    soldUnit: "khay",
    revenue: "1.199.520.000 đ",
    revenuePercent: "9.3% tổng GMV",
    stock: "2.850 khay",
    stockStatus: "Dồi dào",
    status: "Siêu bán chạy",
    image: "/images/Banner1.jpeg",
  },
  {
    sku: "FRT-MC-021",
    name: "Dâu tây Hana Mộc Châu Thượng Hạng",
    unit: "Hộp 500g",
    category: "Trái cây cao cấp",
    sold: 11500,
    soldUnit: "hộp",
    revenue: "1.552.500.000 đ",
    revenuePercent: "12.1% tổng GMV",
    stock: "840 hộp",
    stockStatus: "Vừa đủ",
    status: "Đang bán chạy",
    image: "/images/Banner1.jpeg",
  },
  {
    sku: "VEG-DL-004",
    name: "Rau Xà lách Romaine Thủy canh Đà Lạt",
    unit: "Túi 300g",
    category: "Rau hữu cơ",
    sold: 22400,
    soldUnit: "gói",
    revenue: "627.200.000 đ",
    revenuePercent: "4.9% tổng GMV",
    stock: "3.100 gói",
    stockStatus: "Dồi dào",
    status: "Ổn định",
    image: "/images/Banner1.jpeg",
  },
  {
    sku: "AVO-DL-034",
    name: "Bơ Sáp Dài 034 Đắk Lắk Loại 1",
    unit: "Túi 1kg",
    category: "Nông sản củ quả",
    sold: 9850,
    soldUnit: "túi",
    revenue: "837.250.000 đ",
    revenuePercent: "6.5% tổng GMV",
    stock: "540 túi",
    stockStatus: "Cảnh báo",
    status: "Sắp hết tồn",
    image: "/images/Banner1.jpeg",
  },
];

export default function TopSellingProductsTable() {
  const [products, setProducts] = useState(FAKE_PRODUCTS);

  // 💥 Cấu hình State cho Phân trang Admin
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed theo Spring Boot
  const [pageSize, setPageSize] = useState(5);
  const totalElements = 3840; // Tổng số SKU toàn chuỗi từ API Backend
  const totalPages = Math.ceil(totalElements / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // 💥 [API CALL HERE]: Fetch lại sản phẩm theo newPage
    // fetchProducts(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Quay về trang đầu khi thay đổi số lượng bản ghi/trang
    // 💥 [API CALL HERE]: Fetch lại sản phẩm theo newSize
    // fetchProducts(0, newSize);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 text-base">
              Top Mặt hàng Bán chạy Toàn Hệ thống
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Top 5 SKU chủ lực
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu ghi nhận sản lượng thực tế qua hệ thống quét mã POS và đơn
            App giao nhanh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button className="bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg">
            Tất cả
          </button>
          <button className="bg-slate-100 text-slate-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200">
            Nông sản tươi
          </button>
          <button className="bg-slate-100 text-slate-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200">
            Thịt bò & Hải sản
          </button>
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">SẢN PHẨM & SKU</th>
              <th className="py-3 px-3">DANH MỤC</th>
              <th className="py-3 px-3">ĐÃ BÁN (SẢN LƯỢNG)</th>
              <th className="py-3 px-3">DOANH THU ĐÓNG GÓP</th>
              <th className="py-3 px-3">TỒN KHO CHUỖI</th>
              <th className="py-3 px-3 text-center">TRẠNG THÁI</th>
              <th className="py-3 px-3 text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {products.map((item) => (
              <tr
                key={item.sku}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        SKU: {item.sku} • {item.unit}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <p className="font-black text-slate-900 text-sm">
                    {item.sold.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{item.soldUnit}</p>
                </td>
                <td className="py-3 px-3">
                  <p className="font-black text-slate-900">{item.revenue}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    {item.revenuePercent}
                  </p>
                </td>
                <td className="py-3 px-3">
                  <p className="font-bold text-slate-800">{item.stock}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.stockStatus}
                  </p>
                </td>
                <td className="py-3 px-3 text-center">
                  {item.status === "Sắp hết tồn" ? (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ⚠️ Sắp hết tồn
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      🔥 {item.status}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {item.status === "Sắp hết tồn" ? (
                    <button className="bg-emerald-800 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg hover:bg-emerald-900 cursor-pointer">
                      🛒 Nhập gấp
                    </button>
                  ) : (
                    <button className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      🔗
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 💥 Tích hợp Component AdminPagination */}
      <div className="pt-2 border-t border-slate-100">
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
