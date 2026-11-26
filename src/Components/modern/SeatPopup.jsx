"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Check,
  LayoutGrid,
  Box,
  Eye,
  Info,
  Maximize2,
  DoorOpen,
  Building,
  Footprints,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import {
  getSeatsByShowId,
  getUnavailableSeats,
  lockSeats,
} from "../../services/SeatService";
import { useAuth } from "../../utils/AuthContext";

const Auditorium3DView = dynamic(() => import("./Auditorium3DView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-slate-900/80 rounded-2xl border border-white/10 p-6 text-center animate-pulse">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
      <h3 className="text-sm font-bold text-white mb-1">Loading 3D Auditorium...</h3>
    </div>
  ),
});

export default function ModernSeatPopup({ isOpen, onClose, showId }) {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [backendLockedSeats, setBackendLockedSeats] = useState([]);
  const [showData, setShowData] = useState(null);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(true);

  // View Mode: "2d" | "3d" | "door" | "seat"
  const [viewMode, setViewMode] = useState("2d");
  const [povTargetSeat, setPovTargetSeat] = useState(null);
  const [previewHoverSeat, setPreviewHoverSeat] = useState(null);

  const formatCategory = (category) => {
    if (!category) return "Standard";
    if (category.toLowerCase() === "nomal") return "Normal";
    return category;
  };

  const fetchShowData = useCallback(async () => {
    try {
      setLoadingSeats(true);
      const response = await getSeatsByShowId(showId);
      if (response?.data && response.data.ticketPrices && response.data.ticketPrices.length > 0) {
        setShowData(response.data);
      } else {
        setShowData({
          title: response?.data?.title || "Auditorium Seating Plan",
          showDate: response?.data?.showDate || "2026-11-20",
          showTime: response?.data?.showTime || "06:30 PM",
          location: response?.data?.location || "Main Stage",
          ticketPrices: [
            { category: "VIP", price: 1000, totalSeats: 60, seatsPerRow: 15 },
            { category: "ODC", price: 2000, totalSeats: 40, seatsPerRow: 10 },
            { category: "Balcony", price: 1000, totalSeats: 30, seatsPerRow: 10 },
          ],
        });
      }
    } catch (error) {
      console.warn("Could not load backend seat plan, using default layout:", error);
      setShowData({
        title: "Auditorium Seating Plan",
        ticketPrices: [
          { category: "VIP", price: 1000, totalSeats: 60, seatsPerRow: 15 },
          { category: "ODC", price: 2000, totalSeats: 40, seatsPerRow: 10 },
          { category: "Balcony", price: 1000, totalSeats: 30, seatsPerRow: 10 },
        ],
      });
    } finally {
      setLoadingSeats(false);
    }
  }, [showId]);

  const fetchUnavailableSeats = useCallback(async () => {
    try {
      const response = await getUnavailableSeats(showId);
      setBookedSeats(response.data?.bookedSeats || []);
      setBackendLockedSeats(response.data?.lockedSeats || []);
    } catch (error) {
      setBookedSeats([]);
      setBackendLockedSeats([]);
    }
  }, [showId]);

  useEffect(() => {
    if (!showId || !isOpen) return;
    fetchShowData();
    fetchUnavailableSeats();
    setSelectedSeats([]);
    setViewMode("2d");
    setPovTargetSeat(null);

    const intervalId = setInterval(() => {
      fetchUnavailableSeats();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [showId, isOpen, fetchShowData, fetchUnavailableSeats]);

  // Generate seats array from ticketPrices structure
  const allSeats = useMemo(() => {
    if (!showData || !showData.ticketPrices || showData.ticketPrices.length === 0) return [];

    let seatId = 1;
    const seatsList = [];

    showData.ticketPrices.forEach((ticketCategory, categoryIndex) => {
      const { category, price, totalSeats, seatsPerRow } = ticketCategory;
      const count = Number(totalSeats) || 30;
      const perRow = Number(seatsPerRow) || 10;

      for (let i = 0; i < count; i++) {
        const rowIndex = Math.floor(i / perRow);
        const row = String.fromCharCode(65 + rowIndex + categoryIndex * 4);
        const seatNumber = (i % perRow) + 1;
        const seatIdentifier = `${category}-${row}${seatNumber}`;

        const isBooked = bookedSeats.includes(seatIdentifier);
        const isLocked = backendLockedSeats.includes(seatIdentifier);

        seatsList.push({
          id: seatId++,
          row,
          number: seatNumber,
          price: Number(price) || 1500,
          status: isBooked ? "BOOKED" : isLocked ? "LOCKED" : "AVAILABLE",
          category: category || "Standard",
          seatIdentifier,
        });
      }
    });

    return seatsList;
  }, [showData, bookedSeats, backendLockedSeats]);

  if (!isOpen) return null;

  const isSeatBooked = (identifier) => bookedSeats.includes(identifier);
  const isSeatLocked = (identifier) => backendLockedSeats.includes(identifier);
  const isSeatSelected = (identifier) => selectedSeats.some((s) => s.seatIdentifier === identifier);

  const handleSeatClick = (seat) => {
    if (isSeatBooked(seat.seatIdentifier) || isSeatLocked(seat.seatIdentifier)) {
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
        alert("You can select up to 8 tickets per booking.");
        return;
      }
      setSelectedSeats((prev) => [...prev, seat]);
      setPovTargetSeat(seat);
    }
  };

  const getSeatColorClass = (seat) => {
    if (isSeatSelected(seat.seatIdentifier)) {
      return "bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/50 scale-105 border border-white ring-2 ring-amber-400";
    }
    if (isSeatBooked(seat.seatIdentifier)) {
      return "bg-red-950/60 text-red-500/40 border border-red-900/30 cursor-not-allowed opacity-40";
    }
    if (isSeatLocked(seat.seatIdentifier)) {
      return "bg-orange-950/60 text-orange-400 border border-orange-700/40 cursor-not-allowed opacity-60";
    }

    const cat = (seat.category || "").toLowerCase();
    if (cat.includes("vip")) {
      return "bg-purple-950/60 text-purple-200 border border-purple-500/40 hover:bg-purple-800/80 hover:border-purple-400 hover:scale-105";
    } else if (cat.includes("balcony")) {
      return "bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-800/80 hover:border-emerald-400 hover:scale-105";
    }
    return "bg-[#1f1f2e] text-slate-200 border border-white/15 hover:bg-[#2b2b3e] hover:border-amber-400/60 hover:scale-105";
  };

  const totalAmount = selectedSeats.reduce(
    (sum, seat) => sum + (Number(seat.price) || 0),
    0
  );

  const handleProceedBooking = async () => {
    if (isProcessing) return;

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to proceed.");
      return;
    }

    if (!user) {
      setShowLoginWarning(true);
      return;
    }

    setIsProcessing(true);

    const seatKeys = selectedSeats.map((s) => s.seatIdentifier);

    const lockPayload = {
      showId: Number(showId),
      seatIds: seatKeys,
      seats: seatKeys,
      userId: user.id,
    };

    try {
      const res = await lockSeats(lockPayload);
      const lockData = res?.data || {};

      const bookingData = {
        showId: Number(showId),
        seats: selectedSeats.map((s) => ({
          id: s.id,
          seatIdentifier: s.seatIdentifier,
          price: Number(s.price),
          category: s.category,
        })),
        totalAmount: totalAmount,
        userId: user.id,
        lockId: lockData.lockId,
        lockExpiresAt: lockData.lockExpiresAt,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("nataka_booking", JSON.stringify(bookingData));
      }
      setIsProcessing(false);
      router.push("/booking");
      onClose();
    } catch (err) {
      setIsProcessing(false);
      if (err.response?.status === 409) {
        const conflictData = err.response.data || {};
        const unavailable = conflictData.unavailableSeats || [];
        const seatNames = unavailable.length > 0 ? unavailable.join(", ") : "one or more seats";
        toast.error(`Selected seat(s) ${seatNames} are no longer available.`);

        if (unavailable.length > 0) {
          setSelectedSeats((prev) =>
            prev.filter(
              (s) =>
                !unavailable.includes(s.seatIdentifier) &&
                !unavailable.includes(`${s.row}${s.number}`)
            )
          );
        }
        await fetchUnavailableSeats();
      } else {
        toast.error(err.response?.data?.message || "Failed to secure seat hold. Please try again.");
        await fetchUnavailableSeats();
      }
    }
  };

  const categoriesMap = allSeats.reduce((acc, seat) => {
    if (!acc[seat.category]) acc[seat.category] = [];
    acc[seat.category].push(seat);
    return acc;
  }, {});

  const handleOpenSeatPov = (seat) => {
    setPovTargetSeat(seat);
    setViewMode("seat");
  };

  const handleOpenDoorView = (seat = null) => {
    if (seat) setPovTargetSeat(seat);
    setViewMode("door");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121a] border border-white/15 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header with Title & Multi-Perspective Mode Toggle */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#161622]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Interactive Seating Layout
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">10-Min Hold Security</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              {showData?.title || "Select Your Seats"}
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* View Mode Toggle Switcher: 2D Plan, 3D Theater, Enter Door, View in Seat */}
            <div className="flex items-center bg-[#0d0d16] border border-white/15 rounded-xl p-1 shadow-inner flex-wrap">
              {/* 1. 2D Plan */}
              <button
                onClick={() => setViewMode("2d")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "2d"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>2D Plan</span>
              </button>

              {/* 2. 3D Theater */}
              <button
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "3d"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>3D Theater</span>
              </button>

              {/* 3. Enter Door */}
              <button
                onClick={() => setViewMode("door")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "door"
                    ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="View from Rear Auditorium Entrance"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enter Door</span>
                <span className="sm:hidden">Door</span>
              </button>

              {/* 4. View in Seat */}
              <button
                onClick={() => {
                  const target = povTargetSeat || selectedSeats[0] || allSeats[0];
                  if (target) setPovTargetSeat(target);
                  setViewMode("seat");
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "seat" || viewMode === "pov"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                }`}
                title="Sit inside chosen seat and view the live stage"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View in Seat</span>
                <span className="sm:hidden">Seat POV</span>
                {selectedSeats.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                router.push(`/show/${showId}/seats`);
                onClose();
              }}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors flex items-center gap-1"
              title="Open dedicated full-screen seating page"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">Full Page</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend & 2D/3D Context bar */}
        <div className="px-5 py-2.5 bg-[#0e0e16] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#1f1f2e] border border-white/20 inline-block"></span>
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-white inline-block"></span>
              <span className="text-amber-300 font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-950 border border-red-800 inline-block"></span>
              <span className="text-slate-400">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-950 border border-purple-500 inline-block"></span>
              <span className="text-purple-300">VIP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500 inline-block"></span>
              <span className="text-emerald-300">Balcony</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-amber-400 font-medium">
              Max 8 tickets per transaction
            </span>
            {viewMode === "2d" && (
              <button
                onClick={() => setViewMode("3d")}
                className="hidden md:flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold"
              >
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to 3D Experience</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Body: 2D Grid OR 3D WebGL Scene */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {viewMode === "2d" ? (
            /* 2D Seating Layout Canvas */
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center">
              {/* Proscenium Stage Indicator */}
              <div className="w-full max-w-xl mb-6 text-center">
                <div className="h-2 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full shadow-lg shadow-amber-500/50 mb-2"></div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90 bg-black/60 px-4 py-1 rounded-md border border-amber-500/30 inline-block">
                  AUDITORIUM STAGE • ප්‍රධාන වේදිකාව
                </span>
              </div>

              {loadingSeats ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading auditorium layout...</p>
                </div>
              ) : Object.keys(categoriesMap).length > 0 ? (
                <div className="w-full max-w-3xl space-y-6">
                  {Object.keys(categoriesMap).map((catName) => {
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
                        className="p-3 sm:p-5 rounded-2xl bg-[#14141e] border border-white/[0.08] shadow-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                              {formatCategory(catName)} Tier
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              (LKR {categorySeats[0]?.price?.toLocaleString() || "1,500"})
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {categorySeats.filter((s) => s.status === "AVAILABLE").length} Seats Free
                          </span>
                        </div>

                        {/* Raked Rows with Center Aisle */}
                        <div className="w-full overflow-x-auto touch-pan-x scrollbar-thin py-2">
                          <div className="min-w-max flex flex-col items-center mx-auto space-y-2.5">
                          {sortedRows.map((rowLetter) => {
                            const rowSeats = seatsByRow[rowLetter].sort((a, b) => a.number - b.number);
                            const hasAisle = rowSeats.length > 8;
                            const midpoint = Math.ceil(rowSeats.length / 2);
                            const leftGroup = hasAisle ? rowSeats.slice(0, midpoint) : rowSeats;
                            const rightGroup = hasAisle ? rowSeats.slice(midpoint) : [];

                            return (
                              <div
                                key={rowLetter}
                                className="flex items-center justify-center gap-2 w-full min-w-max"
                              >
                                <span className="w-6 text-xs font-extrabold text-amber-400 text-right shrink-0">
                                  {rowLetter}
                                </span>

                                {/* Left Wing Seats */}
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  {leftGroup.map((seat) => (
                                    <button
                                      key={seat.seatIdentifier}
                                      onClick={() => handleSeatClick(seat)}
                                      onMouseEnter={() => setPreviewHoverSeat(seat)}
                                      onMouseLeave={() => setPreviewHoverSeat(null)}
                                      disabled={
                                        isSeatBooked(seat.seatIdentifier) || isSeatLocked(seat.seatIdentifier)
                                      }
                                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold flex items-center justify-center transition-all duration-150 shrink-0 ${getSeatColorClass(
                                        seat
                                      )}`}
                                      title={`${seat.seatIdentifier} - ${formatCategory(seat.category)} (LKR ${
                                        seat.price
                                      })`}
                                    >
                                      {seat.number}
                                    </button>
                                  ))}
                                </div>

                                {/* Center Aisle Spacer */}
                                {hasAisle && (
                                  <div className="w-5 sm:w-8 flex items-center justify-center text-[9px] font-semibold text-slate-400 select-none uppercase tracking-wider">
                                    •
                                  </div>
                                )}

                                {/* Right Wing Seats */}
                                {hasAisle && (
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    {rightGroup.map((seat) => (
                                      <button
                                        key={seat.seatIdentifier}
                                        onClick={() => handleSeatClick(seat)}
                                        onMouseEnter={() => setPreviewHoverSeat(seat)}
                                        onMouseLeave={() => setPreviewHoverSeat(null)}
                                        disabled={
                                          isSeatBooked(seat.seatIdentifier) || isSeatLocked(seat.seatIdentifier)
                                        }
                                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold flex items-center justify-center transition-all duration-150 shrink-0 ${getSeatColorClass(
                                          seat
                                        )}`}
                                        title={`${seat.seatIdentifier} - ${formatCategory(seat.category)} (LKR ${
                                          seat.price
                                        })`}
                                      >
                                        {seat.number}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                <span className="w-6 text-xs font-extrabold text-amber-400 text-left shrink-0">
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
                <div className="py-20 text-center">
                  <p className="text-xs text-slate-400">No seats available for this show performance.</p>
                </div>
              )}

              {/* 2D Floating Interactive Bar on Hover / Selection */}
              {(() => {
                const activeBarSeat =
                  (previewHoverSeat && previewHoverSeat.status === "AVAILABLE" && previewHoverSeat) ||
                  (povTargetSeat && povTargetSeat.status === "AVAILABLE" && povTargetSeat) ||
                  (selectedSeats.length > 0 ? selectedSeats[selectedSeats.length - 1] : null);

                if (!activeBarSeat) return null;

                return (
                  <div className="mt-4 px-4 py-2.5 rounded-xl bg-black/80 border border-amber-500/35 flex flex-wrap items-center gap-3 backdrop-blur-md animate-in fade-in duration-150">
                    <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs text-slate-200">
                      Seat:{" "}
                      <strong className="text-amber-300">
                        Row {activeBarSeat.row}, Seat {activeBarSeat.number}
                      </strong>{" "}
                      ({formatCategory(activeBarSeat.category)} • LKR {activeBarSeat.price?.toLocaleString()})
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleOpenDoorView(activeBarSeat)}
                        className="text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enter Door</span>
                      </button>
                      <button
                        onClick={() => handleOpenSeatPov(activeBarSeat)}
                        className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View in Seat</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* 3D Grand Auditorium WebGL View */
            <div className="w-full flex-1 min-h-[460px] sm:min-h-[520px] relative">
              <Auditorium3DView
                allSeats={allSeats}
                selectedSeats={selectedSeats}
                onSeatClick={handleSeatClick}
                showTitle={showData?.title || "Auditorium Performance"}
                location={showData?.location || "Colombo Main Stage"}
                activeViewMode={viewMode}
                povSeat={povTargetSeat}
                onExitPov={() => setViewMode("3d")}
                onSelectPovSeat={(seat) => setPovTargetSeat(seat)}
              />
            </div>
          )}
        </div>

        {/* Login Warning Banner */}
        {showLoginWarning && (
          <div className="bg-amber-950/95 border-t border-amber-600/40 p-3 flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You must sign in to secure and pay for your seats.</span>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* Footer Summary & Booking Checkout Bar */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-[#161622] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left flex-wrap">
            <div>
              <span className="text-[11px] text-slate-400 block">Selected</span>
              <span className="text-sm font-bold text-white">
                {selectedSeats.length} {selectedSeats.length === 1 ? "Seat" : "Seats"}
                {selectedSeats.length > 0 && (
                  <span className="text-xs text-amber-400 ml-1.5 font-mono">
                    ({selectedSeats.map((s) => s.seatIdentifier).join(", ")})
                  </span>
                )}
              </span>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            <div>
              <span className="text-[11px] text-slate-400 block">Total Price</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                LKR {totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Quick Actions for Selected Seat */}
            {selectedSeats.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => {
                    setPovTargetSeat(selectedSeats[0]);
                    setViewMode("door");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold transition-all"
                  title="View from Entrance Door"
                >
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enter Door</span>
                </button>

                <button
                  onClick={() => {
                    setPovTargetSeat(selectedSeats[0]);
                    setViewMode("seat");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all"
                  title="Sit inside your selected seat"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View in Seat {selectedSeats[0].seatIdentifier}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleProceedBooking}
              disabled={selectedSeats.length === 0 || isProcessing}
              className="btn-theatre-gold w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-amber-500/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking Seats...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Checkout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
