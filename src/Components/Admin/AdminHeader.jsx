"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  User as UserIcon,
  RotateCw,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "../../utils/useNavigateCompat";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import ThemeToggle from "../common/ThemeToggle";
import LogoutButton from "../Logout/LogoutButton";
import { toast } from "react-toastify";

const AdminHeader = ({ activeTab, onReload }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    payhereApprovedLive,
    payhereReviewMode,
    disablePublicSignupDuringReview,
    loading: configLoading,
    setPayhereLiveMode,
    setDisablePublicSignup,
  } = usePlatformConfig();

  const [updatingReviewMode, setUpdatingReviewMode] = useState(false);
  const [updatingSignupMode, setUpdatingSignupMode] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = () => {
    setIsReloading(true);
    toast.info("Refreshing dashboard data...", { autoClose: 900 });
    if (onReload) {
      onReload();
      setTimeout(() => setIsReloading(false), 600);
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 250);
    }
  };

  const handleToggleReviewMode = async () => {
    if (updatingReviewMode) return;
    setUpdatingReviewMode(true);
    try {
      // If review mode is currently true, toggle to live (true)
      await setPayhereLiveMode(!payhereApprovedLive);
    } catch (e) {
      // toast handled in hook
    } finally {
      setUpdatingReviewMode(false);
    }
  };

  const handleToggleSignupLock = async () => {
    if (updatingSignupMode) return;
    setUpdatingSignupMode(true);
    try {
      await setDisablePublicSignup(!disablePublicSignupDuringReview);
    } catch (e) {
      // toast handled in hook
    } finally {
      setUpdatingSignupMode(false);
    }
  };

  return (
    <header className="bg-white/95 dark:bg-[#101018]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
      {/* Title & Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="md:hidden flex items-center shrink-0 pr-1" title="Back to Nataka Home">
          <img src="/logo-nataka.png" alt="Nataka" className="h-6 w-auto block dark:hidden" />
          <img src="/logo-nataka-white.png" alt="Nataka" className="h-6 w-auto hidden dark:block" />
        </Link>
        <div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wider flex items-center gap-2">
            <span>NATAKA MASTER CONSOLE</span>
            <span className="hidden sm:inline-block text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              v2.4.2
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Super Administrator Portal</span>
            {activeTab && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-amber-700 dark:text-amber-400 capitalize">
                {activeTab}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* CONTROL: Current Page Reload / Refresh Button */}
        <button
          type="button"
          onClick={handleReload}
          disabled={isReloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold shadow-sm cursor-pointer"
          title="Reload current page & refresh dashboard data"
        >
          <RotateCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isReloading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Reload</span>
        </button>

        {/* CONTROL 1: PayHere Review Mode / Live Switch */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs font-semibold shadow-sm bg-slate-100 dark:bg-black/40 border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            {payhereApprovedLive ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            )}
            <span className="hidden sm:inline text-slate-700 dark:text-slate-300">PayHere:</span>
            <span
              className={`font-bold ${
                payhereApprovedLive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {payhereApprovedLive
                ? "LIVE APPROVED"
                : "REVIEW MODE"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleReviewMode}
            disabled={updatingReviewMode || configLoading}
            title={
              payhereApprovedLive
                ? "Click to switch to PayHere Review Mode (Sandbox Routing & Restricted Partner Onboarding)"
                : "Click to activate Live PayHere Production Gateway"
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              payhereApprovedLive ? "bg-emerald-500" : "bg-slate-700"
            } ${updatingReviewMode ? "opacity-60 cursor-not-allowed" : ""}`}
            role="switch"
            aria-checked={payhereApprovedLive}
          >
            {updatingReviewMode ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-white animate-spin" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  payhereApprovedLive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            )}
          </button>
        </div>

        {/* CONTROL 2: Disable / Lock Create Account Form (Visible when in Review Mode) */}
        {!payhereApprovedLive && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-200 text-xs font-semibold shadow-sm bg-black/40 border-amber-500/20">
            <div className="flex items-center gap-1.5">
              {disablePublicSignupDuringReview ? (
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
              <span className="hidden sm:inline text-slate-300">Create Account Form:</span>
              <span
                className={`font-bold ${
                  disablePublicSignupDuringReview ? "text-rose-400" : "text-sky-400"
                }`}
              >
                {disablePublicSignupDuringReview ? "LOCKED" : "OPEN (Buyers Only)"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleSignupLock}
              disabled={updatingSignupMode || configLoading}
              title={
                disablePublicSignupDuringReview
                  ? "Click to re-open Buyer registration for PayHere reviewers"
                  : "Click to lock the entire Create Account form completely"
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                disablePublicSignupDuringReview ? "bg-rose-500" : "bg-slate-700"
              } ${updatingSignupMode ? "opacity-60 cursor-not-allowed" : ""}`}
              role="switch"
              aria-checked={disablePublicSignupDuringReview}
            >
              {updatingSignupMode ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    disablePublicSignupDuringReview ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              )}
            </button>
          </div>
        )}

        {/* Theme Mode Toggle */}
        <ThemeToggle variant="icon" />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FED800] rounded-full animate-pulse" />
        </button>

        {/* User Pill - Links to Unified Profile & Security */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10 hover:opacity-90 transition-opacity text-left cursor-pointer"
          title="Open Profile & Security Settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#661F19] to-[#80251e] border border-[#FED800]/40 flex items-center justify-center text-xs font-bold text-[#FED800] overflow-hidden">
            {user?.avatarUrl || user?.image ? (
              <img
                src={user.avatarUrl || user.image}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : user?.username ? (
              user.username.charAt(0).toUpperCase()
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.username || user?.fname || "Admin"}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Profile & Security</div>
          </div>
        </button>

        <LogoutButton
          variant="icon"
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          title="Sign Out"
        />
      </div>
    </header>
  );
};

export default AdminHeader;
