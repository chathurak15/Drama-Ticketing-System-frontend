"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  QrCode,
  Calendar,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Theater,
  X,
  CreditCard,
  Copy,
  Eye,
  DoorOpen,
  Printer,
  ShieldCheck,
  User,
  Armchair,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getShowsByUser } from "../../services/ShowService";
import { getBookingsByShow, updateStatus } from "../../services/BookingService";

const BookingsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSearch, setShowSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal for inspecting ticket details
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);

  const userId = useAuth().user?.id;
  const qrCodeInstanceRef = useRef(null);
  const qrCodeRunningRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (showQRScanner) {
      const prevInstance = qrCodeInstanceRef.current;
      if (prevInstance) {
        try {
          prevInstance.stop().catch(() => {});
        } catch (err) {}
        try {
          prevInstance.clear();
        } catch (err) {}
        qrCodeInstanceRef.current = null;
        qrCodeRunningRef.current = false;
      }
      qrCodeRunningRef.current = true;
      import("html5-qrcode").then(({ Html5Qrcode }) => {
        if (!isMounted) return;
        const html5QrCode = new Html5Qrcode("qr-scanner-container");
        qrCodeInstanceRef.current = html5QrCode;
        html5QrCode
          .start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText) => {
              if (qrCodeRunningRef.current) {
                qrCodeRunningRef.current = false;
                await html5QrCode.stop().catch(() => {});
                html5QrCode.clear();
                handleQRScan(decodedText);
              }
            },
            () => {}
          )
          .then(() => {})
          .catch((err) => {
            toast.error("Unable to start camera scanner: " + err);
          });
      });
    }
    return () => {
      isMounted = false;
      const html5QrCode = qrCodeInstanceRef.current;
      if (html5QrCode) {
        qrCodeRunningRef.current = false;
        try {
          html5QrCode.stop().catch(() => {});
        } catch (err) {}
        try {
          html5QrCode.clear();
        } catch (err) {}
      }
    };
  }, [showQRScanner]);

  useEffect(() => {
    fetchBookings();
    fetchShows();
  }, [statusFilter, showFilter, currentPage, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBookingsByShow(
        userId,
        currentPage,
        pageSize,
        showFilter,
        searchTerm
      );
      const data = response.data;

      setBookings(data.content || []);
      setTotalElements(data.totalItems || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError("Failed to fetch reservations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      const response = await getShowsByUser({ userId: userId });
      if (!response || !response.data) return;
      setShows(response.data.content || []);
    } catch (err) {
      console.error("Error fetching shows", err);
    }
  };

  const handleQRScan = (result) => {
    if (result) {
      let cleanText = result.trim();
      // If it contains NAATAKA-TICKET-XXX, extract ticket ID
      if (cleanText.includes("NAATAKA-TICKET-")) {
        const parts = cleanText.split("-");
        if (parts.length >= 3) {
          cleanText = parts[2];
        }
      }
      setSearchTerm(cleanText);
      setShowQRScanner(false);
      toast.success("E-Ticket QR scanned! Filtering ticket records.");
    }
  };

  const handleStatusChange = async (bookingId, newStatus = "Complete", currentStatus = null) => {
    if (currentStatus && ["refunded", "refund_requested", "canceled", "cancelled"].includes(currentStatus.toLowerCase())) {
      toast.error("Ticket Voided / Refunded: Admission denied.");
      return;
    }
    try {
      const response = await updateStatus(bookingId, newStatus);
      toast.success(response.data || "Patron check-in confirmed!");
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "";
      if (typeof msg === "string" && msg.includes("Voided")) {
        toast.error("Ticket Voided / Refunded");
      } else {
        toast.error("Failed to update status.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchBookings();
  };

  const handleCopyTicketId = (ticketId, e) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(ticketId);
      toast.success(`Ticket ID ${ticketId} copied to clipboard!`);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "complete":
      case "admitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Admitted</span>
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case "canceled":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case "refunded":
      case "refund_requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[11px] font-medium" title="Unpaid pending checkout session - not counted in revenue">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Unpaid / Pending</span>
          </span>
        );
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    return (
      showSearch === "" ||
      booking.showTitle?.toLowerCase().includes(showSearch.toLowerCase())
    );
  });

  const confirmedCount = filteredBookings.filter(
    (b) =>
      b.status?.toLowerCase() === "confirmed" ||
      b.status?.toLowerCase() === "complete" ||
      b.status?.toLowerCase() === "admitted"
  ).length;

  const canceledCount = filteredBookings.filter(
    (b) => b.status?.toLowerCase() === "canceled" || b.status?.toLowerCase() === "cancelled" || b.status?.toLowerCase() === "refunded"
  ).length;

  // Strict Confirmed Ticket Revenue: Excludes Pending, Expired, Cancelled, and Refunded
  const totalRevenue = filteredBookings
    .filter((b) => {
      const s = b.status?.toLowerCase();
      return s === "confirmed" || s === "complete" || s === "admitted";
    })
    .reduce((sum, b) => sum + (Number(b.displayAmount ?? b.grossTicketShare ?? b.totalAmount) || 0), 0);

  if (loading && bookings.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading reservations &amp; box-office tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 font-medium mb-3">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-[#661F19] text-white rounded-xl hover:bg-[#541612] text-sm font-semibold transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SECTION 1: Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-[#14141e] border border-white/10 border-t-2 border-t-[#FED800] rounded-2xl p-5 shadow-xl hover:border-white/25 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#661F19]/25 border border-[#FED800]/30 flex items-center justify-center text-[#FED800] shadow-lg shadow-[#661F19]/20 flex-shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Bookings
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              {filteredBookings.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">All reservations</p>
          </div>
        </div>

        {/* Confirmed & Admitted */}
        <div className="bg-[#14141e] border border-white/10 border-t-2 border-t-emerald-400 rounded-2xl p-5 shadow-xl hover:border-white/25 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Confirmed / Admitted
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5">
              {confirmedCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Valid attendees</p>
          </div>
        </div>

        {/* Canceled */}
        <div className="bg-[#14141e] border border-white/10 border-t-2 border-t-rose-400 rounded-2xl p-5 shadow-xl hover:border-white/25 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10 flex-shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Canceled
            </p>
            <p className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mt-0.5">
              {canceledCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Voided tickets</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#14141e] border border-white/10 border-t-2 border-t-[#FED800] rounded-2xl p-5 shadow-xl hover:border-white/25 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FED800]/15 border border-[#FED800]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#FED800] text-xl font-black">₨</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              LKR {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Net ticket earnings</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Main Header & Fast QR Scanner CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Box-Office &amp; Admission
            </span>
            <span className="text-xs text-slate-400">Total: {totalElements || bookings.length} Records</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Booking Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Search reservation codes, verify e-tickets with live camera scanner, inspect attendee seats, and manage entry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSearchTerm("");
              setShowQRScanner(!showQRScanner);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#661F19] to-[#8B1E1E] hover:from-[#7e251e] hover:to-[#a12323] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#661F19]/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>{showQRScanner ? "Close Scanner" : "QR Scanner"}</span>
          </button>
        </div>
      </div>

      {/* QR Scanner Camera Card */}
      {showQRScanner && (
        <div className="bg-[#14141e] rounded-2xl border border-white/15 p-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Live E-Ticket Camera Scanner
              </h3>
            </div>
            <button
              onClick={() => setShowQRScanner(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 text-center">
            Position the patron&apos;s digital ticket QR code directly within the frame to verify automatically.
          </p>

          <div className="max-w-md mx-auto bg-black/60 rounded-2xl border border-white/15 p-4 overflow-hidden">
            <div
              id="qr-scanner-container"
              style={{ width: "100%", margin: "auto" }}
              className="rounded-xl overflow-hidden"
            />
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowQRScanner(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel Scanning
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: Filters and Search Bar */}
      <div className="bg-[#14141e]/80 p-4 rounded-xl border border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Ticket ID */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticket ID or patron name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b1b28] border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              className="w-full bg-[#1b1b28] border border-white/10 text-xs font-medium text-slate-200 rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:border-[#FED800] appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Complete">Complete (Admitted)</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Canceled">Canceled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Show Filter */}
          <div className="relative">
            <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              className="w-full bg-[#1b1b28] border border-white/10 text-xs font-medium text-slate-200 rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:border-[#FED800] appearance-none"
              value={showFilter}
              onChange={(e) => setShowFilter(e.target.value)}
            >
              <option value="">All Productions</option>
              {shows.map((show) => (
                <option key={show.showId} value={show.showId}>
                  {show.title} - {show.showDate}
                </option>
              ))}
            </select>
          </div>

          {/* Search / Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 bg-gradient-to-r from-[#661F19] to-[#8B1E1E] hover:from-[#7e251e] hover:to-[#a12323] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#661F19]/25 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setShowFilter("");
                fetchBookings();
              }}
              className="p-2.5 bg-[#1b1b28] hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Reset filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Bookings Table Container */}
      <div className="bg-[#14141e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161624] text-slate-400 font-semibold uppercase tracking-wider border-b-2 border-b-[#FED800]/20">
              <tr>
                <th className="py-3.5 px-5">Ticket &amp; Venue Details</th>
                <th className="py-3.5 px-4">Show &amp; Performance</th>
                <th className="py-3.5 px-4">Seats / Tickets &amp; Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Booking Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const isGeneralAdmission =
                    !booking.theatreName ||
                    booking.theatreName.includes("General") ||
                    booking.theatreName.includes("Open Venue");

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-white/[0.02] transition-colors group hover:shadow-[inset_3px_0_0_#FED800]"
                    >
                      {/* Ticket Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#8B1E1E] border border-[#FED800]/30 flex items-center justify-center text-[#FED800] shadow-md flex-shrink-0">
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-white tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded inline-block">
                                {booking.ticketId}
                              </span>
                              <button
                                onClick={(e) => handleCopyTicketId(booking.ticketId, e)}
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Copy Ticket ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              {isGeneralAdmission ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                                  <Ticket className="w-3 h-3" />
                                  General Admission
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-300">
                                  <Theater className="w-3 h-3 text-[#FED800]" />
                                  {booking.theatreName || "Main Hall"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Show Information */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-[#FED800] transition-colors">
                            {booking.showTitle}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-[#FED800]" />
                              <span>
                                {booking.showDate ? (
                                  <>
                                    {typeof booking.showDate === "string" && booking.showDate.includes("T")
                                      ? booking.showDate.split("T")[0]
                                      : String(booking.showDate).substring(0, 10)}
                                    {booking.showTime ? ` at ${booking.showTime}` : ""}
                                  </>
                                ) : (
                                  booking.showTime || "TBA"
                                )}
                              </span>
                            </div>
                            {booking.location && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span>{booking.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Seats & Amount */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-extrabold text-[#FED800]">
                              LKR {(Number(booking.displayAmount ?? booking.grossTicketShare ?? booking.totalAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/20">
                              {booking.seatCount || booking.seats?.length || 1}{" "}
                              {booking.seatCount === 1 ? "ticket" : "tickets"}
                            </span>
                          </div>

                          {/* Seat Pills / General Admission Pills */}
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {booking.seats && booking.seats.length > 0 ? (
                              booking.seats.map((seat, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/20 text-[11px] text-slate-300"
                                >
                                  <strong className="text-white">{(seat.seatIdentifier || "").replace(/nomal/gi, "Normal")}</strong>
                                  <span className="text-slate-500">LKR {seat.price}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-sky-400 italic">
                                General Entry Tickets
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(booking.status)}
                      </td>

                      {/* Booking Date */}
                      <td className="py-4 px-4">
                        <span className="text-xs text-slate-300 font-medium">
                          {formatDateTime(booking.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Modal Trigger */}
                          <button
                            onClick={() => setSelectedBookingForModal(booking)}
                            className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-[#FED800]/10 hover:text-[#FED800] border border-blue-500/20 transition-all hover:scale-105"
                            title="Inspect e-ticket details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {booking.status?.toLowerCase() !== "complete" &&
                          booking.status?.toLowerCase() !== "canceled" ? (
                            <button
                              onClick={() => handleStatusChange(booking.id, "Complete")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all hover:scale-105 shadow-sm"
                              title="Confirm check-in at door"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Check In</span>
                            </button>
                          ) : booking.status?.toLowerCase() === "complete" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Admitted</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Voided</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-300">No bookings found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? "No bookings match your search query."
                        : "Reservations made by attendees will appear here in real-time."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#1b1b28]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Showing page <span className="font-bold text-white">{currentPage + 1}</span> of{" "}
              <span className="font-bold text-white">{totalPages}</span> • {totalElements || bookings.length} bookings recorded
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all ${
                  currentPage === 0
                    ? "bg-white/5 text-slate-600 cursor-not-allowed"
                    : "bg-[#1b1b28] text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={`px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all ${
                  currentPage === totalPages - 1
                    ? "bg-white/5 text-slate-600 cursor-not-allowed"
                    : "bg-[#1b1b28] text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: E-Ticket Inspection Detail Modal */}
      {selectedBookingForModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 bg-[#661F19] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FED800]">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Patron E-Ticket Inspector</h3>
                  <p className="text-xs text-amber-200 font-mono">
                    #{selectedBookingForModal.ticketId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForModal(null)}
                className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Show Title
                </span>
                <p className="text-base font-extrabold text-white">
                  {selectedBookingForModal.showTitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Performance Date</span>
                  <strong className="text-white">{selectedBookingForModal.showDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Showtime Slot</span>
                  <strong className="text-white">{selectedBookingForModal.showTime || "Standard Schedule"}</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <span className="text-slate-400 text-[10px] block">Venue Hall</span>
                  <strong className="text-white">
                    {selectedBookingForModal.theatreName || selectedBookingForModal.location || "Auditorium"}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Reserved Seats / Tier breakdown
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedBookingForModal.seats?.map((seat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#1b1b28] border border-[#FED800]/20 text-xs font-mono text-white flex items-center gap-1.5"
                    >
                      <Armchair className="w-3 h-3 text-[#FED800]" />
                      <strong>{(seat.seatIdentifier || "").replace(/nomal/gi, "Normal")}</strong>
                      <span className="text-slate-400">LKR {seat.price}</span>
                    </span>
                  ))}
                </div>
              </div>

              <hr className="border-white/10" />

              <div className="flex items-center justify-between p-3.5 bg-black/40 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Ticket Share (Face Value)</span>
                  <span className="text-lg font-black text-[#FED800]">
                    LKR {(Number(selectedBookingForModal.displayAmount ?? selectedBookingForModal.grossTicketShare ?? selectedBookingForModal.totalAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Status</span>
                  {getStatusBadge(selectedBookingForModal.status)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0e0e16] border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  window.open(`/booking/ticket/${selectedBookingForModal.id}`, "_blank");
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Open Full Customer Ticket Page
              </button>

              {selectedBookingForModal.status?.toLowerCase() !== "complete" &&
                selectedBookingForModal.status?.toLowerCase() !== "canceled" && (
                  <button
                    onClick={async () => {
                      await handleStatusChange(selectedBookingForModal.id, "Complete");
                      setSelectedBookingForModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Admit Patron</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsContent;
