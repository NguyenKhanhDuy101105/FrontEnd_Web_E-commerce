"use client";

import DashboardHeader from "./components/DashboardHeader";
import StatCards from "./components/StatCards";
import RevenueChart from "./components/RevenueChart";
import SalesChannelBreakdown from "./components/SalesChannelBreakdown";
import CategoryRevenue from "./components/CategoryRevenue";
import TopBranches from "./components/TopBranches";
import TopSellingProductsTable from "./components/TopSellingProductsTable";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      <DashboardHeader />

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <SalesChannelBreakdown />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryRevenue />
        <TopBranches />
      </div>

      <TopSellingProductsTable />
    </div>
  );
}
