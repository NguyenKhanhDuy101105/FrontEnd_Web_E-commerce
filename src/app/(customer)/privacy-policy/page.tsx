"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="bg-slate-50/70 min-h-screen py-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <nav className="text-[14px] text-slate-500 mb-6 flex items-center space-x-1.5">
          <Link href="/" className="hover:text-emerald-700 transition">
            Trang chủ
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">
            Chính sách bảo mật & xử lý dữ liệu cá nhân
          </span>
        </nav>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs mb-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase">
            CHÍNH SÁCH BẢO MẬT VÀ XỬ LÝ DỮ LIỆU CÁ NHÂN
          </h1>
          <p className="text-[14px] sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider">
            Áp dụng cho khách hàng của UrbanMart
          </p>
          <div className="pt-2 text-[14px] text-slate-500 max-w-2xl mx-auto leading-relaxed text-justify">
            UrbanMart đề cao và tôn trọng quyền riêng tư, bảo mật thông tin của
            khách hàng. Chính sách này mô tả cách thức chúng tôi thu thập, lưu
            trữ, bảo vệ và xử lý dữ liệu cá nhân của bạn đúng theo quy định pháp
            luật.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
          <section id="section-1" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                1
              </span>
              ĐỊNH NGHĨA VÀ GIẢI THÍCH TỪ NGỮ
            </h2>
            <p className="text-[14px] text-slate-500 text-justify">
              Trong chính sách bảo mật này, trừ khi ngữ cảnh có yêu cầu khác,
              các từ ngữ sau đây được hiểu như sau:
            </p>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-[14px] border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-1/3 border-r border-slate-200">
                      Thuật ngữ
                    </th>
                    <th className="p-3">Giải thích nghĩa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800 border-r border-slate-100">
                      Dữ liệu cá nhân
                    </td>
                    <td className="p-3 text-justify">
                      Là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình
                      ảnh, âm thanh hoặc dạng tương tự gắn liền với một con
                      người cụ thể hoặc giúp xác định một con người cụ thể.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800 border-r border-slate-100">
                      Chủ thể dữ liệu
                    </td>
                    <td className="p-3 text-justify">
                      Là cá nhân được dữ liệu cá nhân phản ánh (Khách hàng sử
                      dụng dịch vụ của UrbanMart).
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800 border-r border-slate-100">
                      Bên kiểm soát dữ liệu
                    </td>
                    <td className="p-3 text-justify">
                      Là công ty/hệ thống UrbanMart – tổ chức quyết định mục
                      đích và phương tiện xử lý dữ liệu cá nhân.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800 border-r border-slate-100">
                      Xử lý dữ liệu cá nhân
                    </td>
                    <td className="p-3 text-justify">
                      Là một hoặc nhiều hoạt động tác động đến dữ liệu cá nhân
                      như: thu thập, ghi, phân tích, lưu trữ, chỉnh sửa, công
                      khai, kết hợp, truy cập, trích xuất, thu hồi, mã hóa, xóa,
                      hủy dữ liệu.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-2" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                2
              </span>
              VAI TRÒ PHÁP LÝ CỦA URBANMART
            </h2>
            <p className="text-justify">
              UrbanMart đóng vai trò là <strong>Bên kiểm soát dữ liệu</strong>{" "}
              đồng thời là <strong>Bên xử lý dữ liệu cá nhân</strong> đối với dữ
              liệu thu thập từ khách hàng khi thực hiện giao dịch mua sắm trực
              tuyến, trải nghiệm ứng dụng AI hoặc mua hàng trực tiếp tại hệ
              thống chi nhánh siêu thị UrbanMart.
            </p>
          </section>

          <section id="section-3" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                3
              </span>
              DANH MỤC DỮ LIỆU CÁ NHÂN CỦA KHÁCH HÀNG ĐƯỢC XỬ LÝ
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-[14px] sm:text-sm">
              <li className="text-justify">
                <strong>Dữ liệu định danh:</strong> Họ và tên, giới tính, ngày
                tháng năm sinh.
              </li>
              <li className="text-justify">
                <strong>Dữ liệu liên hệ:</strong> Số điện thoại, email, địa chỉ
                nhận hàng (kinh độ, vĩ độ tọa độ giao hàng).
              </li>
              <li className="text-justify">
                <strong>Dữ liệu giao dịch:</strong> Lịch sử đơn hàng, giá trị
                thanh toán, danh mục thực phẩm yêu thích, mã giảm giá áp dụng.
              </li>
              <li className="text-justify">
                <strong>Dữ liệu tương tác AI:</strong> Lịch sử tư vấn thực đơn
                món ăn với Chatbot AI Gemini, nhãn nhóm nguyên liệu dị ứng/kỵ
                nhau.
              </li>
              <li className="text-justify">
                <strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, cookie duyệt web,
                thông tin vị trí chi nhánh gần nhất được chọn.
              </li>
            </ul>
          </section>

          <section id="section-4" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                4
              </span>
              MỤC ĐÍCH XỬ LÝ DỮ LIỆU CÁ NHÂN CỦA KHÁCH HÀNG
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-justify">
                <strong className="text-emerald-900 block mb-1">
                  1. Vận hành đơn hàng
                </strong>
                Xác nhận đơn, đóng gói tại chi nhánh và giao thực phẩm tươi sống
                đến địa chỉ khách hàng.
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-justify">
                <strong className="text-emerald-900 block mb-1">
                  2. Trợ lý AI & cảnh báo
                </strong>
                Gợi ý thực đơn món ăn cá nhân hóa và cảnh báo các thực phẩm kỵ
                nhau trong giỏ hàng.
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-justify">
                <strong className="text-emerald-900 block mb-1">
                  3. Chăm sóc khách hàng
                </strong>
                Gửi thông báo trạng thái đơn, xử lý khiếu nại, hỗ trợ qua Chat
                Support Hub.
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-justify">
                <strong className="text-emerald-900 block mb-1">
                  4. An toàn & pháp lý
                </strong>
                Phòng chống hành vi gian lận, tuân thủ các quy định quản lý tài
                chính và thuế.
              </div>
            </div>
          </section>

          <section id="section-5" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                5
              </span>
              TỔ CHỨC, CÁ NHÂN ĐƯỢC XỬ LÝ DỮ LIỆU CÁ NHÂN
            </h2>
            <p className="text-[14px] text-justify">
              UrbanMart cam kết không bán dữ liệu cá nhân. Dữ liệu chỉ được chia
              sẻ hạn chế cho:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-[14px]">
              <li className="text-justify">
                Nhân viên vận hành tại các chi nhánh siêu thị UrbanMart đảm nhận
                nhặt hàng và giao hàng.
              </li>
              <li className="text-justify">
                Đối tác cung cấp dịch vụ thanh toán trực tuyến (như cổng thanh
                toán VNPay).
              </li>
              <li className="text-justify">
                Cơ quan nhà nước có thẩm quyền khi có yêu cầu bằng văn bản đúng
                quy định pháp luật.
              </li>
            </ol>
          </section>

          <section id="section-6" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                6
              </span>
              CÁCH THỨC XỬ LÝ DỮ LIỆU CÁ NHÂN CỦA KHÁCH HÀNG
            </h2>
            <p className="text-[14px] text-justify">
              Dữ liệu được xử lý tự động và bán tự động trên hệ thống hạ tầng
              máy chủ được bảo mật. Việc thu thập thực hiện qua form đăng ký,
              cookie trình duyệt, thao tác đặt hàng và các API tích hợp an toàn
              (SSL/TLS mã hóa).
            </p>
          </section>

          <section id="section-7" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                7
              </span>
              THỜI HẠN LƯU TRỮ, THỜI GIAN BẮT ĐẦU VÀ KẾT THÚC
            </h2>
            <p className="text-[14px] text-justify">
              - <strong>Bắt đầu:</strong> Kể từ thời điểm khách hàng bắt đầu
              đăng ký tài khoản hoặc sử dụng dịch vụ của UrbanMart.
              <br />- <strong>Kết thúc:</strong> Lưu trữ cho đến khi khách hàng
              gửi yêu cầu xóa tài khoản/dữ liệu hoặc khi UrbanMart chấm dứt hoạt
              động dịch vụ, trừ trường hợp pháp luật có quy định thời hạn lưu
              trữ tối thiểu bắt buộc khác.
            </p>
          </section>

          <section id="section-8" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                8
              </span>
              QUYỀN VÀ NGHĨA VỤ CỦA KHÁCH HÀNG ĐỐI VỚI DỮ LIỆU CÁ NHÂN
            </h2>
            <div className="space-y-2 text-[14px]">
              <p className="text-justify">
                <strong>Quyền của khách hàng:</strong> Quyền được biết, quyền
                đồng ý/rút lại sự đồng ý, quyền truy cập, chỉnh sửa, yêu cầu xóa
                dữ liệu, quyền hạn chế xử lý và gửi khiếu nại.
              </p>
              <p className="text-justify">
                <strong>Nghĩa vụ của khách hàng:</strong> Tự bảo vệ dữ liệu cá
                nhân của mình; cung cấp trung thực, chính xác dữ liệu khi sử
                dụng dịch vụ; không can thiệp trái phép vào hệ thống của
                UrbanMart.
              </p>
            </div>
          </section>

          <section id="section-9" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                9
              </span>
              CAM KẾT BẢO MẬT DỮ LIỆU CÁ NHÂN CỦA KHÁCH HÀNG
            </h2>
            <p className="text-[14px] text-justify">
              UrbanMart cam kết bảo mật tuyệt đối dữ liệu cá nhân của khách hàng
              theo chính sách bảo mật này và quy định của pháp luật. Việc thu
              thập và xử lý dữ liệu chỉ được thực hiện khi có sự đồng ý của
              khách hàng, trừ trường hợp pháp luật có quy định khác.
            </p>
          </section>

          <section id="section-10" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                10
              </span>
              BIỆN PHÁP BẢO VỆ, BẢO ĐẢM AN TOÀN THÔNG TIN DỮ LIỆU CÁ NHÂN
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[14px] space-y-2">
              <p className="flex items-center gap-1.5 font-bold text-slate-800">
                <LockClosedIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                Các giải pháp an ninh mạng được triển khai:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li className="text-justify">
                  Mã hóa dữ liệu đường truyền bằng giao thức SSL/HTTPS.
                </li>
                <li className="text-justify">
                  Xác thực và phân quyền truy cập stateless qua mã JWT.
                </li>
                <li className="text-justify">
                  Lưu trữ đệm dữ liệu an toàn với Redis & CSDL PostgreSQL.
                </li>
                <li className="text-justify">
                  Phân tường lửa chống tấn công rò rỉ dữ liệu.
                </li>
              </ul>
            </div>
          </section>

          <section id="section-11" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                11
              </span>
              HẬU QUẢ, THIỆT HẠI KHÔNG MONG MUỐN CÓ KHẢ NĂNG XẢY RA
            </h2>
            <p className="text-[14px] text-justify">
              Mặc dù áp dụng các biện pháp bảo mật tiên tiến, sự cố kỹ thuật do
              tấn công mạng quy mô lớn hoặc lỗi hệ thống ngoài tầm kiểm soát vẫn
              có khả năng xảy ra. Trong trường hợp có sự cố rò rỉ dữ liệu,
              UrbanMart sẽ ngay lập tức thông báo cho cơ quan chức năng và khách
              hàng theo đúng thời hạn luật định.
            </p>
          </section>

          <section id="section-12" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                12
              </span>
              BỘ PHẬN BẢO VỆ DỮ LIỆU CÁ NHÂN CỦA URBANMART
            </h2>
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[14px] space-y-1 text-emerald-900">
              <p className="font-bold text-sm">
                Trung tâm bảo vệ dữ liệu cá nhân UrbanMart
              </p>
              <p>
                - <strong>Email tiếp nhận yêu cầu:</strong> privacy@urbanmart.vn
              </p>
              <p>
                - <strong>Hotline hỗ trợ:</strong> 1900 6868 (8:00 - 21:00 hàng
                ngày)
              </p>
              <p>
                - <strong>Địa chỉ:</strong> Trụ sở chính hệ thống siêu thị
                UrbanMart, Hà Nội, Việt Nam.
              </p>
            </div>
          </section>

          <section id="section-13" className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center text-[14px] font-black shrink-0">
                13
              </span>
              HIỆU LỰC VÀ SỬA ĐỔI
            </h2>
            <p className="text-[14px] text-justify">
              Chính sách bảo mật này có hiệu lực kể từ ngày ban hành. UrbanMart
              có quyền điều chỉnh, cập nhật chính sách này vào bất kỳ lúc nào và
              sẽ công khai phiên bản mới nhất trên website/ứng dụng.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
