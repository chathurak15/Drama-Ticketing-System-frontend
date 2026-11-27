"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../../Components/modern/Header";
import ModernFooter from "../../../Components/modern/Footer";
import ModernSeatPopup from "../../../Components/modern/SeatPopup";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  User,
  ShieldCheck,
  ChevronLeft,
  Share2,
  TicketCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  DoorOpen,
  Armchair,
  Plus,
  Minus,
  Sparkles,
  Volume2,
  Car,
  Wind,
  Accessibility,
} from "lucide-react";
import { getShowById } from "../../../services/ShowService";
import { getCdnUrl } from "../../../utils/cdn";
import { toast } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";
import ShareModal from "../../../Components/common/ShareModal";
import { getPreviewShowById, isPreviewMode } from "../../../data/previewCatalog";

export default function ShowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeatPopupOpen, setIsSeatPopupOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Selected showtime slot
  const [selectedTime, setSelectedTime] = useState("");

  // General Admission ticket quantities { [tierName]: count }
  const [generalQuantities, setGeneralQuantities] = useState({});

  useEffect(() => {
    if (!id) return;
    const fetchShow = async () => {
      try {
        setLoading(true);

        const previewShow = getPreviewShowById(id);
        if (previewShow) {
          setShow(previewShow);
          setSelectedTime(previewShow.showTime || "06:30 PM");
          setGeneralQuantities({
            [previewShow.ticketPrices?.[0]?.category || "Standard"]: 2
          });
          return;
        }

        const res = await getShowById(id);
        if (res?.data) {
          const statusLower = (res.data.status || "").toLowerCase();
          const isLiveApproved = statusLower === "approved" || statusLower === "active" || statusLower === "postponed" || statusLower === "cancelled" || statusLower === "canceled";
          const isPrivileged = user && (user.role === "Admin" || user.role === "ROLE_ADMIN" || user.id === res.data.user?.id);

          if (!isLiveApproved && !isPrivileged) {
            setError("This show is awaiting administrator review and is not publicly available yet.");
            return;
          }

          setShow(res.data);

          // Canonical slug sync in browser address bar (without full reload)
          if (
            res.data.slug &&
            typeof window !== "undefined" &&
            !window.location.pathname.endsWith(`/${res.data.slug}`)
          ) {
            window.history.replaceState(null, "", `/show/${res.data.slug}`);
          }

          // Initialize selected showtime
          const timeSlots = getParsedTimeSlots(res.data);
          if (timeSlots.length > 0) {
            setSelectedTime(timeSlots[0]);
          }

          // Initialize default general admission quantities
          setGeneralQuantities({
            "Standard Admission": 1,
            "VIP / Front Area": 0,
          });
        } else {
          setError("Show details not found");
        }
      } catch (err) {
        console.error("Failed to fetch show:", err);
        setError("Could not load show details.");
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSlot = (timeStr) => {
    if (!timeStr) return "";
    return timeStr;
  };

  const getParsedTimeSlots = (showObj) => {
    if (!showObj) return [];
    if (showObj.showTimes && typeof showObj.showTimes === "string") {
      const slots = showObj.showTimes
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (slots.length > 0) return slots;
    }
    return showObj.showTime ? [showObj.showTime] : ["7:00 PM"];
  };

  const handleShareClick = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Show public link copied to clipboard!");
    }
  };

  // General Admission ticket quantity adjustments
  const handleQtyChange = (tierName, delta) => {
    setGeneralQuantities((prev) => {
      const current = prev[tierName] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tierName]: next };
    });
  };

  // Checkout for General Admission shows (No seat map required)
  const handleGeneralAdmissionCheckout = () => {
    if (!user) {
      toast.warn("Please sign in to complete ticket booking");
      router.push("/login");
      return;
    }

    const defaultTiers = [
      { tierName: "Standard Admission", price: 1000 },
      { tierName: "VIP / Front Area", price: 2500 },
    ];

    const seatsList = [];
    let grandTotal = 0;

    defaultTiers.forEach((tier) => {
      const qty = generalQuantities[tier.tierName] || 0;
      for (let i = 1; i <= qty; i++) {
        seatsList.push({
          seatIdentifier: `${tier.tierName} #${i}`,
          price: tier.price,
          category: tier.tierName,
        });
        grandTotal += tier.price;
      }
    });

    if (seatsList.length === 0) {
      toast.warn("Please select at least one ticket to proceed.");
      return;
    }

    const bookingPayload = {
      showId: Number(show.showId),
      seats: seatsList,
      totalAmount: grandTotal,
      userId: user.id,
      selectedTime: selectedTime,
      showTimeSlot: selectedTime,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("nataka_booking", JSON.stringify(bookingPayload));
    }
    router.push("/booking");
  };

  if (loading) {
    return (
      <>
        <ModernHeader />
        <main className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Setting the stage...</p>
          </div>
        </main>
        <ModernFooter />
      </>
    );
  }

  if (error || !show) {
    return (
      <>
        <ModernHeader />
        <main className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14141e] max-w-md w-full p-8 text-center rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Show Not Found</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">{error || "This show is currently not available."}</p>
            <Link href="/shows" className="btn-theatre-gold px-6 py-2 rounded-full text-xs font-bold cursor-pointer shadow-md">
              Browse All Shows
            </Link>
          </div>
        </main>
        <ModernFooter />
      </>
    );
  }

  const posterUrl = show.image
    ? getCdnUrl(show.image, "shows")
    : "/assets/hero.png";

  const cityName = show.city?.cityName || show.city || "Sri Lanka";
  const timeSlots = getParsedTimeSlots(show);
  const isReservedSeating = Boolean(show.theatre?.id);

  // General Admission price calculation
  const defaultTiers = [
    { tierName: "Standard Admission", price: 1000 },
    { tierName: "VIP / Front Area", price: 2500 },
  ];
  const generalTicketsCount = Object.values(generalQuantities).reduce((a, b) => a + b, 0);
  const generalGrandTotal = defaultTiers.reduce(
    (sum, t) => sum + (generalQuantities[t.tierName] || 0) * t.price,
    0
  );

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-8 lg:py-12 transition-colors duration-200">
        <div className="desktop-container">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/shows" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Shows
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px]">{show.title}</span>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Share Link</span>
            </button>
          </div>

          {/* Main Hero Card */}
          <div className="ticket-card bg-white dark:bg-[#12121a] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 shadow-xl mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Poster Column */}
              <div className="lg:col-span-5 relative aspect-[3/4] lg:aspect-auto overflow-hidden bg-slate-100 dark:bg-black flex items-center justify-center">
                <img
                  src={posterUrl}
                  alt={show.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/hero.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
              </div>

              {/* Show Details Info Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white dark:bg-[#12121a]">
                <div>
                  {/* Status & Drama Tag */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {show.drama && (
                      <Link
                        href={`/drama/${show.drama.slug || show.drama.id}`}
                        className="text-xs font-semibold px-3 py-1 rounded-md bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/30 dark:border-[#661F19] text-[#661F19] dark:text-amber-300 hover:bg-[#661F19]/20 transition-colors inline-flex items-center gap-1.5"
                      >
                        <TicketCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{show.drama.title}</span>
                      </Link>
                    )}

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Stage Production</span>
                    </span>

                    {isReservedSeating ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Armchair className="w-3.5 h-3.5" />
                        <span>Interactive Seat Selection</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>General Admission</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] leading-tight mb-4">
                    {show.title}
                  </h1>

                  {/* Date, Time, Venue Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Date</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{formatDate(show.showDate)}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Curtain</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {formatSlot(selectedTime || show.showTime)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Venue</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                          {show.location || "Auditorium"}, {cityName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MULTI-SHOWTIME SLOT SELECTOR */}
                  {timeSlots.length > 1 && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 dark:bg-white/5 border border-amber-300 dark:border-amber-500/20">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-2">
                        Select Showtime Performance Slot:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map((slot, index) => {
                          const isSelected = selectedTime === slot;
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedTime(slot)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                                isSelected
                                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 scale-105"
                                  : "bg-white dark:bg-[#181824] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/15 hover:border-amber-400"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{slot} ({formatSlot(slot)})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                    {show.description ||
                      show.drama?.description ||
                      "Join us for an unforgettable stage drama performance. Reserve your preferred seats early to secure prime viewing."}
                  </p>
                </div>

                {/* BOOKING FLOW SECTION */}
                {isReservedSeating ? (
                  /* RESERVED SEATING: Navigate to seat layout */
                  <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Starting from</span>
                      <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
                        LKR 1,000 upwards
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/show/${show.slug || id}/seats?time=${encodeURIComponent(
                            selectedTime || show.showTime || ""
                          )}`
                        )
                      }
                      className="btn-theatre-gold w-full sm:w-auto px-8 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Armchair className="w-4 h-4" />
                      <span>Select Seats on Map</span>
                    </button>
                  </div>
                ) : (
                  /* GENERAL ADMISSION: Direct Quantity Selector on Page */
                  <div className="pt-5 border-t border-slate-100 dark:border-white/10 space-y-4">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                      General Admission Passes
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {defaultTiers.map((tier) => {
                        const qty = generalQuantities[tier.tierName] || 0;
                        return (
                          <div
                            key={tier.tierName}
                            className="bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{tier.tierName}</p>
                              <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                                LKR {tier.price.toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-[#0f0f18] rounded-lg border border-slate-200 dark:border-white/10 p-1">
                              <button
                                onClick={() => handleQtyChange(tier.tierName, -1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-slate-900 dark:text-white">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleQtyChange(tier.tierName, 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Payable</span>
                        <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
                          LKR {generalGrandTotal.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            ({generalTicketsCount} {generalTicketsCount === 1 ? "pass" : "passes"})
                          </span>
                        </span>
                      </div>

                      <button
                        onClick={handleGeneralAdmissionCheckout}
                        disabled={generalTicketsCount === 0}
                        className="btn-theatre-gold w-full sm:w-auto px-8 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-50 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Proceed to Checkout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AUDITORIUM DOORS, FACILITIES & VENUE GUIDELINES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Theatre Doors & Hall Facilities */}
            <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4" />
                <span>Auditorium Entrance &amp; Doors</span>
              </h3>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                <p>
                  <strong className="text-slate-900 dark:text-white">Entrance Gate:</strong>{" "}
                  {show.theatre?.entranceGate || "Main Entrance Gate"}
                </p>

                {show.theatre?.doorDetails && (
                  <p>
                    <strong className="text-slate-900 dark:text-white">Auditorium Doors:</strong>{" "}
                    {show.theatre.doorDetails}
                  </p>
                )}

                {/* Facility Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {show.theatre?.hasAirConditioning && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 text-[10px] font-semibold">
                      <Wind className="w-3 h-3" />
                      <span>Air Conditioned</span>
                    </span>
                  )}

                  {show.theatre?.hasWheelchairAccess && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-semibold">
                      <Accessibility className="w-3 h-3" />
                      <span>Wheelchair Accessible</span>
                    </span>
                  )}

                  {show.theatre?.parkingCapacity > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 text-[10px] font-semibold">
                      <Car className="w-3 h-3" />
                      <span>Parking ({show.theatre.parkingCapacity} cars)</span>
                    </span>
                  )}

                  {show.theatre?.soundSystem && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 text-[10px] font-semibold">
                      <Volume2 className="w-3 h-3" />
                      <span>{show.theatre.soundSystem}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Venue & Gate Entry Rules */}
            <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Auditorium Guidelines</span>
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Doors open 45 minutes prior to the scheduled curtain call.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Digital QR ticket on mobile is fully accepted at the door scanner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Late arrivals will be admitted during suitable scene intervals.</span>
                </li>
              </ul>
            </div>

            <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Payment &amp; Security</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Payments are securely processed via Central Bank of Sri Lanka (CBSL) approved Internet Payment Gateways with 256-bit encryption. Accepted methods include Visa, Mastercard, and American Express.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant Verified Digital Ticket</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Seat Selection Modal */}
      <ModernSeatPopup
        isOpen={isSeatPopupOpen}
        onClose={() => setIsSeatPopupOpen(false)}
        showId={id}
      />

      {/* Share Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={show.title}
        text={`Book tickets for ${show.title} at ${show.location || "theatre"} on Naataka.lk! 🎭`}
        url={typeof window !== "undefined" ? window.location.href : `https://naataka.lk/show/${show.slug || show.showId}`}
        image={posterUrl}
      />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TheaterEvent",
            "name": show.title,
            "description": show.description,
            "image": posterUrl,
            "startDate": show.showDate,
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
              "@type": "Place",
              "name": show.location || "Theatre Auditorium",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": cityName,
                "addressCountry": "LK"
              }
            },
            "offers": {
              "@type": "Offer",
              "url": typeof window !== "undefined" ? window.location.href : `https://naataka.lk/show/${show.slug || show.showId}`,
              "price": "1000",
              "priceCurrency": "LKR",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />

      <ModernFooter />
    </>
  );
}
