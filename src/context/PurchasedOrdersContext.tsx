"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import orderService from "@/src/services/customer/orderService";

interface PurchasedItemMap {
  [productId: string]: string;
}

interface PurchasedOrdersContextType {
  purchasedProductMap: PurchasedItemMap;
  loading: boolean;
  hasPurchasedProduct: (productId: string) => boolean;
  getOrderIdForProduct: (productId: string) => string | undefined;
  refreshPurchasedOrders: () => Promise<void>;
}

const PurchasedOrdersContext = createContext<
  PurchasedOrdersContextType | undefined
>(undefined);

export function PurchasedOrdersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [purchasedProductMap, setPurchasedProductMap] =
    useState<PurchasedItemMap>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPurchasedOrders = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    let isCustomer = false;
    if (token && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        const userRole = userObj?.role || userObj?.roles?.[0] || "";
        if (
          userRole === "CUSTOMER" ||
          userRole === "ROLE_CUSTOMER" ||
          (!userRole.includes("ADMIN") && !userRole.includes("BRANCH"))
        ) {
          isCustomer = true;
        }
      } catch (e) {
        console.error("Lỗi khi parse thông tin user từ localStorage:", e);
      }
    }

    if (!token || !isCustomer) {
      setPurchasedProductMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await orderService.getOrders({
        page: 0,
        size: 100,
        group: "COMPLETED",
      });

      if (res.status === "success" && res.data?.content) {
        const completedOrders = res.data.content;
        const productMap: PurchasedItemMap = {};

        const orderDetails = await Promise.all(
          completedOrders.map((order) =>
            orderService
              .getOrderById(order.id)
              .then((d) => (d.status === "success" ? d.data : null))
              .catch(() => null),
          ),
        );

        orderDetails.forEach((orderDetail) => {
          if (orderDetail && orderDetail.items) {
            orderDetail.items.forEach((item) => {
              if (item.productId && !productMap[item.productId]) {
                productMap[item.productId] = orderDetail.id;
              }
            });
          }
        });

        setPurchasedProductMap(productMap);
      } else {
        setPurchasedProductMap({});
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng đã mua:", error);
      setPurchasedProductMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchasedOrders();
  }, [fetchPurchasedOrders]);

  const hasPurchasedProduct = (productId: string): boolean => {
    return Boolean(purchasedProductMap[productId]);
  };

  const getOrderIdForProduct = (productId: string): string | undefined => {
    return purchasedProductMap[productId];
  };

  return (
    <PurchasedOrdersContext.Provider
      value={{
        purchasedProductMap,
        loading,
        hasPurchasedProduct,
        getOrderIdForProduct,
        refreshPurchasedOrders: fetchPurchasedOrders,
      }}
    >
      {children}
    </PurchasedOrdersContext.Provider>
  );
}

export function usePurchasedOrders() {
  const context = useContext(PurchasedOrdersContext);
  if (!context) {
    throw new Error(
      "usePurchasedOrders must be used within a PurchasedOrdersProvider",
    );
  }
  return context;
}
