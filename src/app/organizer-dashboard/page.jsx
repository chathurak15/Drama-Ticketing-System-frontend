"use client";

import React, { Suspense } from "react";
import OrganizerDashboard from "../../Components/Dashboards/OrganizerDashboard";
import ProtectedRoute from "../../Components/protect/ProtectedRoute";

export default function OrganizerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <Suspense fallback={<div className="min-h-screen bg-slate-100 dark:bg-[#0a0a10]" />}>
        <OrganizerDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
