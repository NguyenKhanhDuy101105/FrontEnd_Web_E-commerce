"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useBranch } from "@/src/context/BranchContext";
import { cartService } from "@/src/services/customer/cartService";
import { showToast } from "@/src/utils/toast";

export interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  discountPercent: number;
  discountStartsAt?: string;
  discountEndsAt?: string;
  subtotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isLoading: boolean;
  getItemQuantity: (productId: string) => number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { branchId } = useBranch();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = useCallback(async () => {
    if (!branchId) {
      setCartItems([]);
      setTotalQuantity(0);
      setTotalAmount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await cartService.getCart(branchId);
      if (res?.data) {
        setCartItems(res.data.items || []);
        setTotalQuantity(res.data.totalQuantity || 0);
        setTotalAmount(res.data.totalAmount || 0);
      } else {
        setCartItems([]);
        setTotalQuantity(0);
        setTotalAmount(0);
      }
    } catch (error) {
      console.error("Lỗi tải thông tin giỏ hàng:", error);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    let isMounted = true;

    const loadCartData = async () => {
      if (!branchId) {
        if (isMounted) {
          setCartItems([]);
          setTotalQuantity(0);
          setTotalAmount(0);
        }
        return;
      }

      try {
        setIsLoading(true);
        const res = await cartService.getCart(branchId);
        if (isMounted && res?.data) {
          setCartItems(res.data.items || []);
          setTotalQuantity(res.data.totalQuantity || 0);
          setTotalAmount(res.data.totalAmount || 0);
        }
      } catch (error) {
        console.error("Lỗi khi đồng bộ giỏ hàng:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCartData();

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  const getItemQuantity = (productId: string): number => {
    const item = cartItems.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
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
        setCartItems(res.data.items || []);
        setTotalQuantity(res.data.totalQuantity || 0);
        setTotalAmount(res.data.totalAmount || 0);
      } else {
        await fetchCart();
      }

      showToast.success("Đã thêm vào giỏ hàng!");
    } catch (error: any) {
      console.error("Lỗi thêm giỏ hàng:", error);
      const errMsg =
        error?.response?.data?.message || "Không thể thêm sản phẩm vào giỏ!";
      showToast.error(errMsg);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!branchId) return;

    const targetItem = cartItems.find((i) => i.productId === productId);
    if (!targetItem) return;

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
          showToast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        }
      } else {
        if (targetItem.itemId) {
          await cartService.updateCartItem(targetItem.itemId, {
            quantity: newQuantity,
          });
        } else {
          await cartService.addToCart({
            branchId,
            productId,
            quantity: newQuantity,
          });
        }
      }

      await fetchCart();
    } catch (error: any) {
      console.error("Lỗi cập nhật số lượng giỏ hàng:", error);

      setCartItems(previousCartItems);
      const errMsg =
        error?.response?.data?.message || "Không thể cập nhật số lượng!";
      showToast.error(errMsg);
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
