"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Contrast,
  Eye,
  Lightbulb,
  Link2,
  Type,
  RotateCcw,
  X,
  Check,
} from "lucide-react";

const STORAGE_KEY = "nataka_a11y_prefs";

const DEFAULT_STATE = {
  fontSize: 16,
  grayscale: false,
  highContrast: false,
  negativeContrast: false,
  lightBg: false,
  linksUnderline: false,
  readableFont: false,
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(DEFAULT_STATE);
  const panelRef = useRef(null);

  // Apply state to DOM documentElement
  const applySettings = (settings) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    // Font size scaling
    if (settings.fontSize && settings.fontSize !== 16) {
      root.style.fontSize = `${settings.fontSize}px`;
      root.setAttribute("data-a11y-font-size", `${settings.fontSize}px`);
    } else {
      root.style.fontSize = "";
      root.removeAttribute("data-a11y-font-size");
    }

    // Toggle CSS classes
    const classMap = [
      { key: "grayscale", className: "a11y-grayscale" },
      { key: "highContrast", className: "a11y-high-contrast" },
      { key: "negativeContrast", className: "a11y-negative-contrast" },
      { key: "lightBg", className: "a11y-light-bg" },
      { key: "linksUnderline", className: "a11y-links-underline" },
      { key: "readableFont", className: "a11y-readable-font" },
    ];

    classMap.forEach(({ key, className }) => {
      if (settings[key]) {
        root.classList.add(className);
      } else {
        root.classList.remove(className);
      }
    });
  };

  // On mount: restore saved preferences
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...DEFAULT_STATE, ...JSON.parse(saved) };
        setState(parsed);
        applySettings(parsed);
      }
    } catch (e) {
      console.warn("Failed to load accessibility preferences:", e);
    }
  }, []);

  // Update settings helper
  const updateSettings = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      applySettings(next);
      return next;
    });
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) return null;

  // Actions
  const handleIncreaseText = () => {
    updateSettings((prev) => ({
      ...prev,
      fontSize: Math.min(24, (prev.fontSize || 16) + 2),
    }));
  };

  const handleDecreaseText = () => {
    updateSettings((prev) => ({
      ...prev,
      fontSize: Math.max(14, (prev.fontSize || 16) - 2),
    }));
  };

  const handleToggleGrayscale = () => {
    updateSettings((prev) => ({
      ...prev,
      grayscale: !prev.grayscale,
    }));
  };

  const handleToggleHighContrast = () => {
    updateSettings((prev) => ({
      ...prev,
      highContrast: !prev.highContrast,
      // high contrast and negative contrast are mutually exclusive
      negativeContrast: !prev.highContrast ? false : prev.negativeContrast,
    }));
  };

  const handleToggleNegativeContrast = () => {
    updateSettings((prev) => ({
      ...prev,
      negativeContrast: !prev.negativeContrast,
      highContrast: !prev.negativeContrast ? false : prev.highContrast,
    }));
  };

  const handleToggleLightBg = () => {
    updateSettings((prev) => ({
      ...prev,
      lightBg: !prev.lightBg,
    }));
  };

  const handleToggleLinksUnderline = () => {
    updateSettings((prev) => ({
      ...prev,
      linksUnderline: !prev.linksUnderline,
    }));
  };

  const handleToggleReadableFont = () => {
    updateSettings((prev) => ({
      ...prev,
      readableFont: !prev.readableFont,
    }));
  };

  const handleReset = () => {
    setState(DEFAULT_STATE);
    applySettings(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const hasAnyActive =
    state.fontSize !== 16 ||
    state.grayscale ||
    state.highContrast ||
    state.negativeContrast ||
    state.lightBg ||
    state.linksUnderline ||
    state.readableFont;

  return (
    <div
      ref={panelRef}
      className="a11y-toolbar-root fixed right-0 top-[55%] -translate-y-1/2 z-[9999] select-none font-sans"
      aria-label="Accessibility Toolbar"
    >
      <div className="relative flex flex-row-reverse items-start">
        {/* Docked Blue Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? "Close Accessibility Tools" : "Open Accessibility Tools"}
          title="Accessibility Tools"
          className={`flex items-center justify-center w-12 h-12 bg-[#1d68f2] hover:bg-[#1557d0] text-white shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
            isOpen
              ? "rounded-l-xl shadow-blue-600/30"
              : "rounded-l-xl hover:w-13 shadow-blue-500/40"
          }`}
        >
          {/* Universal Accessibility / Wheelchair Icon */}
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="4" r="2" />
            <path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01 0-.02-.01H13c-.35-.2-.75-.31-1.18-.31-.85 0-1.61.44-2.03 1.11L7.52 11.6c-.32.51-.18 1.18.33 1.5.51.32 1.18.18 1.5-.33l1.83-2.91.42 1.94c-2.45.69-4.27 2.91-4.27 5.57 0 3.12 2.55 5.66 5.67 5.66 2.8 0 5.12-2.05 5.58-4.73l2.82.71c.1.02.19.04.29.04.5 0 .94-.34 1.05-.85.13-.53-.21-1.07-.74-1.2l-3.3-.83c-.1-.02-.2-.03-.3-.02l-1.43.36c-.46-1.51-1.69-2.67-3.25-3.04l-.23-1.07 1.59 1.77c1.39 1.54 3.41 2.5 5.64 2.5zM12.97 19.33c-1.83 0-3.33-1.5-3.33-3.33 0-1.4.88-2.6 2.14-3.07l.95 4.38c.1.48.47.85.95.96-.23.68-.46 1.06-.71 1.06z" />
          </svg>

          {/* Active indicator dot if any mode is enabled */}
          {hasAnyActive && !isOpen && (
            <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Flyout Panel */}
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility Tools Menu"
            className="w-72 bg-white text-slate-800 rounded-l-2xl rounded-br-2xl border-2 border-[#1d68f2] shadow-2xl shadow-blue-500/20 py-3.5 px-4 animate-in fade-in slide-in-from-right-2 duration-150 backdrop-blur-md max-h-[85vh] overflow-y-auto"
            style={{ minWidth: "285px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
              <span className="text-[12px] font-extrabold tracking-wider text-slate-500 uppercase">
                Accessibility Tools
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Tools */}
            <div className="flex flex-col space-y-0.5">
              {/* Increase Text */}
              <button
                type="button"
                onClick={handleIncreaseText}
                className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ZoomIn className="w-[18px] h-[18px] text-slate-500 group-hover:text-slate-700" />
                  <span className="font-medium">Increase Text</span>
                </div>
                <span className="text-xs text-slate-400 font-mono font-medium">
                  {state.fontSize || 16}px
                </span>
              </button>

              {/* Decrease Text */}
              <button
                type="button"
                onClick={handleDecreaseText}
                className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-[18px] h-[18px] text-slate-500 group-hover:text-slate-700" />
                  <span className="font-medium">Decrease Text</span>
                </div>
                <span className="text-xs text-slate-400 font-mono font-medium">
                  {state.fontSize || 16}px
                </span>
              </button>

              {/* Grayscale */}
              <button
                type="button"
                onClick={handleToggleGrayscale}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] transition-colors cursor-pointer ${
                  state.grayscale
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal
                    className={`w-[18px] h-[18px] ${
                      state.grayscale ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span>Grayscale</span>
                </div>
                {state.grayscale && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* High Contrast */}
              <button
                type="button"
                onClick={handleToggleHighContrast}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] transition-colors cursor-pointer ${
                  state.highContrast
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Contrast
                    className={`w-[18px] h-[18px] ${
                      state.highContrast
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span>High Contrast</span>
                </div>
                {state.highContrast && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* Negative Contrast */}
              <button
                type="button"
                onClick={handleToggleNegativeContrast}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] transition-colors cursor-pointer ${
                  state.negativeContrast
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Eye
                    className={`w-[18px] h-[18px] ${
                      state.negativeContrast
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span>Negative Contrast</span>
                </div>
                {state.negativeContrast && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* Light Background */}
              <button
                type="button"
                onClick={handleToggleLightBg}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] transition-colors cursor-pointer ${
                  state.lightBg
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lightbulb
                    className={`w-[18px] h-[18px] ${
                      state.lightBg ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span>Light Background</span>
                </div>
                {state.lightBg && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* Links Underline */}
              <button
                type="button"
                onClick={handleToggleLinksUnderline}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] transition-colors cursor-pointer ${
                  state.linksUnderline
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Link2
                    className={`w-[18px] h-[18px] ${
                      state.linksUnderline
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span>Links Underline</span>
                </div>
                {state.linksUnderline && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* Readable Font */}
              <button
                type="button"
                onClick={handleToggleReadableFont}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-[14px] transition-colors cursor-pointer ${
                  state.readableFont
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Type
                    className={`w-[18px] h-[18px] ${
                      state.readableFont
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span>Readable Font</span>
                </div>
                {state.readableFont && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-1 mt-1" />

              {/* Reset */}
              <button
                type="button"
                onClick={handleReset}
                className="group flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-left text-[14px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                <RotateCcw className="w-[18px] h-[18px] text-red-500 group-hover:rotate-[-45deg] transition-transform" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
