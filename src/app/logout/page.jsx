"use client";

import React from "react";
import Logout from "../../Components/Logout/Logout";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";

export default function LogoutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a10] text-slate-100 flex flex-col justify-between font-sans">
      <ModernHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Logout />
      </main>
      <ModernFooter />
    </div>
  );
}
