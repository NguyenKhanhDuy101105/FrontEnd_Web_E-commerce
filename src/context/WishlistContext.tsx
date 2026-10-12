"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { wishlistService } from "@/src/services/customer/wishlistService";
import { showToast } from "@/src/utils/toast";

interface WishlistContextType {
  wishlistIds: Set<string>;
  isWishlisted: (productId: string) => boolean;
  addWishlistId: (productId: string) => void;
  removeWishlistId: (productId: string) => void;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  isWishlisted: () => false,
  addWishlistId: () => {},
  removeWishlistId: () => {},
  refreshWishlist: async () => {},
  toggleWishlist: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const refreshWishlist = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    if (!token) {
      setWishlistIds(new Set());
      return;
    }

    try {
      const res = await wishlistService.getWishlist();
      if (
        (res.status === "success" || res.status === "200" || res.data) &&
        Array.isArray(res.data)
      ) {
        const ids = new Set<string>();
        res.data.forEach((item: any) => {
          const id = item.productId || item.product?.id || item.id;
          if (id) ids.add(String(id));
        });
        setWishlistIds(ids);
      }
    } catch (error) {
      console.error("Lỗi khi đồng bộ Wishlist Context:", error);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = (productId: string) =>
    wishlistIds.has(String(productId));

  const addWishlistId = (productId: string) => {
    setWishlistIds((prev) => new Set(prev).add(String(productId)));
  };

  const removeWishlistId = (productId: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(String(productId));
      return next;
    });
  };

  const toggleWishlist = async (productId: string) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      showToast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
      return;
    }

    const idStr = String(productId);
    const exists = wishlistIds.has(idStr);

    if (exists) {
      removeWishlistId(idStr);
    } else {
      addWishlistId(idStr);
    }

    try {
      if (exists) {
        await wishlistService.removeFromWishlist(idStr);
        showToast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await wishlistService.addToWishlist(idStr);
        showToast.success("Đã thêm vào danh sách yêu thích!");
      }
    } catch (error) {
      refreshWishlist();
      showToast.error("Thao tác thất bại, vui lòng thử lại!");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isWishlisted,
        addWishlistId,
        removeWishlistId,
        refreshWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
