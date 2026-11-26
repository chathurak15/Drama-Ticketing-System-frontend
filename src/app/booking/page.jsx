/* global process */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
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
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getShowById } from "../../services/ShowService";
import { addBooking, initiatePayHerePayment } from "../../services/BookingService";
import axios from "../../api/axiosInstance";
import { getActiveCommission } from "../../services/CommissionService";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import { toast } from "react-toastify";
import { getMyLock, releaseLock } from "../../services/SeatService";

export default function BookingCheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { payhereApprovedLive } = usePlatformConfig();

  const [bookingData, setBookingData] = useState(null);
  const [showData, setShowData] = useState(null);
  const [activeCommission, setActiveCommission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(590); // 10 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Load active commission model
  useEffect(() => {
    getActiveCommission()
      .then((res) => {
        if (res?.data) setActiveCommission(res.data);
      })
      .catch((err) => console.warn("Could not load commission model", err));
  }, []);

  // Load booking data and enforce server lock guard
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.warn("Please sign in to complete your ticket booking");
      router.push("/login");
      return;
    }

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("nataka_booking");
      if (!stored) {
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

        const slot = parsed.selectedTime || parsed.showTimeSlot || null;

        // Server Lock Guard: check if current user has an active, unexpired lock
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

  // Server-driven Hold Countdown Timer
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
        if (bookingData.showId) {
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
      try {
        await releaseLock(
          bookingData.showId,
          bookingData.selectedTime || bookingData.showTimeSlot || null
        );
      } catch (e) {
        console.warn("Could not release locks on exit:", e);
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

  const handlePayHereCheckout = async () => {
    if (isProcessing) return;
    if (!consentAgreed) {
      toast.warn("Please agree to the Terms & Conditions and Refund Policy to proceed with checkout.");
      return;
    }
    setIsProcessing(true);

    try {
      // 1. Calculate final financial breakdown with commission
      const baseTicketTotal =
        (bookingData.seats || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0) ||
        Number(bookingData.totalAmount) ||
        0;

      const buyerFeePercent =
        activeCommission?.buyerFeePercent != null ? Number(activeCommission.buyerFeePercent) : 6.5;
      const buyerFeeAmount = buyerFeePercent > 0 ? (baseTicketTotal * buyerFeePercent) / 100 : 0;
      const totalPayable = baseTicketTotal + buyerFeeAmount;

      // 2. Format seat objects matching backend SeatBookingInfo
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

      // 3. Initiate booking and verified PayHere session on Spring Boot backend
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
        const initRes = await initiatePayHerePayment(bookingPayload);
        initData = initRes?.data;
      } catch (initErr) {
        // Only fallback to legacy addBooking endpoint if /payment/payhere/initiate route is not found (404 route)
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

      const bookingId = initData?.bookingId || initData?.order_id || initData?.id || `NATAKA-${Date.now()}`;

      const appBaseUrl =
        (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) || "https://nataka.chathurakavindu.me";
      const apiBaseUrl =
        (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
        "https://server-nataka.chathurakavindu.me/api/v1/";

      let hash = initData?.hash;
      let merchantId = initData?.merchant_id || initData?.merchantId || "1233942";

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

      // Populated with verified customer details from PostgreSQL via backend
      const payment = {
        sandbox: isSandbox,
        merchant_id: merchantId,
        return_url: initData?.return_url || `${appBaseUrl}/booking/ticket/${bookingId}`,
        cancel_url: initData?.cancel_url || `${appBaseUrl}/booking`,
        notify_url: initData?.notify_url || `${apiBaseUrl}payment/notify`,
        order_id: String(bookingId),
        items: initData?.items || `Nataka.lk Tickets for ${showData?.title || "Drama Show"}`,
        amount: totalPayable.toFixed(2),
        currency: "LKR",
        hash: hash,
        first_name: initData?.first_name || user?.fname || "Customer",
        last_name: initData?.last_name || user?.lname || "",
        email: initData?.email || user?.email || "customer@nataka.lk",
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
          console.error("PayHere Error", error);
          toast.error("Payment error occurred. Please try again.");
        };

        window.payhere.startPayment(payment);
      } else {
        toast.warn("PayHere gateway is loading. Please try again in a moment.");
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
          {/* Top Bar with Countdown Timer */}
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
            {/* Left Column: Show & Payment Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Show Info Card */}
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

              {/* Payment Methods Card */}
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Secure Payment Gateway</span>
                </h3>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-gradient-to-r dark:from-[#172019] dark:to-[#121c17] border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">PayHere Online Gateway</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">256-Bit SSL Encrypted Transaction</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-white dark:bg-black/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 shadow-sm">
                    Official
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-2">
                  <p className="font-semibold text-slate-900 dark:text-white">Accepted Sri Lankan Payment Methods:</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    VISA, MasterCard, American Express, eZ Cash, mCash, FriMi, Genie, Vishwa, and Online Banking across all Sri Lankan banks.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Button */}
            <div className="lg:col-span-5">
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/15 sticky top-24 shadow-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Booking Summary</span>
                </h3>

                {/* Seat List */}
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

                {/* Total Calculations */}
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
                      <div className="border-t border-slate-100 dark:border-white/10 pt-4 space-y-2 text-xs mb-6">
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
                            <span>Convenience Fee ({buyerFeePercent}%)</span>
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

                      {/* Refund & Terms Consent Checkbox */}
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={consentAgreed}
                          onChange={(e) => setConsentAgreed(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 shrink-0"
                        />
                        <span className="leading-snug text-[11px]">
                          I agree to eNataka.lk's Terms & Conditions and Refund Policy. I understand that all ticket sales are final and non-refundable unless the show is cancelled or postponed by the organizer, and that the online convenience fee is non-refundable.
                        </span>
                      </label>

                      {/* Pay Button */}
                      <button
                        onClick={handlePayHereCheckout}
                        disabled={isProcessing || !consentAgreed}
                        className="btn-theatre-gold w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Opening Secure PayHere...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>
                              Pay LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </>
                        )}
                      </button>
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
      </main>

      <ModernFooter />
    </>
  );
}
