"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Sparkles, Box, ShieldCheck, Search, RotateCw } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "../../utils/useNavigateCompat";
import ThemeToggle from "../common/ThemeToggle";
import LogoutButton from "../Logout/LogoutButton";
import { toast } from "react-toastify";

const TheatreManagerHeader = ({ activeTab, onReload, onLaunchStudio = () => {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = () => {
    setIsReloading(true);
    toast.info("Refreshing venue dashboard...", { autoClose: 900 });
    if (onReload) {
      onReload();
      setTimeout(() => setIsReloading(false), 600);
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 250);
    }
  };

  return (
    <header className="bg-white/95 dark:bg-[#101018]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left Title / Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="md:hidden flex items-center shrink-0 pr-1" title="Back to Nataka Home">
          <img src="/logo-nataka.png" alt="Nataka" className="h-6 w-auto block dark:hidden" />
          <img src="/logo-nataka-white.png" alt="Nataka" className="h-6 w-auto hidden dark:block" />
        </Link>
        <div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wider flex items-center gap-2">
            <span>NATAKA VENUE OPERATING SYSTEM</span>
            <span className="hidden sm:inline-block text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              v2.4.2
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Theatre Operations Console</span>
            {activeTab && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-amber-700 dark:text-amber-400 capitalize">
                {activeTab}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Right Tools & User Info */}
      <div className="flex items-center gap-2.5">
        {/* Reload / Refresh Button */}
        <button
          type="button"
          onClick={handleReload}
          disabled={isReloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold shadow-sm cursor-pointer"
          title="Reload current page & refresh venue data"
        >
          <RotateCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isReloading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Reload</span>
        </button>

        {/* Theme Mode Toggle */}
        <ThemeToggle variant="icon" />

        {/* Quick Launch Studio Pill */}
        <button
          onClick={onLaunchStudio}
          className="hidden sm:flex items-center gap-2 bg-[#FED800]/10 hover:bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Studio</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FED800] rounded-full animate-pulse" />
        </button>

        {/* User Pill - Links to Profile & Security */}
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
              "TM"
            )}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.username || user?.fname || "Theatre Manager"}
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

export default TheatreManagerHeader;
