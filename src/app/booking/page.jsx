/* global process */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import PaymentSchemeBadges from "../../Components/common/PaymentSchemeBadges";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Lock,
  Ticket,
  Info,
  CheckCircle2,
  X,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getShowById } from "../../services/ShowService";
import { addBooking, initiatePayment } from "../../services/BookingService";
import axios from "../../api/axiosInstance";
import { getActiveCommission } from "../../services/CommissionService";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import { toast } from "react-toastify";
import { getMyLock, releaseLock } from "../../services/SeatService";
import { isPreviewMode } from "../../data/previewCatalog";

export default function BookingCheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { payhereApprovedLive } = usePlatformConfig();

  const [bookingData, setBookingData] = useState(null);
  const [showData, setShowData] = useState(null);
  const [activeCommission, setActiveCommission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(590);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    getActiveCommission()
      .then((res) => {
        if (res?.data) setActiveCommission(res.data);
      })
      .catch((err) => console.warn("Could not load commission model", err));
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("nataka_booking");
      if (!stored) {
        if (!user) {
          toast.warn("Please sign in to complete your ticket booking");
          router.push("/login");
          return;
        }
        toast.warn("No active seat selection found. Please select seats first.");
        router.push("/shows");
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (!parsed.showId) {
          router.push("/shows");
          return;
        }

        if (parsed.isPreview || String(parsed.showId).startsWith("preview-")) {
          setBookingData(parsed);
          setShowData({
            showId: parsed.showId,
            title: parsed.showTitle || "Sri Lankan Stage Drama",
            drama: { title: parsed.dramaTitle || parsed.showTitle || "Stage Drama" },
            showDate: parsed.showDate || "2026-12-15",
            showTime: parsed.showTime || parsed.selectedTime || "06:30 PM",
            location: parsed.venue || "Lionel Wendt Memorial Theatre",
            city: { cityName: parsed.city || "Colombo" }
          });
          setPageLoading(false);
          return;
        }

        if (!user) {
          toast.warn("Please sign in to complete your ticket booking");
          router.push("/login");
          return;
        }

        const slot = parsed.selectedTime || parsed.showTimeSlot || null;

        getMyLock(parsed.showId, slot)
          .then((res) => {
            const lockData = res?.data;
            const nowMs = Date.now();
            const expiresMs = lockData?.lockExpiresAt ? new Date(lockData.lockExpiresAt).getTime() : 0;

            if (!lockData?.hasActiveLock || expiresMs <= nowMs) {
              toast.error("Your seat reservation hold has expired or is invalid. Please select your seats again.");
              sessionStorage.removeItem("nataka_booking");
              router.push(`/show/${parsed.showId}/seats`);
              return;
            }

            const updatedBooking = {
              ...parsed,
              lockId: lockData.lockId,
              lockExpiresAt: lockData.lockExpiresAt,
            };
            setBookingData(updatedBooking);
            sessionStorage.setItem("nataka_booking", JSON.stringify(updatedBooking));

            const remainingSecs = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
            setTimeLeft(remainingSecs);

            getShowById(parsed.showId)
              .then((showRes) => {
                if (showRes?.data) setShowData(showRes.data);
              })
              .catch((err) => console.error(err))
              .finally(() => setPageLoading(false));
          })
          .catch((err) => {
            console.warn("Could not verify lock with server, using local session state:", err);
            setBookingData(parsed);
            getShowById(parsed.showId)
              .then((showRes) => {
                if (showRes?.data) setShowData(showRes.data);
              })
              .catch((e) => console.error(e))
              .finally(() => setPageLoading(false));
          });
      } catch (e) {
        console.error(e);
        setPageLoading(false);
        router.push("/shows");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!bookingData?.lockExpiresAt) return;

    const expiryMs = new Date(bookingData.lockExpiresAt).getTime();

    const updateTimer = () => {
      const nowMs = Date.now();
      const remaining = Math.max(0, Math.floor((expiryMs - nowMs) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        toast.error("Your 10-minute seat reservation has expired. Please select seats again.");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("nataka_booking");
        }
        if (bookingData.showId && !String(bookingData.showId).startsWith("preview-")) {
          releaseLock(bookingData.showId, bookingData.selectedTime || bookingData.showTimeSlot || null).catch(() => {});
        }
        router.push(bookingData.showId ? `/show/${bookingData.showId}/seats` : "/shows");
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [bookingData?.lockExpiresAt, bookingData?.showId, bookingData?.selectedTime, bookingData?.showTimeSlot, router]);

  const handleBackToSeatMap = async () => {
    if (bookingData?.showId) {
      if (!String(bookingData.showId).startsWith("preview-")) {
        try {
          await releaseLock(
            bookingData.showId,
            bookingData.selectedTime || bookingData.showTimeSlot || null
          );
        } catch (e) {
          console.warn("Could not release locks on exit:", e);
        }
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("nataka_booking");
      }
      router.push(`/show/${bookingData.showId}/seats`);
    } else {
      router.back();
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleSecureCheckout = async () => {
    if (isProcessing) return;
    if (!consentAgreed) {
      toast.warn("Please agree to the Terms & Conditions and Refund Policy to proceed with checkout.");
      return;
    }

    const isPreview = bookingData?.isPreview ||
      String(bookingData?.showId).startsWith("preview-") ||
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PREVIEW_MODE === "true");

    if (isPreview) {
      setShowPreviewModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      const baseTicketTotal =
        (bookingData.seats || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0) ||
        Number(bookingData.totalAmount) ||
        0;

      const buyerFeePercent =
        activeCommission?.buyerFeePercent != null ? Number(activeCommission.buyerFeePercent) : 6.5;
      const buyerFeeAmount = buyerFeePercent > 0 ? (baseTicketTotal * buyerFeePercent) / 100 : 0;
      const totalPayable = baseTicketTotal + buyerFeeAmount;

      const formattedSeats = (bookingData.seats || []).map((s) => {
        if (typeof s === "string") {
          return {
            seatIdentifier: s,
            price:
              bookingData.totalAmount && bookingData.seats.length > 0
                ? Number(bookingData.totalAmount) / bookingData.seats.length
                : 0,
          };
        }
        return {
          seatIdentifier: s.seatIdentifier || s.name || (s.id ? `Seat-${s.id}` : "GA"),
          price: Number(s.price) || 0,
        };
      });

      const bookingPayload = {
        showId: Number(bookingData.showId),
        userId: user.id,
        seats: formattedSeats,
        totalAmount: totalPayable,
        commissionFee: buyerFeeAmount,
        showTimeSlot: bookingData.selectedTime || bookingData.showTimeSlot || showData?.showTime || null,
      };

      let initData = null;
      try {
        const initRes = await initiatePayment(bookingPayload);
        initData = initRes?.data;
      } catch (initErr) {
        if (
          initErr?.response?.status === 404 &&
          (initErr?.response?.data?.error === "Not Found" || typeof initErr?.response?.data === "string")
        ) {
          const bookingRes = await addBooking(bookingPayload);
          initData = bookingRes?.data;
        } else {
          throw initErr;
        }
      }

      const bookingId = initData?.bookingId || initData?.order_id || initData?.id || `NAATAKA-${Date.now()}`;

      if (initData?.checkoutMode === "REDIRECT" && initData?.actionUrl) {
        sessionStorage.removeItem("nataka_booking");
        window.location.href = initData.actionUrl;
        return;
      }

      const appBaseUrl =
        (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) || "https://nataka.chathurakavindu.me";
      const apiBaseUrl =
        (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
        "https://server-nataka.chathurakavindu.me/api/v1/";

      let hash = initData?.hash || initData?.payload?.hash;
      let merchantId = initData?.merchant_id || initData?.merchantId || initData?.payload?.merchant_id || "1233942";

      if (!hash) {
        try {
          const hashRes = await axios.get(`payment/generate-hash?order_id=${bookingId}&amount=${totalPayable.toFixed(2)}`);
          hash = hashRes.data?.hash;
          if (hashRes.data?.merchant_id) merchantId = hashRes.data.merchant_id;
        } catch (hErr) {
          console.warn("Could not fetch fallback hash:", hErr);
        }
      }

      const isSandbox = initData?.sandbox !== undefined ? initData.sandbox : !payhereApprovedLive;

      const payment = {
        sandbox: isSandbox,
        merchant_id: merchantId,
        return_url: initData?.return_url || `${appBaseUrl}/booking/ticket/${bookingId}`,
        cancel_url: initData?.cancel_url || `${appBaseUrl}/booking`,
        notify_url: initData?.notify_url || `${apiBaseUrl}payment/notify`,
        order_id: String(bookingId),
        items: initData?.items || `Naataka.lk Tickets for ${showData?.title || "Drama Show"}`,
        amount: totalPayable.toFixed(2),
        currency: "LKR",
        hash: hash,
        first_name: initData?.first_name || user?.fname || "Customer",
        last_name: initData?.last_name || user?.lname || "",
        email: initData?.email || user?.email || "customer@naataka.lk",
        phone: initData?.phone || user?.phoneNumber || "0771234567",
        address: initData?.address || "Colombo",
        city: initData?.city || "Colombo",
        country: initData?.country || "Sri Lanka",
      };

      if (typeof window !== "undefined" && window.payhere) {
        window.payhere.onCompleted = function onCompleted(orderId) {
          setIsProcessing(false);
          sessionStorage.removeItem("nataka_booking");
          toast.success("Payment successful! Your tickets are ready.");
          router.push(`/booking/ticket/${orderId || bookingId}`);
        };

        window.payhere.onDismissed = function onDismissed() {
          setIsProcessing(false);
          toast.info("Payment window closed");
        };

        window.payhere.onError = function onError(error) {
          setIsProcessing(false);
          console.error("Payment Error", error);
          toast.error("Payment error occurred. Please try again.");
        };

        window.payhere.startPayment(payment);
      } else if (initData?.actionUrl) {
        window.location.href = initData.actionUrl;
      } else {
        toast.warn("Payment gateway is initializing. Please try again in a moment.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment Error:", err);
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 404) {
        toast.error(serverMsg || "Selected seats are no longer available. Please choose different seats.");
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error("Something went wrong with the transaction. Please try again.");
      }
      setIsProcessing(false);
    }
  };

  if (pageLoading) {
    return (
      <>
        <ModernHeader />
        <main className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-600 dark:text-slate-300">Retrieving booking summary...</p>
          </div>
        </main>
        <ModernFooter />
      </>
    );
  }

  if (!bookingData || !showData) {
    return (
      <>
        <ModernHeader />
        <main className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14141e] max-w-md w-full p-8 text-center rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Booking Session</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Your seat selection has expired or no booking was initiated. Please choose your show and seats.
            </p>
            <Link href="/shows" className="btn-theatre-gold px-6 py-2 rounded-full text-xs font-bold inline-block shadow-md cursor-pointer">
              Browse Shows
            </Link>
          </div>
        </main>
        <ModernFooter />
      </>
    );
  }

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-8 lg:py-12 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="ticket-card bg-white dark:bg-[#14141e] p-5 rounded-2xl border border-amber-500/30 mb-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBackToSeatMap}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Seat Map</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 dark:text-slate-300">Reserved Seat Hold:</span>
              <div className="px-3.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-400 font-extrabold text-sm tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h2 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  <span>Show Information</span>
                </h2>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
                  {showData.title}
                </h1>
                {showData.drama?.title && (
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400/90 mb-4">
                    Drama: {showData.drama.title}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Date</p>
                      <p className="text-slate-900 dark:text-white font-semibold">
                        {new Date(showData.showDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Time</p>
                      <p className="text-slate-900 dark:text-white font-semibold">
                        {bookingData.selectedTime || showData.showTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Venue</p>
                      <p className="text-slate-900 dark:text-white font-semibold line-clamp-1">
                        {showData.location}, {showData.city?.cityName || "Sri Lanka"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Method</span>
                </h3>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Pay Securely by Card (Visa / Mastercard / American Express)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Processed securely in Sri Lankan Rupees (LKR) via Central Bank of Sri Lanka (CBSL) approved Internet Payment Gateways.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <PaymentSchemeBadges size="md" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-[11px]">
                    256-bit SSL/TLS Encrypted &amp; 3D Secure Authenticated Transaction.
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/15 sticky top-24 shadow-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Booking Summary</span>
                </h3>

                <div className="space-y-2.5 max-h-56 overflow-y-auto mb-6 pr-1">
                  {bookingData.seats?.map((seat, index) => (
                    <div
                      key={seat.id || index}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Seat {seat.seatIdentifier}</span>
                        {seat.category && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block capitalize">
                            {seat.category} Tier
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        LKR {Number(seat.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const baseTicketTotal = (bookingData.seats || []).reduce(
                    (sum, s) => sum + (Number(s.price) || 0),
                    0
                  ) || (Number(bookingData.totalAmount) || 0);

                  const buyerFeePercent = activeCommission?.buyerFeePercent != null ? Number(activeCommission.buyerFeePercent) : 6.5;
                  const buyerFeeAmount = buyerFeePercent > 0 ? (baseTicketTotal * buyerFeePercent) / 100 : 0;
                  const totalPayable = baseTicketTotal + buyerFeeAmount;

                  return (
                    <>
                      <div className="border-t border-slate-100 dark:border-white/10 pt-4 space-y-2 text-xs mb-4">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Seats Quantity</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {bookingData.seats?.length} {bookingData.seats?.length === 1 ? "Ticket" : "Tickets"}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Tickets Subtotal</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            LKR {baseTicketTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {buyerFeePercent > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Online Booking Service Fee ({buyerFeePercent}%)</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              + LKR {buyerFeeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                          <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
                            LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                        <p>
                          <strong className="text-slate-900 dark:text-white">Merchant:</strong> Zeylex Digital Solutions (Naataka.lk) | Country of Domicile: Sri Lanka
                        </p>
                        <p>
                          <strong className="text-slate-900 dark:text-white">Billing Currency:</strong> Sri Lankan Rupees (LKR) | Security: 256-bit SSL/TLS &amp; 3D Secure Protected
                        </p>
                        <p>
                          <strong className="text-slate-900 dark:text-white">Delivery Method:</strong> Instant digital QR e-ticket delivered on-screen and via email upon payment authorization.
                        </p>
                      </div>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none mb-4">
                        <input
                          type="checkbox"
                          checked={consentAgreed}
                          onChange={(e) => setConsentAgreed(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 shrink-0"
                        />
                        <span className="leading-snug text-[11px]">
                          I agree to Naataka.lk&apos;s{" "}
                          <Link href="/terms" className="text-amber-600 dark:text-amber-400 underline font-semibold" target="_blank">
                            Terms &amp; Conditions
                          </Link>
                          ,{" "}
                          <Link href="/refund-policy" className="text-amber-600 dark:text-amber-400 underline font-semibold" target="_blank">
                            Refund &amp; Cancellation Policy
                          </Link>
                          , and{" "}
                          <Link href="/privacy-policy" className="text-amber-600 dark:text-amber-400 underline font-semibold" target="_blank">
                            Privacy Policy
                          </Link>
                          . I understand that all ticket sales are final and non-refundable unless the show is cancelled or postponed by the organizer, and that the Online Booking Service Fee is non-refundable.
                        </span>
                      </label>

                      <button
                        onClick={handleSecureCheckout}
                        disabled={isProcessing || !consentAgreed}
                        className="btn-theatre-gold w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting to Secure Payment...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>
                              Proceed to Secure Payment — LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </>
                        )}
                      </button>

                      {(isPreviewMode() || !payhereApprovedLive || (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PREVIEW_MODE === "true")) && (
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              sessionStorage.removeItem("nataka_booking");
                            }
                            toast.success("Preview authorization successful (Auth Code: PREVIEW-AUTH-001). Loading receipt...");
                            router.push("/booking/ticket/preview?view=receipt");
                          }}
                          type="button"
                          className="mt-3 w-full py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Preview Card-Absent Receipt (Compliance Inspection)</span>
                        </button>
                      )}
                    </>
                  );
                })()}

                <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  Your seats are held securely until the countdown timer expires. Payment is processed with end-to-end encryption.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Pre-Launch Verification Mode
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Online card checkout is currently in pre-launch verification and will be enabled immediately upon final gateway activation.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1">
                <p><strong>Merchant:</strong> Zeylex Digital Solutions</p>
                <p><strong>BR No:</strong> POL/ELH/ESD/02/01/1941/2026</p>
                <p><strong>Country of Domicile:</strong> Sri Lanka</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/booking/ticket/preview?view=receipt"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Preview Compliance Receipt</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <ModernFooter />
    </>
  );
}