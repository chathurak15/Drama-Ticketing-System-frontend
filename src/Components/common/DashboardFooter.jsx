"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Cpu, Heart } from "lucide-react";

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-8 pb-6 px-4 sm:px-6 border-t border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200 select-none">
      <div className="w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Powered by Zeylex & Copyright */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
          <span>
            © {currentYear} <strong className="text-slate-800 dark:text-slate-200 font-bold">Nataka.LK</strong> — Sri Lanka's Official Stage Drama Hub.
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            Powered by{" "}
            <a
              href="https://zeylex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors"
              title="Visit Zeylex Digital Solutions Official Portal"
            >
              <span>Zeylex Digital Solutions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        </div>

        {/* Right: System Version & Operational Status */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Live System Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Operational</span>
          </div>

          {/* System Version Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300">
            <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Core v2.4.2</span>
          </div>

          {/* Quick Support Call */}
          <a
            href="tel:+94741550909"
            className="hidden lg:inline-flex text-[11px] text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            Hotline: 074 155 0909
          </a>
        </div>
      </div>
    </footer>
  );
}
