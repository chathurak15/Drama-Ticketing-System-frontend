"use client";

import React, { Suspense } from "react";
import AdminDashboard from "../../Components/Dashboards/AdminDashboard";
import ProtectedRoute from "../../components/protect/ProtectedRoute";

export default function AdminDashboardPage() {
  return (
    <div suppressHydrationWarning>
      <ProtectedRoute allowedRoles={["admin"]}>
        <Suspense fallback={<div className="min-h-screen bg-slate-100 dark:bg-[#0a0a10]" />}>
          <AdminDashboard />
        </Suspense>
      </ProtectedRoute>
    </div>
  );
}
