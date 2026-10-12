"use client";

import React from "react";
import DefaultAddressWidget, { AddressData } from "./DefaultAddressWidget";
import WishlistWidget, { WishlistItem } from "./WishlistWidget";

interface AddressAndWishlistSidebarProps {
  address?: AddressData;
  wishlistItems?: WishlistItem[];
  isLoadingAddress?: boolean;
  isLoadingWishlist?: boolean;
}

export default function AddressAndWishlistSidebar({
  address,
  wishlistItems,
  isLoadingAddress = false,
  isLoadingWishlist = false,
}: AddressAndWishlistSidebarProps) {
  return (
    <div className="space-y-5">
      <DefaultAddressWidget address={address} isLoading={isLoadingAddress} />

      <WishlistWidget
        wishlistItems={wishlistItems}
        isLoading={isLoadingWishlist}
      />
    </div>
  );
}
