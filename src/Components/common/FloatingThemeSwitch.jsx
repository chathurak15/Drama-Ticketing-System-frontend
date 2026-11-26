"use client";

import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function FloatingThemeSwitch() {
  const { isDark, toggleTheme, mounted } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
      <div className="relative">
        {showTooltip && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg border border-white/10 animate-in fade-in zoom-in-95 duration-150">
            Switch to {isDark ? "Light" : "Dark"} Mode
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className={`group flex items-center gap-2 p-2.5 rounded-2xl shadow-xl border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
            isDark
              ? "bg-[#14141e]/90 hover:bg-[#1b1b28] text-amber-400 border-white/15 shadow-black/60 hover:border-amber-400/40"
              : "bg-white/95 hover:bg-slate-50 text-slate-800 border-slate-200 shadow-slate-300/60 hover:border-amber-500/40"
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {isDark ? (
              <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 text-slate-700" />
            )}
          </div>
          <span className="text-xs font-bold pr-1">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>
    </div>
  );
}
