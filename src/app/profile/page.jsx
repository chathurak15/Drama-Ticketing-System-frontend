"use client";

import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import ProfileAndSecurityContent from "../../Components/common/ProfileAndSecurityContent";
import ProtectedRoute from "../../Components/protect/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-white transition-colors">
        <ModernHeader />
        <main className="flex-1 py-10">
          <ProfileAndSecurityContent embedded={false} />
        </main>
        <ModernFooter />
      </div>
    </ProtectedRoute>
  );
}
