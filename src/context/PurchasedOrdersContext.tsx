"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import orderService from "@/src/services/customer/orderService";

interface PurchasedItemMap {
  [productId: string]: string;
}

interface PurchasedOrdersContextType {
  purchasedProductMap: PurchasedItemMap;
  loading: boolean;
  hasPurchasedProduct: (productId: string) => boolean;
  getOrderIdForProduct: (productId: string) => string | undefined;
  ensurePurchasedOrdersLoaded: () => Promise<void>;
  refreshPurchasedOrders: () => Promise<void>;
}

const PurchasedOrdersContext = createContext<
  PurchasedOrdersContextType | undefined
>(undefined);

const ROUTES_REQUIRING_PURCHASED_ORDERS = ["/products/", "/account/orders"];

export function PurchasedOrdersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [purchasedProductMap, setPurchasedProductMap] =
    useState<PurchasedItemMap>({});
  const [loading, setLoading] = useState<boolean>(false);

  const hasFetchedRef = useRef<boolean>(false);
  const inFlightRef = useRef<Promise<void> | null>(null);

  const fetchPurchasedOrders = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

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

    const task = (async () => {
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
          hasFetchedRef.current = true;
        } else {
          setPurchasedProductMap({});
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đơn hàng đã mua:", error);
        setPurchasedProductMap({});
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = task;
    return task;
  }, []);

  const ensurePurchasedOrdersLoaded = useCallback(async () => {
    if (hasFetchedRef.current) return;
    await fetchPurchasedOrders();
  }, [fetchPurchasedOrders]);

  useEffect(() => {
    const shouldFetch = ROUTES_REQUIRING_PURCHASED_ORDERS.some((prefix) =>
      pathname?.startsWith(prefix),
    );
    if (shouldFetch && !hasFetchedRef.current) {
      fetchPurchasedOrders();
    }
  }, [pathname, fetchPurchasedOrders]);

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
        ensurePurchasedOrdersLoaded,
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
