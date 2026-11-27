"use client";

import React from "react";
import Link from "next/link";
import { Clock, MapPin, Ticket, ChevronRight } from "lucide-react";
import { getCdnUrl } from "../../utils/cdn";

export default function ModernShowCard({ show }) {
  if (!show) return null;

  const imageUrl = show.image
    ? getCdnUrl(show.image, "shows")
    : "/assets/hero.png";

  const getDayAndMonth = (dateString) => {
    if (!dateString) return { month: "TBA", day: "--", weekday: "Date TBA" };
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return { month: "TBA", day: "--", weekday: dateString };
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });
      const weekdayStr = d.toLocaleDateString("en-US", { weekday: "short" });
      return {
        month: (monthStr || "TBA").toUpperCase(),
        day: d.getDate(),
        weekday: weekdayStr || "",
      };
    } catch (e) {
      return { month: "TBA", day: "--", weekday: "Date TBA" };
    }
  };

  const getCityName = () => {
    if (show.city && typeof show.city === "object") {
      return show.city.cityName || "Sri Lanka";
    }
    return show.city || "Sri Lanka";
  };

  const dateInfo = getDayAndMonth(show.showDate);

  const getStartingPrice = () => {
    if (show.startingPrice !== undefined && show.startingPrice !== null) {
      return Number(show.startingPrice);
    }
    if (show.minPrice !== undefined && show.minPrice !== null) {
      return Number(show.minPrice);
    }
    if (show.price !== undefined && show.price !== null) {
      return Number(show.price);
    }
    if (show.basePrice !== undefined && show.basePrice !== null) {
      return Number(show.basePrice);
    }
    if (Array.isArray(show.pricing) && show.pricing.length > 0) {
      const validPrices = show.pricing
        .map((p) => Number(p.price))
        .filter((p) => !isNaN(p) && p > 0);
      if (validPrices.length > 0) return Math.min(...validPrices);
    }
    if (Array.isArray(show.showPricings) && show.showPricings.length > 0) {
      const validPrices = show.showPricings
        .map((p) => Number(p.price))
        .filter((p) => !isNaN(p) && p > 0);
      if (validPrices.length > 0) return Math.min(...validPrices);
    }
    return 750;
  };

  const startingPrice = getStartingPrice();

  return (
    <div className="ticket-card group flex flex-col h-full border border-slate-200 dark:border-white/[0.08] hover:border-amber-500/50 bg-white dark:bg-[#12121a] transition-all duration-300 shadow-sm hover:shadow-xl">
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-[#0d0d14]">
        <img
          src={imageUrl}
          alt={show.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/assets/hero.png";
          }}
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* City Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-white/90 dark:bg-black/75 backdrop-blur-md text-slate-800 dark:text-amber-300 border border-slate-200 dark:border-amber-500/30 shadow-sm">
            <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{getCityName()}</span>
          </span>

          {/* Senior UI Pulse Status - Real theatre terminology */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-red-500/90 dark:bg-red-950/80 backdrop-blur-md text-white dark:text-red-300 border border-red-400 dark:border-red-500/40 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>Filling Fast</span>
          </span>
        </div>

        {/* High-Contrast Calendar Date Block */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div className="flex items-center bg-white/95 dark:bg-[#0d0d14]/90 backdrop-blur-md border border-slate-200 dark:border-white/15 rounded-lg overflow-hidden shadow-xl text-center">
            <div className="bg-[#661F19] text-amber-300 px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase flex flex-col justify-center select-none">
              <span className="text-amber-300">{dateInfo.month}</span>
              <span className="text-white text-base font-black leading-none">{dateInfo.day}</span>
            </div>
            <div className="px-2.5 py-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold text-left border-l border-slate-100 dark:border-white/10">
              <span>{dateInfo.weekday}</span>
              {show.showTime && <span className="block text-[10px] text-amber-700 dark:text-amber-400/90 font-medium">{show.showTime}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Body */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white dark:bg-[#12121a]">
        <div>
          {/* Drama Title if distinct */}
          {show.drama?.title && show.drama.title !== show.title && (
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400/90 uppercase tracking-wider line-clamp-1 mb-1">
              {show.drama.title}
            </p>
          )}

          {/* Show Title */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug font-['Plus_Jakarta_Sans']">
            {show.title}
          </h3>

          {/* Venue & Hall */}
          <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500/80 shrink-0" />
              <span className="truncate">{show.location || "Main Auditorium"}, {getCityName()}</span>
            </div>
            {show.showTime && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>Curtain opens at {show.showTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Physical Perforated Ticket Divider with Left/Right Notches */}
        <div className="ticket-divider relative my-3">
          <div className="ticket-notch-left" />
          <div className="ticket-notch-right" />
        </div>

        {/* Bottom Ticket Pricing & Action Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
              Admission
            </span>
            <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400 font-mono tracking-tight">
              From LKR {startingPrice.toLocaleString()}
            </span>
          </div>

          <Link
            href={`/show/${show.slug || show.showId}`}
            className="btn-theatre-gold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-bold shrink-0 hover:gap-2 transition-all shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
            <ChevronRight className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}
