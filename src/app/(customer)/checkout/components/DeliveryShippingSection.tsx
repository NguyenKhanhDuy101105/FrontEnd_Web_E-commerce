"use client";

import React, { useState } from "react";
import AddressSelector, { Address } from "./shipping/AddressSelector";
import DeliveryTimeSelector from "./shipping/DeliveryTimeSelector";
import BranchAndNoteSelector, {
  BranchNearby,
} from "./shipping/BranchAndNoteSelector";

interface DeliveryShippingSectionProps {
  addresses: Address[];
  branches: BranchNearby[];
  loadingAddress?: boolean;
  loadingBranch?: boolean;
  onAddNewAddress?: () => void;
  onSelectAddressCallback?: (address: Address | null) => void;
  onSelectBranchCallback?: (branch: BranchNearby | null) => void;
}

export default function DeliveryShippingSection({
  addresses,
  branches,
  loadingAddress = false,
  loadingBranch = false,
  onAddNewAddress,
  onSelectAddressCallback,
  onSelectBranchCallback,
}: DeliveryShippingSectionProps) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10-12");
  const [selectedBranch, setSelectedBranch] = useState<BranchNearby | null>(
    null,
  );
  const [note, setNote] = useState<string>("");

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddress(addr);
    if (onSelectAddressCallback) {
      onSelectAddressCallback(addr);
    }
  };

  const handleSelectBranch = (branch: BranchNearby) => {
    setSelectedBranch(branch);
    if (onSelectBranchCallback) {
      onSelectBranchCallback(branch);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-4 pt-3">
        <button
          type="button"
          className="pb-2.5 px-1 border-b-2 border-emerald-600 font-bold text-xs text-emerald-600 cursor-pointer"
        >
          Nhận hàng tại nhà
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        <AddressSelector
          addresses={addresses}
          loading={loadingAddress}
          selectedAddressId={selectedAddress?.id || ""}
          onSelectAddress={handleSelectAddress}
          onAddNewAddress={onAddNewAddress}
        />

        <DeliveryTimeSelector
          deliveryDate={deliveryDate}
          selectedTimeSlot={selectedTimeSlot}
          onChangeDate={setDeliveryDate}
          onChangeTimeSlot={setSelectedTimeSlot}
        />

        <BranchAndNoteSelector
          branches={branches}
          loading={loadingBranch}
          selectedBranchId={selectedBranch?.id || ""}
          note={note}
          onSelectBranch={handleSelectBranch}
          onChangeNote={setNote}
        />
      </div>
    </div>
  );
}
