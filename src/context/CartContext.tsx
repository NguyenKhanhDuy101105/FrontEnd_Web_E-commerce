"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useBranch } from "@/src/context/BranchContext";
import { cartService, CartItem } from "@/src/services/customer/cartService";
import { showToast } from "@/src/utils/toast";

export type { CartItem };

interface UpdateQuantityOptions {
  silent?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isLoading: boolean;
  getItemQuantity: (productId: string) => number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (
    productId: string,
    newQuantity: number,
    options?: UpdateQuantityOptions,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string): string => {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  );
};

const preserveItemOrder = (
  prevItems: CartItem[],
  nextItems: CartItem[],
): CartItem[] => {
  if (prevItems.length === 0) return nextItems;

  const orderMap = new Map<string, number>();
  prevItems.forEach((item, index) => {
    orderMap.set(item.itemId || item.productId, index);
  });

  return [...nextItems].sort((a, b) => {
    const keyA = a.itemId || a.productId;
    const keyB = b.itemId || b.productId;
    const indexA = orderMap.has(keyA)
      ? orderMap.get(keyA)!
      : Number.MAX_SAFE_INTEGER;
    const indexB = orderMap.has(keyB)
      ? orderMap.get(keyB)!
      : Number.MAX_SAFE_INTEGER;
    return indexA - indexB;
  });
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { branchId } = useBranch();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = useCallback(async (): Promise<CartItem[]> => {
    if (typeof window === "undefined") return [];

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      setCartItems([]);
      setTotalQuantity(0);
      setTotalAmount(0);
      return [];
    }

    try {
      setIsLoading(true);
      const res = await cartService.getCart();
      if (res?.data) {
        const rawItems = res.data.items || [];
        setCartItems((prev) => preserveItemOrder(prev, rawItems));
        setTotalQuantity(res.data.totalQuantity || 0);
        setTotalAmount(res.data.totalAmount || 0);
        return rawItems;
      } else {
        setCartItems([]);
        setTotalQuantity(0);
        setTotalAmount(0);
        return [];
      }
    } catch (error) {
      console.error("Lỗi tải thông tin giỏ hàng:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, branchId]);

  const getItemQuantity = (productId: string): number => {
    const item = cartItems.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null;

    if (!token) {
      showToast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    if (!branchId) {
      showToast.error("Vui lòng chọn chi nhánh gần bạn!");
      return;
    }

    try {
      const res = await cartService.addToCart({
        branchId,
        productId,
        quantity,
      });

      if (res?.data) {
        const rawItems = res.data.items || [];
        setCartItems((prev) => preserveItemOrder(prev, rawItems));
        setTotalQuantity(res.data.totalQuantity || 0);
        setTotalAmount(res.data.totalAmount || 0);
      } else {
        await fetchCart();
      }

      showToast.success("Đã thêm vào giỏ hàng!");
    } catch (error: unknown) {
      console.error("Lỗi thêm giỏ hàng:", error);
      showToast.error(
        getErrorMessage(error, "Không thể thêm sản phẩm vào giỏ!"),
      );
    }
  };

  const updateQuantity = async (
    productId: string,
    newQuantity: number,
    options?: UpdateQuantityOptions,
  ) => {
    const targetItem = cartItems.find((i) => i.productId === productId);
    if (!targetItem) return;

    if (newQuantity > 0 && !branchId) {
      if (!options?.silent) {
        showToast.error("Vui lòng chọn chi nhánh gần bạn!");
      }
      return;
    }

    const previousCartItems = [...cartItems];

    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      );
    });

    try {
      if (newQuantity <= 0) {
        if (targetItem.itemId) {
          await cartService.removeCartItem(targetItem.itemId);
          if (!options?.silent) {
            showToast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
          }
        }
      } else if (targetItem.itemId) {
        const res = await cartService.updateCartItem(targetItem.itemId, {
          quantity: newQuantity,
          branchId: branchId!,
        });
        if (res?.data) {
          const rawItems = res.data.items || [];
          setCartItems((prev) => preserveItemOrder(prev, rawItems));
          setTotalQuantity(res.data.totalQuantity || 0);
          setTotalAmount(res.data.totalAmount || 0);
          return;
        }
      } else {
        await cartService.addToCart({
          branchId: branchId!,
          productId,
          quantity: newQuantity,
        });
      }

      await fetchCart();
    } catch (error: unknown) {
      setCartItems(previousCartItems);
      if (!options?.silent) {
        console.error("Lỗi cập nhật số lượng giỏ hàng:", error);
        showToast.error(getErrorMessage(error, "Không thể cập nhật số lượng!"));
      }
      throw error;
    }
  };

  const clearCart = async () => {
    const previousItems = [...cartItems];
    const previousQty = totalQuantity;
    const previousAmount = totalAmount;

    setCartItems([]);
    setTotalQuantity(0);
    setTotalAmount(0);

    try {
      await cartService.clearCart();
      showToast.success("Đã xóa toàn bộ sản phẩm trong giỏ hàng!");
    } catch (error: unknown) {
      console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
      setCartItems(previousItems);
      setTotalQuantity(previousQty);
      setTotalAmount(previousAmount);
      showToast.error(
        getErrorMessage(
          error,
          "Có lỗi xảy ra khi xóa giỏ hàng. Vui lòng thử lại!",
        ),
      );
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalQuantity,
        totalAmount,
        isLoading,
        getItemQuantity,
        addToCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
