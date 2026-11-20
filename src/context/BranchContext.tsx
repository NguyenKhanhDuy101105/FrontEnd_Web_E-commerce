"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { branchService, Branch } from "@/src/services/customer/branchService";

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
  branchId: string | null;
  refreshNearestBranch: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType>({
  selectedBranch: null,
  setSelectedBranch: () => {},
  branchId: null,
  refreshNearestBranch: async () => {},
});

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(
    null,
  );

  const autoSelectNearestBranch = useCallback(async () => {
    try {
      const res = await branchService.getNearbyBranches();
      const branchList = res?.data || [];

      if (branchList.length > 0) {
        const nearest = branchList[0];
        setSelectedBranchState(nearest);
        localStorage.setItem("selectedBranch", JSON.stringify(nearest));
        localStorage.setItem("selectedBranchId", nearest.id);
      }
    } catch (error) {
      console.error("Lỗi tự động chọn chi nhánh gần nhất:", error);
    }
  }, []);

  useEffect(() => {
    const initBranch = async () => {
      const savedBranch = localStorage.getItem("selectedBranch");

      if (savedBranch) {
        try {
          const parsed: Branch = JSON.parse(savedBranch);
          setSelectedBranchState(parsed);
          if (parsed?.id) {
            localStorage.setItem("selectedBranchId", parsed.id);
          }
          return;
        } catch (e) {
          console.error("Lỗi parse branch từ localStorage:", e);
        }
      }

      await autoSelectNearestBranch();
    };

    initBranch();
  }, [autoSelectNearestBranch]);

  const setSelectedBranch = (branch: Branch) => {
    setSelectedBranchState(branch);
    localStorage.setItem("selectedBranch", JSON.stringify(branch));
    localStorage.setItem("selectedBranchId", branch.id);
  };

  return (
    <BranchContext.Provider
      value={{
        selectedBranch,
        setSelectedBranch,
        branchId: selectedBranch?.id || null,
        refreshNearestBranch: autoSelectNearestBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
