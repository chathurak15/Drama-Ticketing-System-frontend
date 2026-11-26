"use client";

import React, { Suspense } from "react";
import TheaterManagerDashboard from "../../Components/Dashboards/TheatreManagerDashboard";
import ProtectedRoute from "../../components/protect/ProtectedRoute";

export default function TheatreManagerDashboardPage() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "theatre manager",
        "theatre_manager",
        "theatremanager",
      ]}
    >
      <Suspense fallback={<div className="min-h-screen bg-slate-100 dark:bg-[#0a0a10]" />}>
        <TheaterManagerDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
