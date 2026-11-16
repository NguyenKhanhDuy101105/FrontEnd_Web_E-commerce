"use client";

import { useState, useEffect } from "react";
import HomeSlider from "../../components/ui/HomeSlider";
import Banner from "../../components/ui/Banner";
import CategoryList from "../../components/common/CategoryList";
import PromotionalProducts from "../../components/home/PromotionalProducts";
import DailyFreshProducts from "../../components/home/DailyFreshProducts";
import CategoryShowcase from "../../components/common/CategoryShowcase";
import SpicesPartyProducts from "../../components/home/SpicesPartyProducts";
import BestSellingProducts from "../../components/home/BestSellingProducts";
import VoucherShowcase from "../../components/home/VoucherShowcase";
import LazyLoadSection from "../../components/common/LazyLoadSection";
import RecipesSection from "../../components/home/RecipesSection";

export default function Home() {
  const [currentBranchId, setCurrentBranchId] = useState<string>("");

  useEffect(() => {
    const storedBranch = localStorage.getItem("selectedBranch");
    if (storedBranch) {
      try {
        const parsedBranch = JSON.parse(storedBranch);
        if (parsedBranch?.id) {
          setCurrentBranchId(parsedBranch.id);
        }
      } catch (e) {
        console.error("Lỗi khi đọc selectedBranch từ localStorage:", e);
      }
    }
  }, []);

  return (
    <>
      <div className="pb-24 lg:pb-12 space-y-6">
        <HomeSlider />
        <Banner />
        <CategoryList />

        <LazyLoadSection height="400px">
          <PromotionalProducts />
        </LazyLoadSection>

        <LazyLoadSection height="400px">
          <DailyFreshProducts />
        </LazyLoadSection>

        <LazyLoadSection height="350px">
          <CategoryShowcase />
        </LazyLoadSection>

        <LazyLoadSection height="400px">
          <SpicesPartyProducts />
        </LazyLoadSection>

        <LazyLoadSection height="300px">
          <VoucherShowcase />
        </LazyLoadSection>

        <LazyLoadSection height="450px">
          <BestSellingProducts />
        </LazyLoadSection>

        <LazyLoadSection height="450px">
          <RecipesSection branchId={currentBranchId} />
        </LazyLoadSection>
      </div>
    </>
  );
}
