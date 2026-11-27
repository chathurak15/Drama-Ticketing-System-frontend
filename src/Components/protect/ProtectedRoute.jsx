"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const getDashboardRoute = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "/admin-dashboard";
      case "theatre manager":
      case "theatre_manager":
      case "theatremanager":
        return "/theatre-manager-dashboard";
      case "organizer":
        return "/organizer-dashboard";
      case "customer":
        return "/user-dashboard";
      default:
        return "/user-dashboard";
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (allowedRoles.length > 0) {
        const userRole = user.role?.toLowerCase();
        const hasPermission = allowedRoles.some(
          (role) => role.toLowerCase() === userRole
        );

        if (!hasPermission) {
          router.replace(getDashboardRoute(userRole));
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center" suppressHydrationWarning>
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" suppressHydrationWarning></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );
    if (!hasPermission) {
      return null;
    }
  }

  return <div suppressHydrationWarning>{children}</div>;
}
