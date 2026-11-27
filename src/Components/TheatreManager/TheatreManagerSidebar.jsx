"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Theater,
  CreditCard,
  Settings,
  Plus,
  Menu,
  X,
  Box,
  TrendingUp,
  LogOut,
  ShieldCheck,
  Sparkles,
  Wallet,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import LogoutButton from "../Logout/LogoutButton";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3, badge: null },
  { key: "theatres", label: "Theatres & Halls", icon: Theater, badge: "3D" },
  { key: "theatre-builder", label: "3D Layout Studio", icon: Box, badge: "NEW" },
  { key: "shows", label: "Shows & Schedules", icon: Calendar, badge: null },
  { key: "bookings", label: "Bookings & Check-In", icon: CreditCard, badge: null },
  { key: "analytics", label: "Revenue Analytics", icon: TrendingUp, badge: null },
  { key: "payouts", label: "Payouts & Settlements", icon: Wallet, badge: "CASH" },
  { key: "agreements", label: "Settlement Agreements", icon: FileCheck, badge: "LEGAL" },
  { key: "kyc", label: "KYC & Verification Docs", icon: ShieldCheck, badge: "AML" },
  { key: "profile", label: "Profile & Security", icon: ShieldCheck, badge: "2FA" },
];

const TheatreManagerSideBar = ({ activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        aria-label="Toggle Sidebar"
        className="md:hidden fixed top-4 left-4 z-50 bg-[#FED800] text-black p-2.5 rounded-xl shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#0d0d14] border-r border-slate-200 dark:border-white/10 z-50 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 shadow-sm dark:shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header with Main Naataka Logo */}
        <div>
          <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative shrink-0 flex items-center">
                <img
                  src="/logo-nataka.png"
                  alt="Naataka.LK"
                  className="h-8 w-auto object-contain block dark:hidden transition-transform group-hover:scale-105"
                />
                <img
                  src="/logo-nataka-white.png"
                  alt="Naataka.LK"
                  className="h-8 w-auto object-contain hidden dark:block transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#661F19] text-white dark:bg-[#FED800] dark:text-black shadow-sm">
                    THEATRE
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    MANAGER
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 tracking-tight font-medium">
                  Theatre Management Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)]">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu Navigation
            </div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#661F19] to-[#80251e] !text-white shadow-lg shadow-[#661F19]/30 border border-amber-900/40"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#FED800]" : "text-slate-500 dark:text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.badge === "NEW"
                          ? "bg-[#FED800] text-black"
                          : isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile & Logout in Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#661F19] text-[#FED800] font-bold text-xs flex items-center justify-center border border-[#FED800]/30">
                {user?.username ? user.username.charAt(0).toUpperCase() : "TM"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[100px]">
                  {user?.username || "Manager"}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Approved TM</span>
                </div>
              </div>
            </div>

            <LogoutButton
              variant="icon"
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Log Out"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>Core v2.4.2</span>
            <span>By Zeylex Digital</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TheatreManagerSideBar;
