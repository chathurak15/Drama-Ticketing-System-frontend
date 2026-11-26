"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  MapPin,
  Ticket,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  TicketCheck,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import useTranslation from "../../hooks/useTranslation";
import { toast } from "react-toastify";
import ThemeToggle from "../common/ThemeToggle";

const SRI_LANKAN_CITIES = [
  "All Sri Lanka",
  "Colombo",
  "Kandy",
  "Galle",
  "Gampaha",
  "Negombo",
  "Kurunegala",
  "Anuradhapura",
  "Polonnaruwa",
  "Jaffna",
];

export default function ModernHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useTranslation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Sri Lanka");
  const [searchQuery, setSearchQuery] = useState("");

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const cityParam = selectedCity !== "All Sri Lanka" ? `&city=${encodeURIComponent(selectedCity)}` : "";
      router.push(`/shows?title=${encodeURIComponent(searchQuery.trim())}${cityParam}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (city === "All Sri Lanka") {
      router.push("/shows");
    } else {
      router.push(`/shows?city=${encodeURIComponent(city)}`);
    }
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      toast.info("You have signed out successfully");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardRoute = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin-dashboard";
      case "theatre manager":
      case "theatre_manager":
      case "theatremanager":
        return "/theatre-manager-dashboard";
      case "organizer":
        return "/organizer-dashboard";
      default:
        return "/user-dashboard";
    }
  };

  return (
    <>
      {/* Top Banner - Sri Lanka cultural notice, Zeylex credit & Hotline */}
      <div className="bg-gradient-to-r from-[#661F19] via-[#350F0C] to-[#661F19] border-b border-amber-900/40 text-xs py-1.5 px-4 text-amber-200/90 hidden md:block">
        <div className="desktop-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-amber-200">
              <TicketCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Sri Lanka's Official Stage Drama Platform</span>
            </span>
            <span className="text-amber-500/40">|</span>
            <span className="flex items-center gap-1 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Verified Seats</span>
            </span>
            <span className="text-amber-500/40">|</span>
            <span className="text-[11px] font-semibold text-amber-200">
              Developed by <strong className="text-amber-300 tracking-wide font-bold">Zeylex</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-200">
            <a href="tel:+94741550909" className="flex items-center gap-1 hover:text-amber-300 transition-colors">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Support: 074 155 0909</span>
            </a>
            <span className="text-amber-500/40">|</span>
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/10 text-[11px]">
              <button
                onClick={() => setLanguage("en")}
                className={`transition-colors cursor-pointer ${language === "en" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"}`}
              >
                ENG
              </button>
              <span>/</span>
              <button
                onClick={() => setLanguage("si")}
                className={`transition-colors cursor-pointer ${language === "si" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"}`}
              >
                සිංහල
              </button>
            </div>
            <span className="text-amber-500/40 hidden sm:inline">|</span>
            {/* Quick Theme Switcher Pill in Top Bar */}
            <ThemeToggle variant="pill" className="hidden sm:inline-flex scale-90" />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-[#0d0d14]/95 backdrop-blur-md shadow-sm dark:shadow-2xl border-b border-slate-200 dark:border-white/10 py-2.5"
            : isHome
            ? "bg-white/90 dark:bg-[#0d0d14]/85 backdrop-blur-sm border-b border-slate-200/80 dark:border-white/5 py-3.5"
            : "bg-white dark:bg-[#0d0d14] border-b border-slate-200 dark:border-white/10 py-3"
        }`}
      >
        <div className="desktop-container flex items-center justify-between gap-4">
          {/* Brand Logo - Dual mode support with zero hydration glitch */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 py-1">
            <img
              src="/logo-nataka.png"
              alt="Nataka.LK"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 block dark:hidden"
            />
            <img
              src="/logo-nataka-white.png"
              alt="Nataka.LK"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block"
            />
          </Link>

          {/* Quick Search Bar (Eventure style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md mx-4 relative"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search shows, dramas, artists or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white dark:bg-[#171722] dark:hover:bg-[#1c1c2b] dark:focus:bg-[#1a1a28] text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 pl-10 pr-24 py-2 rounded-full border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-full hover:from-amber-400 hover:to-amber-500 transition-all shadow-sm cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Links & City Selector */}
          <div className="hidden md:flex items-center gap-5">
            {/* City Selector Pill */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#151520] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl dark:shadow-2xl py-2 hidden group-hover:block transition-all z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400/80 uppercase tracking-wider">
                  Select Location
                </div>
                {SRI_LANKAN_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCity === city
                        ? "text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-white/5"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation links */}
            <Link
              href="/shows"
              className={`text-sm font-medium transition-colors ${
                pathname === "/shows"
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              Shows
            </Link>

            <Link
              href="/dramas"
              className={`text-sm font-medium transition-colors ${
                pathname === "/dramas"
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              Dramas
            </Link>

            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${
                pathname === "/about"
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                pathname === "/contact"
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              Contact
            </Link>

            {/* Desktop Theme Toggle */}
            <ThemeToggle variant="icon" />

            {/* Auth Buttons / User Pill */}
            {user ? (
              <div className="flex items-center gap-2.5">
                {/* Direct My Tickets link for Buyers */}
                {(!user.role || user.role.toLowerCase() === "customer") && (
                  <Link
                    href="/user-dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105"
                  >
                    <Ticket className="w-3.5 h-3.5 text-amber-500" />
                    <span>My Tickets</span>
                  </Link>
                )}

                <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-100 transition-all text-xs font-medium cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.fname ? user.fname.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user.fname}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#171724] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl dark:shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {user.fname} {user.lname}
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 capitalize">{user.role || "Member"}</p>
                    </div>

                    <Link
                      href={getDashboardRoute(user.role)}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/user-dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5 text-amber-500" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>Profile & Security</span>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-white/10 my-1"></div>

                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-theatre-gold text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm"
                >
                  Book Tickets
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/shows"
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-amber-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-white/10"
              aria-label="Shows"
            >
              <Ticket className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#12121c] border-b border-slate-200 dark:border-white/10 px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200 shadow-xl">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dramas, shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#1b1b28] text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </form>

            {/* City Selector for Mobile */}
            <div className="mb-4">
              <label className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1 block">City / Area:</label>
              <div className="grid grid-cols-2 gap-2">
                {SRI_LANKAN_CITIES.slice(0, 6).map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`text-xs py-1.5 px-3 rounded text-left transition-colors cursor-pointer ${
                      selectedCity === city
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-white/10 pt-3">
              <Link
                href="/shows"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                <Ticket className="w-4 h-4 text-amber-500" />
                <span>Upcoming Shows</span>
              </Link>
              <Link
                href="/dramas"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Stage Dramas</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                Contact & Support
              </Link>
            </div>

            {/* Mobile Theme Selector */}
            <div className="border-t border-slate-100 dark:border-white/10 pt-3 mt-2 flex items-center justify-between px-1">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Appearance</span>
              <ThemeToggle variant="pill" />
            </div>

            <div className="border-t border-slate-100 dark:border-white/10 pt-4 mt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
                    <span>Logged in as: <strong className="text-slate-900 dark:text-white">{user.fname}</strong></span>
                    <span className="text-amber-600 dark:text-amber-400 capitalize">({user.role})</span>
                  </div>
                  {(!user.role || user.role.toLowerCase() === "customer") && (
                    <Link
                      href="/user-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 w-full text-center py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-sm"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>My Tickets</span>
                    </Link>
                  )}
                  <Link
                    href={getDashboardRoute(user.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-center py-2 rounded-lg bg-red-500/10 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/20"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-lg btn-theatre-gold text-xs font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
