"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/src/services/customer/authService";

interface UseAuthGuardOptions {
  redirectToIfAuthenticated?: string;
  allowedRoles?: Array<"CUSTOMER" | "BRANCH" | "ADMIN">;
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
        const user = res?.data;

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));

          const branchIdFromUser = (user as any)?.branchId;
          if (branchIdFromUser) {
            localStorage.setItem("branchId", branchIdFromUser);
          }

          setIsAuthenticated(true);

          const userRole = user.role; // "CUSTOMER" | "BRANCH" | "ADMIN"

          if (
            userRole === "BRANCH" &&
            (pathname === "/" ||
              pathname.startsWith("/customer") ||
              pathname.startsWith("/checkout"))
          ) {
            router.replace("/store/orders");
            return;
          }

          if (
            userRole === "ADMIN" &&
            (pathname === "/" || pathname.startsWith("/customer"))
          ) {
            router.replace("/admin/dashboard");
            return;
          }

          if (
            options?.allowedRoles &&
            !options.allowedRoles.includes(userRole as any)
          ) {
            if (userRole === "BRANCH") router.replace("/store/orders");
            else if (userRole === "ADMIN") router.replace("/admin/dashboard");
            else router.replace("/");
            return;
          }

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
      localStorage.removeItem("branchId");

      setIsAuthenticated(false);
      setIsChecking(false);

      if (
        pathname.startsWith("/account") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/store") ||
        pathname.startsWith("/admin")
      ) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      }
    };

    checkAuthStatus();
  }, [
    router,
    pathname,
    isAuthRoute,
    options?.redirectToIfAuthenticated,
    options?.allowedRoles,
  ]);

  return { isAuthenticated, isChecking };
}
