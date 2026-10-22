"use client";

import React, { useState, useEffect } from "react";
import axiosClient from "@/src/lib/axiosClient";
import OrderTrackingWidget, {
  OrderCounts,
} from "./(components)/OrderTrackingWidget";
import PersonalInfoForm from "./(components)/PersonalInfoForm";
import AddressAndWishlistSidebar from "./(components)/AddressAndWishlistSidebar";

interface OrderItem {
  id: string;
  status: string;
}

export default function AccountOverviewPage() {
  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    pending: 0,
    packing: 0,
    shipping: 0,
    completed: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrderCounts = async () => {
      setLoadingOrders(true);
      try {
        const response = await axiosClient.get("/api/orders", {
          params: { page: 0, size: 100 },
        });

        const rawData = response.data?.data;
        const orders: OrderItem[] =
          rawData?.content || (Array.isArray(rawData) ? rawData : []);

        const counts: OrderCounts = {
          pending: 0,
          packing: 0,
          shipping: 0,
          completed: 0,
        };

        orders.forEach((order) => {
          const status = order.status?.toUpperCase() || "";

          if (status === "PENDING") {
            counts.pending += 1;
          } else if (status === "PROCESSING" || status === "WAITING") {
            counts.packing += 1;
          } else if (status === "SHIPPING" || status === "DELIVERING") {
            counts.shipping += 1;
          } else if (status === "COMPLETED") {
            counts.completed += 1;
          }
        });

        setOrderCounts(counts);
      } catch (error) {
        console.error("Lỗi khi tải số lượng đơn hàng:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrderCounts();
  }, []);

  return (
    <div className="space-y-6">
      <OrderTrackingWidget orderCounts={orderCounts} loading={loadingOrders} />

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
