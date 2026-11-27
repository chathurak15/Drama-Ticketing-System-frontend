"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  Clock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  LayoutGrid,
  Building,
  Eye,
  X,
  Plus,
  Minus,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import { getShowById } from "../../../../services/ShowService";
import {
  getSeatsByShowId,
  getUnavailableSeats,
  getSeatAvailability,
  lockSeats,
} from "../../../../services/SeatService";
import { useAuth } from "../../../../utils/AuthContext";
import BookingAuthModal from "../../../../Components/BookingAuthModal";
import {
  savePendingBooking,
  getPendingBooking,
  clearPendingBooking,
} from "../../../../utils/pendingBooking";
import { getPreviewShowById, getPreviewSeatLayout } from "../../../../data/previewCatalog";

// Skeleton loader displayed while Three.js and Auditorium3DView dynamically load
function Auditorium3DSkeleton() {
  return (
    <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0d0d16] rounded-2xl border border-slate-200 dark:border-white/10 p-6 text-center animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
        <Building className="w-7 h-7 text-amber-500 animate-pulse" />
      </div>
      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-1">
        Initializing 3D Auditorium View
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        Setting up lightweight WebGL auditorium, stage sightlines, and tier perspectives...
      </p>
      <div className="w-44 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="w-2/3 h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// Lazy-load Three.js 3D Theater component ONLY when 3D mode is activated
const Auditorium3DView = dynamic(
  () => import("../../../../Components/modern/Auditorium3DView"),
  {
    ssr: false,
    loading: () => <Auditorium3DSkeleton />,
  }
);

export default function DedicatedSeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showId = params?.id;
  const timeQuery = searchParams?.get("time");
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [showData, setShowData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [backendLockedSeats, setBackendLockedSeats] = useState([]);
  const [myLockedSeats, setMyLockedSeats] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSecuringSeats, setIsSecuringSeats] = useState(false);
  const [showLegendPopover, setShowLegendPopover] = useState(false);

  // View Mode: Defaults to lightweight 2D Plan for fast initial load
  const [viewMode, setViewMode] = useState("2d"); // "2d" | "3d"
  const [povTargetSeat, setPovTargetSeat] = useState(null);
  const [previewHoverSeat, setPreviewHoverSeat] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [povTrigger, setPovTrigger] = useState(0);

  // Responsive default zoom on mobile phones to fit full seat rows
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 420) {
        setZoomLevel(0.7);
      } else if (window.innerWidth < 640) {
        setZoomLevel(0.85);
      }
    }
  }, []);

  // Dynamic pixel sizing based on zoomLevel to ensure exact layout recalculation without CSS transform clipping
  const seatSizePx = Math.max(18, Math.min(36, Math.round(28 * zoomLevel)));
  const seatFontPx = Math.max(8, Math.min(13, Math.round(11 * zoomLevel)));
  const seatGapPx = Math.max(2, Math.min(8, Math.round(4 * zoomLevel)));
  const aisleWidthPx = Math.max(10, Math.min(28, Math.round(16 * zoomLevel)));
  const rowLabelWidthPx = Math.max(14, Math.min(26, Math.round(18 * zoomLevel)));

  // Tier order priority: VIP (0: front), Normal/ODC (1: middle), Balcony (2: rear elevated)
  const getCategoryPriority = (category = "") => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("vip")) return 0;
    if (
      cat.includes("nomal") ||
      cat.includes("normal") ||
      cat.includes("odc") ||
      cat.includes("standard")
    )
      return 1;
    if (
      cat.includes("balcony") ||
      cat.includes("gallery") ||
      cat.includes("upper")
    )
      return 2;
    return 3;
  };

  const formatCategory = (category) => {
    if (!category) return "Standard";
    if (category.toLowerCase() === "nomal") return "Normal";
    return category;
  };

  // Fetch Show Metadata (Banner, title, location, datetime)
  useEffect(() => {
    if (!showId) return;
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const previewShow = getPreviewShowById(showId);
        if (previewShow) {
          setShow(previewShow);
          return;
        }
        const res = await getShowById(showId);
        if (res?.data) {
          setShow(res.data);
        }
      } catch (err) {
        console.warn("Could not load show details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowDetails();
  }, [showId]);

  // Fetch Seat Plan from backend
  const fetchSeatPlan = useCallback(async () => {
    const idToUse = show?.showId || (Number.isInteger(Number(showId)) ? Number(showId) : showId);
    if (!idToUse) return;
    try {
      setLoadingSeats(true);
      const previewLayout = getPreviewSeatLayout(idToUse);
      if (previewLayout && String(idToUse).startsWith("preview-")) {
        setShowData(previewLayout);
        return;
      }
      const response = await getSeatsByShowId(idToUse);
      if (response?.data && response.data.ticketPrices && response.data.ticketPrices.length > 0) {
        setShowData(response.data);
      } else {
        setShowData({
          title: response?.data?.title || show?.title || "Auditorium Performance",
          showDate: response?.data?.showDate || show?.showDate || "2026-11-20",
          showTime: response?.data?.showTime || show?.showTime || "06:30 PM",
          location: response?.data?.location || show?.location || "Main Stage",
          ticketPrices: [
            { category: "VIP", price: 1500, totalSeats: 75, seatsPerRow: 15 },
            { category: "Normal", price: 1000, totalSeats: 116, seatsPerRow: 15 },
            { category: "Balcony", price: 750, totalSeats: 45, seatsPerRow: 15 },
          ],
        });
      }
    } catch (error) {
      console.warn("Could not load seat plan, using default layout:", error);
      setShowData({
        title: show?.title || "Auditorium Performance",
        ticketPrices: [
          { category: "VIP", price: 1500, totalSeats: 75, seatsPerRow: 15 },
          { category: "Normal", price: 1000, totalSeats: 116, seatsPerRow: 15 },
          { category: "Balcony", price: 750, totalSeats: 45, seatsPerRow: 15 },
        ],
      });
    } finally {
      setLoadingSeats(false);
    }
  }, [show?.showId, showId, show]);

  // Multi-showtime slot handling
  const availableTimeSlots = useMemo(() => {
    if (show?.showTimes) {
      return show.showTimes.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (show?.showTime) {
      return [show.showTime.trim()];
    }
    return [];
  }, [show]);

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeQuery || "");

  useEffect(() => {
    if (timeQuery) {
      setSelectedTimeSlot(timeQuery);
    } else if (availableTimeSlots.length > 0 && !selectedTimeSlot) {
      setSelectedTimeSlot(availableTimeSlots[0]);
    }
  }, [timeQuery, availableTimeSlots, selectedTimeSlot]);

  const handleSlotChange = (slot) => {
    if (slot === selectedTimeSlot) return;
    setSelectedTimeSlot(slot);
    setSelectedSeats([]);
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("time", slot);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  // Fetch Booked & Locked Seats
  const fetchUnavailableSeats = useCallback(async () => {
    const idToUse = show?.showId || (Number.isInteger(Number(showId)) ? Number(showId) : showId);
    if (!idToUse) return;
    if (String(idToUse).startsWith("preview-") || getPreviewShowById(showId)) {
      setBookedSeats(["A4", "A5", "C4", "C5"]);
      setBackendLockedSeats([]);
      setMyLockedSeats([]);
      return;
    }
    try {
      const slot = selectedTimeSlot || timeQuery || show?.showTime;
      const response = await getSeatAvailability(idToUse, slot);
      setBookedSeats(response.data?.bookedSeats || []);
      setBackendLockedSeats(response.data?.lockedSeats || []);
      setMyLockedSeats(response.data?.myLockedSeats || []);
    } catch {
      try {
        const fallbackRes = await getUnavailableSeats(idToUse, selectedTimeSlot || timeQuery || show?.showTime);
        setBookedSeats(fallbackRes.data?.bookedSeats || []);
        setBackendLockedSeats(fallbackRes.data?.lockedSeats || []);
        setMyLockedSeats(fallbackRes.data?.myLockedSeats || []);
      } catch {
        setBookedSeats([]);
        setBackendLockedSeats([]);
        setMyLockedSeats([]);
      }
    }
  }, [show?.showId, showId, selectedTimeSlot, timeQuery, show?.showTime]);

  useEffect(() => {
    if (!showId) return;
    fetchSeatPlan();
    fetchUnavailableSeats();

    // 5-second polling paused when tab is inactive/hidden to save mobile data & battery
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchUnavailableSeats();
    }, 5000);

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchUnavailableSeats();
      }
    };

    const handleWindowFocus = () => {
      fetchUnavailableSeats();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [showId, show?.showId, fetchSeatPlan, fetchUnavailableSeats]);

  const isSeatBooked = useCallback(
    (identifier, shortCode) =>
      bookedSeats.includes(identifier) || (shortCode && bookedSeats.includes(shortCode)),
    [bookedSeats]
  );

  const isSeatLocked = useCallback(
    (identifier, shortCode) =>
      backendLockedSeats.includes(identifier) || (shortCode && backendLockedSeats.includes(shortCode)),
    [backendLockedSeats]
  );

  const isSeatMyLocked = useCallback(
    (identifier, shortCode) =>
      myLockedSeats.includes(identifier) || (shortCode && myLockedSeats.includes(shortCode)),
    [myLockedSeats]
  );

  const isSeatSelected = useCallback(
    (identifier) => selectedSeats.some((s) => s.seatIdentifier === identifier),
    [selectedSeats]
  );

  // Generate structured seats list synced 1:1 with 3D coordinate layout
  const allSeats = useMemo(() => {
    if (!showData || !showData.ticketPrices || showData.ticketPrices.length === 0) return [];

    let seatId = 1;
    const seatsList = [];

    // Sort categories: VIP (0: front), Normal (1: middle), Balcony (2: rear)
    const sortedCategories = [...showData.ticketPrices].sort(
      (a, b) => getCategoryPriority(a.category) - getCategoryPriority(b.category)
    );

    let currentAlphabetIndex = 0;

    sortedCategories.forEach((ticketCategory) => {
      const { category, price, totalSeats, seatsPerRow } = ticketCategory;
      const count = Number(totalSeats) || 30;
      const perRow = Number(seatsPerRow) || 15;
      const rowCount = Math.ceil(count / perRow);

      for (let i = 0; i < count; i++) {
        const rowIndex = Math.floor(i / perRow);
        const rowLetter = String.fromCharCode(65 + currentAlphabetIndex + rowIndex);
        const seatNumber = (i % perRow) + 1;
        const seatIdentifier = `${category}-${rowLetter}${seatNumber}`;
        const shortCode = `${rowLetter}${seatNumber}`;

        const isBooked = isSeatBooked(seatIdentifier, shortCode);
        const isLocked = isSeatLocked(seatIdentifier, shortCode);
        const isMyLocked = isSeatMyLocked(seatIdentifier, shortCode);

        seatsList.push({
          id: seatId++,
          row: rowLetter,
          number: seatNumber,
          price: Number(price) || 1000,
          status: isBooked ? "BOOKED" : isLocked ? "LOCKED" : isMyLocked ? "MY_LOCKED" : "AVAILABLE",
          category: category || "Standard",
          seatIdentifier,
        });
      }
      currentAlphabetIndex += rowCount;
    });

    return seatsList;
  }, [showData, isSeatBooked, isSeatLocked, isSeatMyLocked]);

  // Auto-restore pending booking if returning to seat map or signing in
  useEffect(() => {
    if (allSeats.length === 0) return;
    const pending = getPendingBooking();
    if (!pending) return;

    const currentNumericId = Number(
      show?.showId || (Number.isInteger(Number(showId)) ? Number(showId) : showData?.showId || 0)
    );
    if (pending.showId && Number(pending.showId) === currentNumericId) {
      if (selectedSeats.length === 0 && pending.seatKeys && pending.seatKeys.length > 0) {
        const keySet = new Set(pending.seatKeys);
        const restored = allSeats.filter(
          (s) =>
            (keySet.has(s.seatIdentifier) || keySet.has(`${s.row}${s.number}`)) &&
            !isSeatBooked(s.seatIdentifier, `${s.row}${s.number}`) &&
            !isSeatLocked(s.seatIdentifier, `${s.row}${s.number}`)
        );
        if (restored.length > 0) {
          setSelectedSeats(restored);
        }
      }
    }
  }, [allSeats, showId, show?.showId, showData?.showId, isSeatBooked, isSeatLocked]);

  const handleSeatClick = (seat) => {
    const shortCode = `${seat.row}${seat.number}`;
    if (isSeatBooked(seat.seatIdentifier, shortCode) || isSeatLocked(seat.seatIdentifier, shortCode)) {
      return;
    }

    const isSelected = isSeatSelected(seat.seatIdentifier);

    if (isSelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.seatIdentifier !== seat.seatIdentifier));
      if (povTargetSeat?.seatIdentifier === seat.seatIdentifier) {
        setPovTargetSeat(null);
      }
    } else {
      if (selectedSeats.length >= 8) {
        toast.warn("You can select up to 8 tickets per transaction.");
        return;
      }
      setSelectedSeats((prev) => [...prev, seat]);
      setPovTargetSeat(seat);
    }
  };

  const getSeatColorClass = (seat) => {
    const shortCode = `${seat.row}${seat.number}`;
    if (isSeatSelected(seat.seatIdentifier) || isSeatMyLocked(seat.seatIdentifier, shortCode)) {
      return "bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/50 scale-105 border border-white ring-2 ring-amber-400";
    }
    if (isSeatBooked(seat.seatIdentifier, shortCode)) {
      return "bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/60 cursor-not-allowed opacity-60";
    }
    if (isSeatLocked(seat.seatIdentifier, shortCode)) {
      return "bg-slate-200 dark:bg-amber-950/60 text-slate-500 dark:text-amber-400/80 border border-slate-300 dark:border-amber-700/40 cursor-not-allowed opacity-75";
    }

    const cat = (seat.category || "").toLowerCase();
    if (cat.includes("vip")) {
      return "bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 hover:bg-purple-200 dark:hover:bg-purple-800/80 hover:border-purple-500 hover:scale-105";
    } else if (cat.includes("balcony")) {
      return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/80 hover:border-emerald-500 hover:scale-105";
    }
    return "bg-slate-100 dark:bg-[#1f1f2e] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 hover:bg-amber-100 dark:hover:bg-[#2b2b3e] hover:border-amber-400 hover:scale-105";
  };

  const totalAmount = selectedSeats.reduce(
    (sum, seat) => sum + (Number(seat.price) || 0),
    0
  );

  const executePostAuthLock = async (authedUser) => {
    setShowAuthModal(false);
    setIsSecuringSeats(true);
    setIsProcessing(true);

    const pending = getPendingBooking();
    const activeSlot = pending?.slotId || selectedTimeSlot || timeQuery || show?.showTime || null;
    const targetNumericShowId = Number(
      pending?.showId || show?.showId || (Number.isInteger(Number(showId)) ? Number(showId) : showData?.showId || 0)
    );
    const seatKeys =
      pending?.seatKeys && pending.seatKeys.length > 0
        ? pending.seatKeys
        : selectedSeats.map((s) => s.seatIdentifier);

    const effectiveUser = authedUser || user;

    if (String(showId).startsWith("preview-") || getPreviewShowById(showId)) {
      const checkoutSeats =
        pending?.seats && pending.seats.length > 0
          ? pending.seats
          : selectedSeats.map((s) => ({
              id: s.id,
              seatIdentifier: s.seatIdentifier,
              price: Number(s.price),
              category: s.category,
              row: s.row,
              number: s.number,
            }));
      const bookingData = {
        showId: show?.showId || showId,
        seats: checkoutSeats,
        totalAmount: pending?.totalAmount || totalAmount,
        userId: effectiveUser?.id || 1,
        selectedTime: activeSlot,
        showTimeSlot: activeSlot,
        lockId: "PREVIEW-LOCK-" + Date.now(),
        lockExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        isPreview: true,
        showTitle: show?.title || "Sri Lankan Stage Drama",
        venue: show?.location || "Lionel Wendt Memorial Theatre",
        city: show?.city?.cityName || "Colombo",
        showDate: show?.showDate || "2026-12-15",
        showTime: activeSlot || show?.showTime || "06:30 PM",
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nataka_booking", JSON.stringify(bookingData));
      }
      clearPendingBooking();
      toast.success("Seats selected! Proceeding to checkout...");
      router.push("/checkout");
      setIsSecuringSeats(false);
      setIsProcessing(false);
      return;
    }

    const lockPayload = {
      showId: targetNumericShowId,
      seatIds: seatKeys,
      seats: seatKeys,
      userId: effectiveUser?.id,
      showTimeSlot: activeSlot,
    };

    try {
      const res = await lockSeats(lockPayload);
      const lockData = res?.data || {};

      const checkoutSeats =
        pending?.seats && pending.seats.length > 0
          ? pending.seats
          : selectedSeats.map((s) => ({
              id: s.id,
              seatIdentifier: s.seatIdentifier,
              price: Number(s.price),
              category: s.category,
              row: s.row,
              number: s.number,
            }));

      const finalTotalAmount = pending?.totalAmount || totalAmount;

      const bookingData = {
        showId: targetNumericShowId,
        seats: checkoutSeats,
        totalAmount: finalTotalAmount,
        userId: effectiveUser?.id,
        selectedTime: activeSlot,
        showTimeSlot: activeSlot,
        lockId: lockData.lockId,
        lockExpiresAt: lockData.lockExpiresAt, // Driven directly from server
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("nataka_booking", JSON.stringify(bookingData));
      }
      clearPendingBooking();
      toast.success("Seats held successfully! Proceeding to checkout...");
      router.push("/checkout");
    } catch (err) {
      console.warn("Post-auth lock error:", err);
      clearPendingBooking();

      if (err.response?.status === 409 || err.response?.status === 400) {
        toast.error(
          "One or more selected seats were just taken while you signed in. Please choose from the available seats."
        );

        // Immediate availability refresh
        try {
          await fetchUnavailableSeats();
          const currentUnavailable = await getUnavailableSeats(targetNumericShowId, activeSlot);
          const unavailableKeys = new Set([
            ...(currentUnavailable.data?.bookedSeats || []),
            ...(currentUnavailable.data?.lockedSeats || []),
          ]);

          // Pre-select whichever of their seats are still free
          setSelectedSeats((prev) =>
            prev.filter(
              (s) =>
                !unavailableKeys.has(s.seatIdentifier) &&
                !unavailableKeys.has(`${s.row}${s.number}`)
            )
          );
        } catch (refreshErr) {
          console.error("Availability refresh error:", refreshErr);
        }
      } else {
        toast.error(err.response?.data?.message || "Failed to secure seat hold. Please try again.");
        await fetchUnavailableSeats();
      }
    } finally {
      setIsSecuringSeats(false);
      setIsProcessing(false);
    }
  };

  const handleProceedBooking = async () => {
    if (isProcessing || isSecuringSeats) return;

    if (selectedSeats.length === 0) {
      toast.warn("Please select at least one seat to proceed.");
      return;
    }

    const activeSlot = selectedTimeSlot || timeQuery || show?.showTime || null;
    const targetNumericShowId = Number(
      show?.showId || (Number.isInteger(Number(showId)) ? Number(showId) : showData?.showId || 0)
    );
    const seatKeys = selectedSeats.map((s) => s.seatIdentifier);

    // Save pending booking intent in sessionStorage (expires in 15 mins)
    savePendingBooking({
      showId: targetNumericShowId,
      slotId: activeSlot,
      seatKeys: seatKeys,
      returnPath: `/show/${showId}/seats${activeSlot ? `?time=${encodeURIComponent(activeSlot)}` : ""}`,
      seats: selectedSeats.map((s) => ({
        id: s.id,
        seatIdentifier: s.seatIdentifier,
        price: Number(s.price),
        category: s.category,
        row: s.row,
        number: s.number,
      })),
      totalAmount: totalAmount,
      showTitle: show?.title || showData?.title || "Auditorium Performance",
      showTime: activeSlot,
    });

    const isPreviewShow = String(showId).startsWith("preview-") || Boolean(getPreviewShowById(showId));

    if (!user && !isPreviewShow) {
      setShowAuthModal(true);
      return;
    }

    await executePostAuthLock(user);
  };

  const categoriesMap = useMemo(() => {
    return allSeats.reduce((acc, seat) => {
      if (!acc[seat.category]) acc[seat.category] = [];
      acc[seat.category].push(seat);
      return acc;
    }, {});
  }, [allSeats]);

  const sortedCategoryNames = useMemo(() => {
    return Object.keys(categoriesMap).sort(
      (a, b) => getCategoryPriority(a) - getCategoryPriority(b)
    );
  }, [categoriesMap]);

  // Active seat for bottom preview bar (hovered seat, or last focused / selected seat)
  const activePreviewSeat = useMemo(() => {
    if (previewHoverSeat && previewHoverSeat.status === "AVAILABLE") return previewHoverSeat;
    if (povTargetSeat && povTargetSeat.status === "AVAILABLE") return povTargetSeat;
    if (selectedSeats.length > 0) return selectedSeats[selectedSeats.length - 1];
    return null;
  }, [previewHoverSeat, povTargetSeat, selectedSeats]);

  const handlePreviewIn3D = useCallback(
    (seat) => {
      const target = seat || activePreviewSeat || selectedSeats[0] || allSeats[0];
      if (target) {
        setPovTargetSeat(target);
        setPovTrigger((prev) => prev + 1);
      }
      setViewMode("3d");
    },
    [activePreviewSeat, selectedSeats, allSeats]
  );

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 dark:bg-[#0a0a12] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      {/* Top Navigation & Show Header Bar */}
      <header className="shrink-0 z-40 bg-white/95 dark:bg-[#12121a]/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: Back button & Show title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href={`/show/${showId}`}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                  Auditorium Seating
                </span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Live Sync</span>
              </div>
              <h1 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-md">
                {showData?.title || show?.title || "Select Your Seats"}
              </h1>
            </div>
          </div>

          {/* Center: Showtime slot selector buttons */}
          {availableTimeSlots.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0d0d16] border border-slate-200 dark:border-white/10 rounded-xl p-1 px-2.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mr-1 hidden sm:inline">Slot:</span>
              <div className="flex items-center gap-1">
                {availableTimeSlots.map((slot) => {
                  const isSelected = (selectedTimeSlot || timeQuery) === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSlotChange(slot)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#661F19] text-amber-300 border border-amber-400/50 shadow-sm"
                          : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent"
                      }`}
                      title={`Select ${slot} showtime slot`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right: Mobile Legend Trigger & Single 2D Plan | 3D View Segmented Switcher */}
          <div className="flex items-center gap-2">
            {/* Mobile Legend Button */}
            <button
              type="button"
              onClick={() => setShowLegendPopover((prev) => !prev)}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              title="Show Seat Legend"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Legend</span>
            </button>

            {/* Clean Segmented Toggle: 2D Plan | 3D View */}
            <div className="flex items-center bg-slate-100 dark:bg-[#0d0d16] border border-slate-200 dark:border-white/15 rounded-xl p-1 shadow-inner shrink-0">
              <button
                onClick={() => setViewMode("2d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "2d"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>2D Plan</span>
              </button>

              <button
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>3D View</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Legend Popover */}
      {showLegendPopover && (
        <div className="md:hidden fixed top-16 right-3 z-50 bg-white/95 dark:bg-[#14141e]/95 border border-slate-200 dark:border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 max-w-xs w-full">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/10">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Seat Color Legend
            </span>
            <button
              onClick={() => setShowLegendPopover(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-[#1f1f2e] border border-slate-300 dark:border-white/20"></span>
              <span className="text-slate-700 dark:text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-white"></span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-red-950 border border-slate-300 dark:border-red-800"></span>
              <span className="text-slate-400">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-amber-950/80 border border-slate-300 dark:border-amber-700/50 inline-flex items-center justify-center text-amber-500">
                <Lock className="w-2 h-2" />
              </span>
              <span className="text-amber-700 dark:text-amber-400">Held</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500"></span>
              <span className="text-purple-700 dark:text-purple-300 font-medium">VIP Tier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500"></span>
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">Balcony Tier</span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Legend Bar (Hidden on Mobile) */}
      <div className="shrink-0 hidden md:block bg-white dark:bg-[#0e0e16] border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-[#1f1f2e] border border-slate-300 dark:border-white/20 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-white inline-block shadow-sm"></span>
              <span className="text-amber-700 dark:text-amber-300 font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-red-950 border border-slate-300 dark:border-red-800 inline-block"></span>
              <span className="text-slate-400">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-amber-950/80 border border-slate-300 dark:border-amber-700/50 inline-flex items-center justify-center text-amber-500">
                <Lock className="w-2 h-2" />
              </span>
              <span className="text-amber-700 dark:text-amber-400">Held</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500 inline-block"></span>
              <span className="text-purple-800 dark:text-purple-300 font-medium">VIP Tier</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500 inline-block"></span>
              <span className="text-emerald-800 dark:text-emerald-300 font-medium">Balcony Tier</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-amber-700 dark:text-amber-400">
            <span>Max 8 tickets per booking</span>
            {viewMode === "2d" && (
              <button
                onClick={() => setViewMode("3d")}
                className="flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline font-semibold cursor-pointer"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Switch to 3D Experience</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace: 2D Plan or Lazy-Loaded 3D Auditorium */}
      <main className="flex-1 min-h-0 w-full flex flex-col relative overflow-hidden">
        {viewMode === "2d" ? (
          /* 2D Seating Layout */
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-2 sm:p-6 pb-24 sm:pb-28 flex flex-col items-center">
            {/* Proscenium Stage Header */}
            <div className="w-full max-w-xl mb-4 text-center shrink-0">
              <div className="h-2 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full shadow-lg shadow-amber-500/50 mb-2"></div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400/90 bg-amber-50 dark:bg-black/60 px-5 py-1.5 rounded-md border border-amber-300 dark:border-amber-500/30 inline-block shadow-sm">
                AUDITORIUM STAGE • ප්‍රධාන වේදිකාව
              </span>
            </div>

            {/* Mobile Zoom Controls & Interaction Hint */}
            <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-3 shrink-0">
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Swipe or pinch to zoom • Tap seat to select
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 h-7 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingSeats ? (
              <div className="py-24 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading auditorium layout...</p>
              </div>
            ) : sortedCategoryNames.length > 0 ? (
              <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
                {sortedCategoryNames.map((catName) => {
                  const categorySeats = categoriesMap[catName];
                  const seatsByRow = categorySeats.reduce((acc, seat) => {
                    if (!acc[seat.row]) acc[seat.row] = [];
                    acc[seat.row].push(seat);
                    return acc;
                  }, {});
                  const sortedRows = Object.keys(seatsByRow).sort();

                  return (
                    <div
                      key={catName}
                      className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                            {formatCategory(catName)} Tier
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            (LKR {categorySeats[0]?.price?.toLocaleString() || "1,000"})
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {categorySeats.filter((s) => s.status === "AVAILABLE").length} Seats Free
                        </span>
                      </div>

                      {/* Horizontally Scrollable Seat Rows Container */}
                      <div className="w-full overflow-x-auto touch-pan-x scrollbar-thin py-2">
                        <div
                          className="min-w-max flex flex-col items-center mx-auto px-2"
                          style={{ gap: `${seatGapPx + 3}px` }}
                        >
                          {sortedRows.map((rowLetter) => {
                            const rowSeats = seatsByRow[rowLetter].sort((a, b) => a.number - b.number);
                            const leftGroup = rowSeats.filter((s) => s.number <= 8);
                            const rightGroup = rowSeats.filter((s) => s.number > 8);

                            return (
                              <div
                                key={rowLetter}
                                className="flex items-center justify-center min-w-max"
                                style={{ gap: `${seatGapPx}px` }}
                              >
                                {/* Left Row Letter */}
                                <span
                                  className="text-[10px] sm:text-xs font-black text-amber-500 text-center shrink-0 select-none"
                                  style={{ width: `${rowLabelWidthPx}px` }}
                                >
                                  {rowLetter}
                                </span>

                                {/* Left Wing Seats (Seats 1-8) */}
                                <div className="flex items-center" style={{ gap: `${seatGapPx}px` }}>
                                  {leftGroup.map((seat) => {
                                    const shortCode = `${seat.row}${seat.number}`;
                                    const locked = isSeatLocked(seat.seatIdentifier, shortCode);
                                    const booked = isSeatBooked(seat.seatIdentifier, shortCode);
                                    return (
                                      <button
                                        key={seat.seatIdentifier}
                                        onClick={() => handleSeatClick(seat)}
                                        onMouseEnter={() => setPreviewHoverSeat(seat)}
                                        onMouseLeave={() => setPreviewHoverSeat(null)}
                                        disabled={booked || locked}
                                        style={{
                                          width: `${seatSizePx}px`,
                                          height: `${seatSizePx}px`,
                                          minWidth: `${seatSizePx}px`,
                                          minHeight: `${seatSizePx}px`,
                                          fontSize: `${seatFontPx}px`,
                                        }}
                                        className={`rounded sm:rounded-md font-bold flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer ${getSeatColorClass(
                                          seat
                                        )}`}
                                        title={`${seat.seatIdentifier} - ${formatCategory(seat.category)} (LKR ${
                                          seat.price
                                        })${locked ? " • Held by another user" : booked ? " • Booked" : ""}`}
                                      >
                                        {locked ? (
                                          <Lock className="w-2.5 h-2.5 shrink-0" />
                                        ) : (
                                          seat.number
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Center Aisle Spacer */}
                                <div
                                  className="flex items-center justify-center text-[10px] font-bold text-slate-400/70 select-none uppercase tracking-wider shrink-0"
                                  style={{ width: `${aisleWidthPx}px` }}
                                >
                                  |
                                </div>

                                {/* Right Wing Seats (Seats 9-15) */}
                                <div className="flex items-center" style={{ gap: `${seatGapPx}px` }}>
                                  {rightGroup.map((seat) => {
                                    const shortCode = `${seat.row}${seat.number}`;
                                    const locked = isSeatLocked(seat.seatIdentifier, shortCode);
                                    const booked = isSeatBooked(seat.seatIdentifier, shortCode);
                                    return (
                                      <button
                                        key={seat.seatIdentifier}
                                        onClick={() => handleSeatClick(seat)}
                                        onMouseEnter={() => setPreviewHoverSeat(seat)}
                                        onMouseLeave={() => setPreviewHoverSeat(null)}
                                        disabled={booked || locked}
                                        style={{
                                          width: `${seatSizePx}px`,
                                          height: `${seatSizePx}px`,
                                          minWidth: `${seatSizePx}px`,
                                          minHeight: `${seatSizePx}px`,
                                          fontSize: `${seatFontPx}px`,
                                        }}
                                        className={`rounded sm:rounded-md font-bold flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer ${getSeatColorClass(
                                          seat
                                        )}`}
                                        title={`${seat.seatIdentifier} - ${formatCategory(seat.category)} (LKR ${
                                          seat.price
                                        })${locked ? " • Held by another user" : booked ? " • Booked" : ""}`}
                                      >
                                        {locked ? (
                                          <Lock className="w-2.5 h-2.5 shrink-0" />
                                        ) : (
                                          seat.number
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Right Row Letter */}
                                <span
                                  className="text-[10px] sm:text-xs font-black text-amber-500 text-center shrink-0 select-none"
                                  style={{ width: `${rowLabelWidthPx}px` }}
                                >
                                  {rowLetter}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-xs text-slate-400">No seats available for this performance.</p>
              </div>
            )}
          </div>
        ) : (
          /* 3D WebGL Grand Auditorium View: Lazy Loaded with full viewport & responsive touch controls */
          <div className="flex-1 min-h-0 w-full h-full relative touch-none">
            <Auditorium3DView
              allSeats={allSeats}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
              showTitle={showData?.title || show?.title || "Auditorium Performance"}
              location={showData?.location || show?.location || "Colombo Main Stage"}
              activeViewMode={viewMode}
              povSeat={povTargetSeat}
              povTrigger={povTrigger}
              onExitPov={() => setViewMode("3d")}
              onSelectPovSeat={(seat) => setPovTargetSeat(seat)}
            />
          </div>
        )}

        {/* Responsive 2D Seat Preview Floating Bar (Directly accessible above bottom drawer on desktop & mobile) */}
        {viewMode === "2d" && activePreviewSeat && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-20px)] max-w-lg px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-black/90 dark:bg-[#14141e]/95 border border-amber-500/40 shadow-2xl flex items-center justify-between gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate text-xs text-slate-200">
                <span>Row </span>
                <strong className="text-amber-300 font-bold">{activePreviewSeat.row}</strong>
                <span>, Seat </span>
                <strong className="text-amber-300 font-bold">{activePreviewSeat.number}</strong>
                <span className="text-[11px] text-slate-400 ml-1 hidden xs:inline">
                  ({formatCategory(activePreviewSeat.category)} • LKR {activePreviewSeat.price?.toLocaleString()})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handlePreviewIn3D(activePreviewSeat)}
                className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Open interactive 3D auditorium perspective"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Preview in 3D</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewHoverSeat(null);
                  setPovTargetSeat(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Close preview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay when securing seats */}
      {isSecuringSeats && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12121c] p-6 rounded-3xl border border-amber-500/30 shadow-2xl text-center max-w-sm">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Securing your seats...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Holding your seats in real-time and initiating checkout.</p>
          </div>
        </div>
      )}

      {/* Inline Checkout-Gate Auth Modal */}
      <BookingAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        selectedSeats={selectedSeats}
        totalAmount={totalAmount}
        showTitle={show?.title || showData?.title}
        onAuthSuccess={(authedUser) => {
          executePostAuthLock(authedUser);
        }}
      />

      {/* Single-Row Sticky Bottom Booking & Checkout Drawer */}
      <footer className="shrink-0 z-40 bg-white/95 dark:bg-[#161622]/95 border-t border-slate-200 dark:border-white/10 px-3 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Selected count & total price in clean single row */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                Selected ({selectedSeats.length})
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-xs block font-mono">
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")
                  : "No seats selected"}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 shrink-0"></div>

            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">Total</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono whitespace-nowrap">
                LKR {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right: Checkout Button */}
          <button
            onClick={handleProceedBooking}
            disabled={selectedSeats.length === 0 || isProcessing}
            className="btn-theatre-gold px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locking...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Checkout</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
