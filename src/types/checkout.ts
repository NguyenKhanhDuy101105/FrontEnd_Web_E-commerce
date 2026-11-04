import { Address } from "@/src/app/(customer)/checkout/components/shipping/AddressSelector";
import { BranchNearby } from "@/src/app/(customer)/checkout/components/shipping/BranchAndNoteSelector";
import { CartItem } from "@/src/app/(customer)/checkout/components/order-summary/OrderSummarySection";
import { OtherRecipientData } from "@/src/app/(customer)/checkout/components/shipping/OtherRecipientForm";

export interface BranchResponseItem {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface CartItemResponse {
  itemId?: string;
  id?: string;
  productId?: string;
  subtotal?: number;
  unitPrice?: number;
  price?: number;
  basePrice?: number;
  quantity?: number;
}

export interface OrderPayload {
  clientRequestId: string;
  branchId: string;
  deliveryType: "DELIVERY" | "PICKUP";
  promotionCode: string | null;
  note: string;
  addressId?: string | null;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string | null;
  shippingLat?: number | null;
  shippingLng?: number | null;
  receiveFrom?: string | null;
  receiveTo?: string | null;
}
