"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MapPinIcon,
  PencilSquareIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { addressService } from "@/src/services/customer/addressService";
import { branchService, Branch } from "@/src/services/customer/branchService";
import { getCoordinatesFromAddress } from "@/src/utils/geocoding";
import { useBranch } from "@/src/context/BranchContext";

export default function BranchSelector() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const { isAuthenticated } = useAuthGuard();

  const { selectedBranch, setSelectedBranch } = useBranch();

  const [userAddress, setUserAddress] = useState<string>("Đang tải địa chỉ...");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLocationAndBranches = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        const defaultAddr = await addressService.getDefaultAddress();

        let latitude = 21.0537;
        let longitude = 105.7351;

        if (defaultAddr) {
          const formattedAddress = [
            defaultAddr.line,
            defaultAddr.ward,
            defaultAddr.district,
            defaultAddr.city,
          ]
            .filter(Boolean)
            .join(", ");

          setUserAddress(formattedAddress);

          if (defaultAddr.lat && defaultAddr.lng) {
            latitude = defaultAddr.lat;
            longitude = defaultAddr.lng;
          } else {
            const coords = await getCoordinatesFromAddress(
              defaultAddr.line,
              defaultAddr.ward,
              defaultAddr.district,
              defaultAddr.city,
            );
            if (coords.lat && coords.lng) {
              latitude = coords.lat;
              longitude = coords.lng;
            }
          }
        } else {
          setUserAddress("Chưa thiết lập địa chỉ mặc định");
        }

        const branchRes = await branchService.getNearbyBranches(
          latitude,
          longitude,
          50,
        );

        if (branchRes.status === "success" && branchRes.data.length > 0) {
          setBranches(branchRes.data);

          if (!selectedBranch) {
            setSelectedBranch(branchRes.data[0]);
          }
        } else {
          setBranches([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi nhánh gần bạn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndBranches();
  }, [isAuthenticated, selectedBranch, setSelectedBranch]);

  const handleMouseEnter = () => {
    if (isAuthenticated) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMainButtonClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      setIsMobileOpen(true);
    }
  };

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsHovered(false);
    setIsMobileOpen(false);
  };

  const handleGoToAddressPage = () => {
    setIsHovered(false);
    setIsMobileOpen(false);
    router.push("/account/address");
  };

  return (
    <div
      className="relative py-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleMainButtonClick}
        className="flex items-center space-x-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors focus:outline-none w-full justify-start text-left cursor-pointer"
      >
        <MapPinIcon className="w-5 h-5 text-emerald-600 shrink-0" />

        <div className="flex flex-row md:flex-col items-center md:items-start space-x-1 md:space-x-0 truncate">
          {isAuthenticated ? (
            <>
              <span className="text-[11px] md:text-[10px] text-slate-400 shrink-0">
                Xem sản phẩm tại
              </span>
              <span className="font-bold text-slate-800 truncate text-xs md:text-sm max-w-32.5 md:max-w-37.5">
                {selectedBranch ? selectedBranch.name : "Đang tìm chi nhánh..."}
              </span>
            </>
          ) : (
            <span className="font-bold text-slate-800 text-xs md:text-sm hover:text-emerald-600 transition-colors">
              Chọn siêu thị
            </span>
          )}
        </div>

        {isAuthenticated && (
          <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500 shrink-0 md:hidden ml-auto" />
        )}
      </button>

      {isAuthenticated && isHovered && (
        <div className="hidden md:block absolute right-0 top-full w-96 pt-0.5 z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Khu vực giao hàng
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleGoToAddressPage}
                  className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span>Thay đổi</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed pl-1">
                {userAddress}
              </p>
            </div>

            <div className="pt-3">
              <p className="text-xs font-bold text-slate-700 mb-2.5">
                {loading
                  ? "Đang tìm chi nhánh..."
                  : `${branches.length} siêu thị gần bạn:`}
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedBranch?.id === branch.id
                        ? "border-blue-600 bg-blue-50/40"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">
                        {branch.name}
                      </h5>
                      <div className="flex items-center space-x-1 text-[11px] font-semibold text-blue-600">
                        <span>{branch.distanceKm?.toFixed(1)} km</span>
                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 mt-2">
                      <MapPinIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {branch.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Mobile */}
      {isAuthenticated && (
        <AnimatePresence>
          {isMobileOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsMobileOpen(false)}
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative bg-white rounded-t-3xl p-5 w-full max-h-[85vh] overflow-y-auto z-10 shadow-2xl flex flex-col"
              >
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 shrink-0" />

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  <h3 className="font-bold text-slate-800 text-base">
                    Chọn khu vực của bạn
                  </h3>
                  <div className="w-6" />
                </div>

                <div className="py-4 space-y-4 flex-1">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Địa chỉ:
                      </span>
                      <button
                        type="button"
                        onClick={handleGoToAddressPage}
                        className="flex items-center space-x-1 text-xs font-bold text-[#0d5c3a] cursor-pointer"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        <span>Thay đổi</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {userAddress}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-3">
                      {loading
                        ? "Đang tìm chi nhánh..."
                        : `${branches.length} siêu thị gần bạn:`}
                    </p>
                    <div className="space-y-3">
                      {branches.map((branch) => {
                        const isSelected = selectedBranch?.id === branch.id;
                        return (
                          <div
                            key={branch.id}
                            onClick={() => handleSelectBranch(branch)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#0d5c3a] bg-emerald-50/40 ring-1 ring-[#0d5c3a]"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-slate-800">
                                {branch.name}
                              </h5>
                              <span className="text-xs font-bold text-[#0d5c3a]">
                                {branch.distanceKm?.toFixed(1)} km
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                              {branch.address}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full py-3 bg-[#0d5c3a] text-white font-bold text-sm rounded-xl hover:bg-[#094229] transition active:scale-[0.98] cursor-pointer"
                  >
                    Mua sắm ngay
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
