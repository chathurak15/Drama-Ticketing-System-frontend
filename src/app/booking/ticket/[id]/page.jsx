"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../../../Components/modern/Header";
import ModernFooter from "../../../../Components/modern/Footer";
import CustomerPaymentReceipt from "../../../../Components/Booking/CustomerPaymentReceipt";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  CheckCircle2,
  ShieldCheck,
  Printer,
  MessageCircle,
  Ticket,
  ChevronLeft,
  DoorOpen,
  XCircle,
  Receipt,
  Sparkles,
} from "lucide-react";
import { getBooking, getBookingReceipt } from "../../../../services/BookingService";
import { getShowById } from "../../../../services/ShowService";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import {
  generateTicketPdf,
  generateReceiptPdf,
  loadLocalImageAsDataUrl,
  extractQrDataUrl,
} from "../../../../utils/ticketPdfGenerator";
import { getSamplePreviewReceipt } from "../../../../data/previewCatalog";

export default function TicketViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;

  const initialView = searchParams?.get("view") === "receipt" ? "receipt" : "ticket";
  const [activeTab, setActiveTab] = useState(initialView);
  const [bookingData, setBookingData] = useState(null);
  const [showData, setShowData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const ticketRef = useRef(null);
  const qrCanvasRef = useRef(null);

  const isPreview = String(id).toLowerCase() === "preview" || String(id).startsWith("PREVIEW");

  useEffect(() => {
    if (!id) return;

    if (isPreview) {
      const sampleReceipt = getSamplePreviewReceipt();
      setReceiptData(sampleReceipt);
      setBookingData({
        id: 192,
        ticketId: sampleReceipt.bookingReference || "WEN-001-C04-00192",
        totalAmount: sampleReceipt.grandTotalLkr || 3727.5,
        baseTicketTotal: sampleReceipt.ticketSubtotalLkr || 3500.0,
        buyerFeeAmount: sampleReceipt.serviceFeeLkr || 227.5,
        appliedBuyerFeePercent: 6.5,
        seatCount: 2,
        status: "Confirmed",
        paymentStatus: "PAID",
        theatreName: sampleReceipt.theatreVenue || "Lionel Wendt Memorial Theatre",
        showTitle: sampleReceipt.dramaTitleDisplay || "කැලණි පාලම (Kelani Palama)",
        showTime: sampleReceipt.showTime || "06:30 PM",
        showDate: sampleReceipt.showDate || "2026-12-05",
        location: sampleReceipt.venueAndCity || "Lionel Wendt Memorial Theatre, Colombo 07",
        seats: [
          { seatIdentifier: "C4", price: 1750 },
          { seatIdentifier: "C5", price: 1750 },
        ],
        customerName: sampleReceipt.buyerName || "Chathura Kavindu",
        customerEmail: sampleReceipt.buyerEmail || "buyer@naataka.lk",
        customerPhone: sampleReceipt.buyerMobile || "+94 77 123 4567",
        receipt: sampleReceipt,
      });

      setShowData({
        title: sampleReceipt.dramaTitleDisplay || "කැලණි පාලම (Kelani Palama)",
        showDate: sampleReceipt.showDate || "2026-12-05",
        showTime: sampleReceipt.showTime || "06:30 PM",
        location: sampleReceipt.venueAndCity || "Lionel Wendt Memorial Theatre, Colombo 07",
        theatre: {
          name: sampleReceipt.theatreVenue || "Lionel Wendt Memorial Theatre",
          entranceGate: "Main Gate",
          doorDetails: "Door A & B",
        },
        city: { cityName: "Colombo 07" },
      });
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const bookingRes = await getBooking(id);
        if (bookingRes?.data) {
          const bData = bookingRes.data;
          setBookingData(bData);
          if (bData.receipt) {
            setReceiptData(bData.receipt);
          }

          if (bData.showId) {
            const showRes = await getShowById(bData.showId);
            if (showRes?.data) setShowData(showRes.data);
          }
        }

        // Also attempt to fetch full card-absent receipt DTO from backend
        try {
          const receiptRes = await getBookingReceipt(id);
          if (receiptRes?.data) {
            setReceiptData(receiptRes.data);
          }
        } catch (rErr) {
          console.warn("Could not fetch dedicated receipt endpoint, fallback to booking data:", rErr);
        }
      } catch (err) {
        console.error("Failed to load ticket", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isPreview]);

  /**
   * Direct Programmatic PDF Generation via jsPDF
   * Switches cleanly between Ticket Pass PDF and Official 9-Section Receipt PDF
   */
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      const qrDataUrl = extractQrDataUrl(
        qrCanvasRef.current || document.getElementById("ticket-qr-canvas") || document.getElementById("receipt-qr-canvas")
      );
      const logoDataUrl = await loadLocalImageAsDataUrl("/logo-nataka-white.png");

      if (activeTab === "receipt") {
        const pdf = await generateReceiptPdf({
          receiptData: receiptData || bookingData?.receipt,
          qrDataUrl,
          logoDataUrl,
        });
        const ref = receiptData?.bookingReference || bookingData?.ticketId || id;
        pdf.save(`Naataka_Receipt_${ref}.pdf`);
        toast.success("Official Payment Receipt PDF downloaded!");
      } else {
        const pdf = await generateTicketPdf({
          bookingData,
          showData,
          qrDataUrl,
          logoDataUrl,
        });
        pdf.save(`Naataka_Ticket_${bookingData?.ticketId || id}.pdf`);
        toast.success("e-Ticket PDF downloaded successfully!");
      }
    } catch (err) {
      console.error("Direct PDF generation failed:", err);
      toast.error("Failed to generate PDF. You can also print the page directly.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handlePrintReceipt = () => {
    setActiveTab("receipt");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
    }, 150);
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const shareText = `[Naataka.lk Verified E-Ticket]\nShow: ${
        showData?.title || bookingData?.showTitle || "Drama Show"
      }\nTicket ID: ${bookingData?.ticketId || id}\nDate: ${
        showData?.showDate || bookingData?.showDate || ""
      }\nVenue: ${showData?.location || bookingData?.theatreName || ""}\nView verified receipt & ticket: ${
        window.location.href
      }`;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <>
        <div className="no-print">
          <ModernHeader />
        </div>
        <main className="min-h-screen bg-[#0d0d12] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-300">
              Generating verified e-ticket & payment receipt...
            </p>
          </div>
        </main>
        <div className="no-print">
          <ModernFooter />
        </div>
      </>
    );
  }

  if (!bookingData) {
    return (
      <>
        <div className="no-print">
          <ModernHeader />
        </div>
        <main className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 text-center rounded-2xl border border-white/10">
            <Ticket className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
            <h2 className="text-xl font-bold text-white mb-2">Ticket Not Found</h2>
            <p className="text-xs text-slate-400 mb-6">
              Could not retrieve ticket details for reference #{id}.
            </p>
            <Link
              href="/"
              className="btn-theatre-gold px-6 py-2 rounded-full text-xs font-bold inline-block"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <div className="no-print">
          <ModernFooter />
        </div>
      </>
    );
  }

  const seatsList =
    bookingData.seats?.map((s) => s.seatIdentifier).filter(Boolean).join(", ") ||
    "N/A";

  const totalPaid = Number(bookingData.totalAmount || 0);

  // Compute Base Face Value & Buyer Fee
  let faceValue = 0;
  if (
    bookingData.baseTicketTotal !== undefined &&
    bookingData.baseTicketTotal !== null &&
    Number(bookingData.baseTicketTotal) > 0
  ) {
    faceValue = Number(bookingData.baseTicketTotal);
  } else if (
    bookingData.seats &&
    bookingData.seats.length > 0 &&
    bookingData.seats.some((s) => Number(s.price) > 0)
  ) {
    faceValue = bookingData.seats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  } else if (bookingData.buyerFeeAmount && Number(bookingData.buyerFeeAmount) > 0) {
    faceValue = Math.max(0, totalPaid - Number(bookingData.buyerFeeAmount));
  } else if (bookingData.appliedBuyerFeePercent && Number(bookingData.appliedBuyerFeePercent) > 0) {
    const pct = Number(bookingData.appliedBuyerFeePercent);
    faceValue = Math.round((totalPaid / (1 + pct / 100)) * 100) / 100;
  } else {
    faceValue = totalPaid;
  }

  let buyerFeePercent = Number(bookingData.appliedBuyerFeePercent || 0);
  let buyerFeeAmount = Number(bookingData.buyerFeeAmount || 0);

  if (buyerFeePercent > 0 && (!buyerFeeAmount || buyerFeeAmount <= 0)) {
    buyerFeeAmount = Math.max(0, totalPaid - faceValue);
  } else if (!buyerFeePercent && buyerFeeAmount > 0 && faceValue > 0) {
    buyerFeePercent = Math.round((buyerFeeAmount / faceValue) * 100);
  }

  const hasConvenienceFee = buyerFeePercent > 0 && buyerFeeAmount > 0;

  const qrValue =
    (bookingData.status || "").toLowerCase() === "refunded"
      ? `VOIDED-${bookingData.ticketId || id}`
      : `NAATAKA-TICKET-${bookingData.ticketId || id}-${bookingData.userId || ""}`;

  return (
    <>
      {/* Print Isolation & Formatting CSS */}
      <style>{`
        @media print {
          /* Hide everything except the active card */
          header,
          footer,
          nav,
          .no-print,
          .Toastify,
          [role="alert"],
          button,
          .chat-bot-container {
            display: none !important;
            visibility: hidden !important;
          }

          body, html, main {
            background: transparent !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }

          .ticket-print-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          #printable-ticket-card, #printable-receipt-card {
            visibility: visible !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            margin: 0 auto !important;
            max-width: 650px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #printable-ticket-card *, #printable-receipt-card * {
            visibility: visible !important;
          }
        }
      `}</style>

      <div className="no-print">
        <ModernHeader />
      </div>

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-8 lg:py-12 transition-colors duration-200">
        <div className="ticket-print-wrapper container mx-auto px-4 max-w-3xl">
          {/* Top Actions Bar (Hidden in Print) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Share ticket via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                title="Print official card-absent payment receipt"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Print / Download Receipt</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer"
                title="Print current active view"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn-theatre-gold px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                title="Download verified PDF document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? "Generating..." : activeTab === "receipt" ? "Download Receipt PDF" : "Download Ticket PDF"}</span>
              </button>
            </div>
          </div>

          {/* Tab Switcher: E-Ticket Pass vs Payment Receipt */}
          <div className="no-print flex items-center justify-center p-1 rounded-2xl bg-slate-200/80 dark:bg-white/10 max-w-md mx-auto mb-6">
            <button
              onClick={() => setActiveTab("ticket")}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ticket"
                  ? "bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Verified E-Ticket Pass</span>
            </button>
            <button
              onClick={() => setActiveTab("receipt")}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "receipt"
                  ? "bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-amber-500" />
              <span>Payment Receipt (9-Section)</span>
            </button>
          </div>

          {/* TAB 1: VERIFIED E-TICKET CARD */}
          {activeTab === "ticket" && (
            <div
              id="printable-ticket-card"
              ref={ticketRef}
              className="rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-gradient-to-b from-[#1b1016] via-[#13131c] to-[#0e0e16]"
            >
              {/* Ticket Header Curtain Band */}
              <div className="p-6 bg-gradient-to-r from-[#661F19] via-[#85261F] to-[#661F19] text-white flex items-center justify-between border-b border-amber-500/30">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-nataka-white.png"
                    alt="Naataka.lk"
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      e.target.src = "/assets/logo nataka white.png";
                    }}
                  />
                </div>

                <div className="text-right">
                  {(() => {
                    const bStatus = (bookingData.status || "").toLowerCase();
                    if (bStatus === "refunded") {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-400/50 text-[11px] font-bold text-rose-300">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>VOIDED / REFUNDED</span>
                        </span>
                      );
                    }
                    if (bStatus === "refund_requested") {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/90 border border-purple-400/50 text-[11px] font-bold text-purple-300">
                          <Clock className="w-3 h-3 text-purple-400" />
                          <span>REFUND UNDER REVIEW</span>
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>CONFIRMED E-TICKET</span>
                      </span>
                    );
                  })()}
                  <p className="text-[10px] text-amber-200/80 mt-1 font-mono">
                    ID: #{bookingData.ticketId || id}
                  </p>
                </div>
              </div>

              {/* Ticket Main Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    {showData?.drama?.title ? `Drama: ${showData.drama.title}` : "Sri Lankan Stage Performance"}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                    {showData?.title || bookingData.showTitle || "Stage Drama Show"}
                  </h1>
                </div>

                {/* Show Details Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Show Date</span>
                      <span className="font-bold text-white">
                        {showData?.showDate ? new Date(showData.showDate).toLocaleDateString() : (bookingData.showDate || "Date TBA")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Curtain Time</span>
                      <span className="font-bold text-white">
                        {showData?.showTime || bookingData.showTime || "06:30 PM"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 col-span-2 pt-2 border-t border-white/5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Theatre Auditorium</span>
                      <span className="font-bold text-white">
                        {bookingData.theatreName || showData?.location || "Lionel Wendt Memorial Theatre"}, {showData?.city?.cityName || "Colombo"}
                      </span>
                    </div>
                  </div>

                  {showData?.theatre?.doorDetails && (
                    <div className="flex items-start gap-2.5 col-span-2 pt-2 border-t border-white/5">
                      <DoorOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[10px] block">Auditorium Door Entry</span>
                        <span className="font-bold text-amber-300">
                          Gate: {showData.theatre.entranceGate || "Main Entrance"} • Doors: {showData.theatre.doorDetails}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seat Details & QR Code Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-[#0b0b12] border border-white/10">
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Auditorium Seats
                      </span>
                      <span className="text-lg font-extrabold text-amber-400 tracking-wide">
                        {seatsList}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-1 justify-center sm:justify-start">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Seats Count</span>
                        <span className="font-bold text-white">
                          {bookingData.seatCount || bookingData.seats?.length || 1}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Paid</span>
                        <span className="font-bold text-amber-300">
                          LKR {totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scannable HTML5 Canvas QR Code */}
                  <div className="relative p-2.5 bg-white rounded-2xl shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
                    <QRCodeCanvas
                      id="ticket-qr-canvas"
                      ref={qrCanvasRef}
                      value={qrValue}
                      size={240}
                      style={{ width: "115px", height: "115px", display: "block" }}
                      level="H"
                      includeMargin={true}
                      marginSize={1}
                    />
                    {(bookingData.status || "").toLowerCase() === "refunded" && (
                      <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-[9px] font-black text-white tracking-wider uppercase border border-rose-400 px-1 py-0.5 rounded bg-rose-700 shadow">
                          VOIDED / REFUNDED
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itemized Payment Breakdown Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Ticket Face Value:</span>
                    <span className="font-semibold text-white">
                      LKR {faceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {hasConvenienceFee && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Online Booking Service Fee ({buyerFeePercent}%):</span>
                      <span className="font-semibold text-white">
                        LKR {buyerFeeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-bold">
                    <span className="text-white">Total Paid:</span>
                    <span className="text-amber-400">
                      LKR {totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Gate Entry & Anti-Counterfeit Notice */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <p className="text-[11px] leading-relaxed">
                      Present this QR code directly on your mobile device or printed ticket at the theatre entrance gate. Each ticket carries a unique cryptographic ID and can only be scanned once.
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed border-t border-amber-500/20 pt-1.5">
                      Digital QR e-tickets are valid for single entry at the venue. Full ticket face-value refunds are issued to the original payment card within 5–7 working days if an event is cancelled or rescheduled by the organizer. Buyer cancellations are non-refundable within 24 hours of showtime. View full policy at https://naataka.lk/refund-policy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Perforated Divider Visual */}
              <div className="relative h-6 flex items-center justify-between px-2">
                <div className="w-5 h-5 rounded-full bg-[#0d0d12] -ml-5"></div>
                <div className="flex-1 border-b-2 border-dashed border-white/15 mx-2"></div>
                <div className="w-5 h-5 rounded-full bg-[#0d0d12] -mr-5"></div>
              </div>

              {/* Ticket Stub Footer */}
              <div className="p-4 bg-[#0a0a0f] text-center text-[10px] text-slate-400">
                Issued by <strong className="text-white">Zeylex Digital Solutions</strong> (Naataka.lk) | Customer Support: support@naataka.lk | hello@zeylex.com | Tel: <a href="tel:+94741550909" className="text-amber-400 font-bold hover:underline">+94 74 155 0909</a>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL 9-SECTION PAYMENT RECEIPT */}
          {activeTab === "receipt" && (
            <CustomerPaymentReceipt
              receipt={receiptData}
              booking={bookingData}
              show={showData}
              isPreview={isPreview}
              onPrint={handlePrint}
              onDownload={handleDownloadPDF}
            />
          )}
        </div>
      </main>

      <div className="no-print">
        <ModernFooter />
      </div>
    </>
  );
}
