"use client";

import React, { useState } from "react";
import { Theater, Sparkles } from "lucide-react";

/**
 * StageDramaButton - Theatrical Stage Drama Loading Button
 *
 * Implements a luxurious Sri Lankan theatre / Broadway proscenium aesthetic:
 * - Parting velvet curtains on loading state
 * - Dancing golden comedy & tragedy drama mask (🎭)
 * - Ambient stage footlights shimmer
 * - Dynamic stage spotlight beam
 * - Rich velvet maroon (#661F19) & Nataka Gold (#FED800) gradients
 *
 * Perfect for:
 * - Customers: Booking seats, checkout, reservation confirmation
 * - Organizers: Signing legal agreements, releasing payouts, publishing shows
 */
export default function StageDramaButton({
  children,
  loading = false,
  loadingText,
  variant = "theatre", // "theatre" | "gold" | "dark" | "danger" | "outline"
  size = "md", // "sm" | "md" | "lg" | "xl"
  icon: Icon,
  rightIcon: RightIcon,
  showFootlights = true,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  title,
  ...props
}) {
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = (e) => {
    if (loading || disabled) return;
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 500);
    if (onClick) onClick(e);
  };

  // Base sizing styles
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5 min-h-[34px]",
    md: "px-4.5 py-2.5 text-xs sm:text-sm rounded-xl gap-2 min-h-[42px]",
    lg: "px-6 py-3 text-sm sm:text-base rounded-2xl gap-2.5 min-h-[50px]",
    xl: "px-8 py-3.5 text-base sm:text-lg rounded-2xl gap-3 min-h-[56px]",
  }[size] || "px-4.5 py-2.5 text-xs sm:text-sm rounded-xl gap-2 min-h-[42px]";

  // Thematic color variants
  const variantClasses = {
    theatre:
      "bg-gradient-to-r from-[#5c1813] via-[#7d231b] to-[#5c1813] text-white border border-[#FED800]/40 shadow-lg shadow-[#661F19]/40 hover:shadow-[#661F19]/60 hover:border-[#FED800]/70 active:scale-[0.98]",
    gold:
      "bg-gradient-to-r from-[#FED800] via-[#ffdf33] to-[#e5c300] text-slate-950 border border-[#FED800] font-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-105 active:scale-[0.98]",
    dark:
      "bg-[#141420] text-white border border-white/15 hover:border-[#FED800]/50 hover:bg-[#1a1a2a] shadow-md shadow-black/40 active:scale-[0.98]",
    danger:
      "bg-gradient-to-r from-rose-700 via-rose-800 to-rose-700 text-white border border-rose-500/40 shadow-lg shadow-rose-950/40 hover:from-rose-600 hover:to-rose-800 active:scale-[0.98]",
    outline:
      "bg-transparent text-white border border-white/20 hover:border-[#FED800] hover:text-[#FED800] hover:bg-white/[0.04] active:scale-[0.98]",
  }[variant] || "bg-gradient-to-r from-[#5c1813] via-[#7d231b] to-[#5c1813] text-white border border-[#FED800]/40";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      title={title}
      aria-busy={loading}
      className={`relative overflow-hidden font-extrabold tracking-wide inline-flex items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none group ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {/* 1. THEATRICAL HOVER SPOTLIGHT BEAM */}
      {!loading && !disabled && (
        <span
          className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none transform -skew-x-25 -translate-x-full group-hover:animate-spotlight-sweep"
          aria-hidden="true"
        />
      )}

      {/* 2. CLICK RIPPLE PULSE */}
      {isRippling && (
        <span
          className="absolute inset-0 bg-[#FED800]/25 rounded-inherit pointer-events-none animate-ping"
          aria-hidden="true"
        />
      )}

      {/* 3. STAGE DRAMA LOADING STATE */}
      {loading ? (
        <div className="relative z-10 flex items-center justify-center gap-2.5 py-0.5 w-full">
          {/* Animated Velvet Curtains Parting */}
          <div
            className="absolute inset-0 flex pointer-events-none overflow-hidden rounded-inherit"
            aria-hidden="true"
          >
            {/* Left Velvet Curtain */}
            <div className="w-1/2 h-full bg-gradient-to-r from-[#420f0b] via-[#661F19] to-[#80251e] border-r-2 border-[#FED800]/60 animate-curtain-left shadow-2xl" />
            {/* Right Velvet Curtain */}
            <div className="w-1/2 h-full bg-gradient-to-l from-[#420f0b] via-[#661F19] to-[#80251e] border-l-2 border-[#FED800]/60 animate-curtain-right shadow-2xl" />
          </div>

          {/* Dancing Golden Drama Mask with Aura */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* Golden Spotlight Halo */}
            <div className="absolute -inset-1.5 bg-[#FED800]/20 rounded-full blur-sm animate-pulse" />
            <div className="relative animate-drama-mask text-[#FED800]">
              <Theater className="w-4 h-4 sm:w-5 sm:h-5 filter drop-shadow(0 0 6px #FED800)" />
            </div>
            {/* Tiny Floating Stage Sparkle */}
            <Sparkles className="w-2.5 h-2.5 text-[#FED800] absolute -top-1 -right-1 animate-bounce" />
          </div>

          {/* Theatrical Loading Text */}
          <span
            className={`font-black tracking-wide text-xs sm:text-sm animate-pulse ${
              variant === "gold" ? "text-slate-900" : "text-[#FED800]"
            }`}
          >
            {loadingText || "Raising the Curtains..."}
          </span>
        </div>
      ) : (
        /* 4. IDLE RESTING / SHOWTIME STATE */
        <span className="relative z-10 flex items-center justify-center gap-2">
          {Icon && (
            <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </span>
          )}

          <span>{children}</span>

          {RightIcon && (
            <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
              {React.isValidElement(RightIcon) ? RightIcon : <RightIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </span>
          )}
        </span>
      )}

      {/* 5. STAGE FOOTLIGHTS (Theatrical Apron Edge Glow) */}
      {showFootlights && (
        <div
          className="absolute inset-x-0 bottom-0 h-1 flex items-center justify-center gap-2 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          <span
            className="w-1 h-1 rounded-full bg-[#FED800]"
            style={{ animation: "footlightMarquee 1.8s ease-in-out infinite" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-[#FED800]"
            style={{ animation: "footlightMarquee 1.8s ease-in-out 0.3s infinite" }}
          />
          <span
            className="w-1.5 h-1 rounded-full bg-[#FED800]"
            style={{ animation: "footlightMarquee 1.8s ease-in-out 0.6s infinite" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-[#FED800]"
            style={{ animation: "footlightMarquee 1.8s ease-in-out 0.9s infinite" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-[#FED800]"
            style={{ animation: "footlightMarquee 1.8s ease-in-out 1.2s infinite" }}
          />
        </div>
      )}
    </button>
  );
}
