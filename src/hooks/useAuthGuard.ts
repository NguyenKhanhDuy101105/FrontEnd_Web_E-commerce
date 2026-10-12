"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/src/services/customer/authService";

interface UseAuthGuardOptions {
  redirectToIfAuthenticated?: string;
}

const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

export function useAuthGuard(options?: UseAuthGuardOptions) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(!isAuthRoute);

  useEffect(() => {
    if (isAuthRoute) return;

    const checkAuthStatus = async () => {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        handleUnauthenticated();
        return;
      }

      try {
        const res = await authService.getMe();

        if (res?.data) {
          localStorage.setItem("user", JSON.stringify(res.data));
          setIsAuthenticated(true);

          if (options?.redirectToIfAuthenticated) {
            router.replace(options.redirectToIfAuthenticated);
          } else {
            setIsChecking(false);
          }
        } else {
          handleUnauthenticated();
        }
      } catch (error) {
        console.error("Token không hợp lệ hoặc đã hết hạn:", error);
        handleUnauthenticated();
      }
    };

    const handleUnauthenticated = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setIsAuthenticated(false);
      setIsChecking(false);

      if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      }
    };

    checkAuthStatus();
  }, [router, pathname, isAuthRoute, options?.redirectToIfAuthenticated]);

  return { isAuthenticated, isChecking };
}
