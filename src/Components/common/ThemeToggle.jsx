"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ variant = "icon", className = "" }) {
  const { toggleTheme, setTheme, isDark, mounted } = useTheme();

  // Segmented Pill Variant: [ ☀️ Light | 🌙 Dark ]
  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-black/20 dark:bg-black/40 border border-slate-300 dark:border-white/10 shadow-inner ${className}`}
        role="group"
        aria-label="Theme Selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isDark && mounted
              ? "bg-amber-500 text-slate-950 shadow-md font-bold scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Switch to Light Theme"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isDark || !mounted
              ? "bg-[#661F19] text-[#FED800] border border-[#FED800]/30 shadow-md font-bold scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Switch to Dark Theatrical Theme"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  // Switch Toggle Variant (slider)
  if (variant === "switch") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex items-center h-7 w-13 rounded-full transition-colors cursor-pointer p-0.5 border ${
          isDark
            ? "bg-[#1f1f2e] border-white/20 hover:border-amber-400/50"
            : "bg-amber-100 border-amber-300 hover:border-amber-400"
        } ${className}`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      >
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-full transform transition-transform duration-200 shadow-md ${
            isDark
              ? "translate-x-6 bg-[#0a0a0f] text-[#FED800] border border-[#FED800]/30"
              : "translate-x-0 bg-amber-500 text-slate-950"
          }`}
        >
          {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </span>
      </button>
    );
  }

  // Default Icon Button Variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border ${
        isDark
          ? "bg-white/5 hover:bg-white/10 text-amber-400 hover:text-[#FED800] border-white/10 hover:border-amber-400/30"
          : "bg-slate-100 hover:bg-slate-200 text-amber-600 hover:text-amber-700 border-slate-300 shadow-sm"
      } ${className}`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} theme`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
