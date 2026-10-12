"use client";

import React from "react";
import OrderTrackingWidget from "./(components)/OrderTrackingWidget";
import PersonalInfoForm from "./(components)/PersonalInfoForm";
import AddressAndWishlistSidebar from "./(components)/AddressAndWishlistSidebar";

export default function AccountOverviewPage() {
  return (
    <div className="space-y-6">
      <OrderTrackingWidget />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <PersonalInfoForm />
        </div>

        <div className="lg:col-span-5">
          <AddressAndWishlistSidebar />
        </div>
      </div>
    </div>
  );
}
