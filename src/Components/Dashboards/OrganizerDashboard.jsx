"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import LogoutButton from "../Logout/LogoutButton";
import OrganizerAgreementsVault from "../Organizer/OrganizerAgreementsVault";
import OrganizerKycDocuments from "../Organizer/OrganizerKycDocuments";
import ProfileAndSecurityContent from "../common/ProfileAndSecurityContent";
import { Calendar, FileCheck, Sparkles, Building2, Ticket, ShieldCheck, Wallet, Lock, AlertTriangle, User, RotateCw } from "lucide-react";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import PayhereGate from "../common/PayhereGate";
import ThemeToggle from "../common/ThemeToggle";
import DashboardFooter from "../common/DashboardFooter";
import { toast } from "react-toastify";
import TwoStageMilestoneProgressCard from "../TheatreManager/TwoStageMilestoneProgressCard";

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTabState] = useState("agreements");
  const { payhereApprovedLive } = usePlatformConfig();
  const [isReloading, setIsReloading] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  // Sync activeTab with URL param ?tab= and localStorage so browser reload keeps the tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTabState(tabParam);
      } else {
        const savedTab = localStorage.getItem("nataka_organizer_tab");
        if (savedTab) {
          setActiveTabState(savedTab);
          const url = new URL(window.location.href);
          url.searchParams.set("tab", savedTab);
          window.history.replaceState({}, "", url.toString());
        }
      }

      const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        const t = p.get("tab") || "agreements";
        setActiveTabState(t);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("nataka_organizer_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleReload = () => {
    setIsReloading(true);
    toast.info("Refreshing organizer dashboard...", { autoClose: 900 });
    setContentKey((k) => k + 1);
    setTimeout(() => {
      setIsReloading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-[#0e0e18] border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 shadow-sm dark:shadow-xl backdrop-blur-md">
        <div className="w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#b33529] border border-[#FED800]/40 flex items-center justify-center shadow-lg shadow-[#661F19]/50">
                <Ticket className="w-5 h-5 text-[#FED800]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  eNataka<span className="text-[#FED800]">.lk</span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    Organizer Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Welcome back, <span className="text-slate-900 dark:text-white font-medium">{user?.fname || "Organizer"} {user?.lname || ""}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Reload / Refresh Button */}
              <button
                type="button"
                onClick={handleReload}
                disabled={isReloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold shadow-sm cursor-pointer"
                title="Reload current page & refresh data"
              >
                <RotateCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isReloading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Reload</span>
              </button>

              <ThemeToggle variant="icon" />

              <LogoutButton />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-white/5 pt-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("kyc")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                activeTab === "kyc"
                  ? "bg-white/5 text-[#FED800] border-[#FED800] shadow-sm"
                  : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#FED800]" />
              <span>KYC & Verification Documents</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                REQUIRED
              </span>
            </button>

            <button
              onClick={() => setActiveTab("agreements")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                activeTab === "agreements"
                  ? "bg-white/5 text-[#FED800] border-[#FED800] shadow-sm"
                  : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Settlement Agreement & Vault</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LEGAL
              </span>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                activeTab === "events"
                  ? "bg-white/5 text-[#FED800] border-[#FED800] shadow-sm"
                  : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Event Organization</span>
            </button>

            {/* Payouts Tab (Conditionally badged / gated) */}
            <button
              onClick={() => setActiveTab("payouts")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                activeTab === "payouts"
                  ? "bg-white/5 text-[#FED800] border-[#FED800] shadow-sm"
                  : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Revenue Payouts</span>
              {!payhereApprovedLive ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
                  REVIEW MODE
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              )}
            </button>

            {/* Profile & Security Tab */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                activeTab === "profile"
                  ? "bg-white/5 text-[#FED800] border-[#FED800] shadow-sm"
                  : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Profile & Security</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                2FA
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto py-6 px-4 sm:px-6 lg:px-8" key={contentKey}>
        {activeTab === "kyc" ? (
          <OrganizerKycDocuments onNavigateToAgreements={() => setActiveTab("agreements")} />
        ) : activeTab === "agreements" ? (
          <OrganizerAgreementsVault onNavigateToKyc={() => setActiveTab("kyc")} />
        ) : activeTab === "profile" ? (
          <ProfileAndSecurityContent embedded={true} />
        ) : activeTab === "payouts" ? (
          <TwoStageMilestoneProgressCard
            userId={user?.id}
            onNavigateToKyc={() => setActiveTab("kyc")}
          />
        ) : (
          <div className="bg-[#12121c] border border-white/10 shadow-xl rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FED800]">
                Productions & Shows
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">Event Organization & Scheduling</h2>
              <p className="text-xs text-slate-400 mt-1">
                Create new drama productions, schedule showtimes, and configure ticket allocations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-6 bg-[#161622] border border-white/10 rounded-2xl hover:border-[#FED800]/50 hover:bg-[#1a1a28] transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#FED800] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Create New Drama / Event</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Register new stage plays, musical productions, or cultural festivals.
                </p>
              </button>

              <button className="p-6 bg-[#161622] border border-white/10 rounded-2xl hover:border-[#FED800]/50 hover:bg-[#1a1a28] transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Manage Active Shows</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Edit performance schedules, seat reservations, and view attendee ticket sales.
                </p>
              </button>
            </div>
          </div>
        )}
      </main>
      <DashboardFooter />
    </div>
  );
};

export default OrganizerDashboard;
