"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  Calendar,
  Ticket,
  User,
  Star,
  Download,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Loader2,
  RotateCcw,
  AlertCircle,
  Building2,
  CreditCard,
  X,
  Phone,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { getBookingsByUserId } from "../../services/BookingService";
import { requestBuyerRefund } from "../../services/RefundService";
import { getShowById } from "../../services/ShowService";
import { addReview } from "../../services/ReviewService";
import { updateUser } from "../../services/UserService";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";
import LogoutButton from "../../Components/Logout/LogoutButton";
import SecuritySettingsCard from "../../Components/common/SecuritySettingsCard";
import ProfileAndSecurityContent from "../../Components/common/ProfileAndSecurityContent";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    fname: "",
    lname: "",
    phoneNumber: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setProfileForm({
      fname: user.fname || "",
      lname: user.lname || "",
      phoneNumber: user.phoneNumber || "",
    });

    const fetchUserBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await getBookingsByUserId(user.id);
        if (res?.data && Array.isArray(res.data)) {
          setBookings(res.data);

          // Fetch associated show details
          res.data.forEach((b) => {
            if (b.showId) {
              getShowById(b.showId)
                .then((sRes) => {
                  if (sRes?.data) {
                    setShowDetails((prev) => ({ ...prev, [b.showId]: sRes.data }));
                  }
                })
                .catch(console.error);
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch user bookings", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchUserBookings();
  }, [user, authLoading, router]);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundForm, setRefundForm] = useState({
    bankName: "",
    bankBranch: "",
    accountName: "",
    accountNumber: "",
    reason: "",
  });
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const handleOpenRefundModal = (booking, show) => {
    setSelectedBookingForRefund({ booking, show });
    setRefundForm({
      bankName: "",
      bankBranch: "",
      accountName: (user?.fname ? user.fname + " " + (user.lname || "") : "").trim(),
      accountNumber: "",
      reason: show?.cancellationReason || "Event cancelled/postponed by organizer",
    });
    setRefundModalOpen(true);
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!refundForm.bankName || !refundForm.accountNumber || !refundForm.accountName) {
      toast.warn("Please enter complete bank details (Bank name, account name, and account number).");
      return;
    }
    const bookingId = selectedBookingForRefund?.booking?.id;
    if (!bookingId) return;

    try {
      setSubmittingRefund(true);
      await requestBuyerRefund(bookingId, {
        bankName: refundForm.bankName.trim(),
        bankBranch: refundForm.bankBranch.trim(),
        accountName: refundForm.accountName.trim(),
        accountNumber: refundForm.accountNumber.trim(),
        reason: refundForm.reason.trim(),
      });
      toast.success("Refund request submitted successfully! Our finance team will process your LankaPay CEFT/SLIPS transfer.");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "REFUND_REQUESTED" } : b))
      );
      setRefundModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to submit refund request.";
      toast.error(typeof msg === "string" ? msg : "Failed to submit refund request.");
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setRatingValue(5);
    setReviewComment("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.warn("Please write your comment before submitting.");
      return;
    }

    const dramaId = showDetails[selectedBookingForReview?.showId]?.drama?.id;
    if (!dramaId) {
      toast.error("Drama information not available for this show.");
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = {
        ratingValue,
        comment: reviewComment.trim(),
        userId: user.id,
        dramaId,
      };

      const res = await addReview(payload);
      if (res?.status === 200 || res?.status === 201) {
        toast.success("Thank you! Your audience review was submitted.");
        setReviewModalOpen(false);
      }
    } catch (err) {
      toast.error("Could not submit review. Please try again later.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateUser({
        id: user.id,
        fname: profileForm.fname,
        lname: profileForm.lname,
        phoneNumber: profileForm.phoneNumber,
      });
      if (res?.status === 200) {
        toast.success("Profile updated successfully!");
        setUser({ ...user, ...profileForm });
      }
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "confirmed" || s === "complete" || s === "completed") {
      return "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40";
    }
    if (s === "pending") {
      return "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/40";
    }
    if (s === "refunded") {
      return "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/40";
    }
    if (s === "refund_requested") {
      return "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/40";
    }
    if (s === "cancelled" || s === "canceled") {
      return "bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40";
    }
    return "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/20";
  };

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] py-8 lg:py-12 transition-colors duration-200">
        <div className="desktop-container">
          {/* Header Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 dark:bg-[#12121b]/90 shadow-sm">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white text-xl font-bold border border-amber-400/30 shadow-md">
                {user?.fname?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                    {user?.fname} {user?.lname}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    🇱🇰 Stage Drama Ticket Buyer
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400 justify-center sm:justify-start">
                  <span>{user?.email}</span>
                  {user?.phoneNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{user.phoneNumber}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Account</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Tabs & Logout */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === "bookings"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  My Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === "profile"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  Account Profile
                </button>
              </div>

              <LogoutButton
                title="Sign Out"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-all shadow-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Your Drama Tickets</span>
                </h2>
                <Link href="/shows" className="btn-theatre-gold px-4 py-1.5 rounded-full text-xs font-bold">
                  + Book Another Show
                </Link>
              </div>

              {loadingBookings ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading your tickets...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const currentShow = showDetails[booking.showId];
                    const seatsStr =
                      booking.seats?.map((s) => s.seatIdentifier).join(", ") || "N/A";

                    const showStatusLower = (currentShow?.status || "").toLowerCase();
                    const isCancelledOrPostponed = showStatusLower.includes("cancel") || showStatusLower.includes("postpone");
                    const bookingStatusLower = (booking.status || "").toLowerCase();
                    const isAlreadyRefunded = bookingStatusLower === "refunded";
                    const isRefundRequested = bookingStatusLower === "refund_requested";

                    return (
                      <div
                        key={booking.id}
                        className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-amber-500/40 bg-white/95 dark:bg-[#12121b]/90 transition-all flex flex-col justify-between gap-4 shadow-sm"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                              Ticket #{booking.ticketId || booking.id}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                            {currentShow?.title || booking.theatreName || "Stage Drama Show"}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                            {currentShow?.showDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                {new Date(currentShow.showDate).toLocaleDateString()}
                              </span>
                            )}
                            {currentShow?.showTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {currentShow.showTime}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              {booking.theatreName || currentShow?.location || "Auditorium"}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-white">
                              Seats: <strong className="text-amber-700 dark:text-amber-400">{seatsStr}</strong>
                            </span>
                          </div>

                          {/* Event Cancelled / Postponed Notice */}
                          {isCancelledOrPostponed && (
                            <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                              <div>
                                <span className="font-bold">
                                  {showStatusLower.includes("postpone") ? "Event Postponed: " : "Event Cancelled: "}
                                </span>
                                <span>{currentShow?.cancellationReason || "The organizer has updated the show schedule."}</span>
                                {currentShow?.postponedNewDate && (
                                  <span className="block mt-1 font-semibold text-amber-700 dark:text-amber-400">
                                    Rescheduled Date: {new Date(currentShow.postponedNewDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-white/10 shrink-0">
                          <Link
                            href={`/booking/ticket/${booking.ticketId || booking.id}`}
                            className="btn-theatre-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>View / Download Ticket</span>
                          </Link>

                          {booking.status?.toLowerCase() === "complete" && (
                            <button
                              onClick={() => handleOpenReviewModal(booking)}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Rate Drama</span>
                            </button>
                          )}

                          {/* Conditional Refund Button (Only for Cancelled / Postponed shows) */}
                          {isCancelledOrPostponed && !isAlreadyRefunded && !isRefundRequested && (
                            <button
                              onClick={() => handleOpenRefundModal(booking, currentShow)}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Request Refund</span>
                            </button>
                          )}

                          {isRefundRequested && (
                            <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-600/40 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Refund Requested</span>
                            </span>
                          )}

                          {isAlreadyRefunded && (
                            <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-600/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Refunded</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Non-refundable Policy Note */}
                      <div className="w-full mt-2 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        All ticket sales are final and non-refundable unless the show is cancelled or postponed by the organizer. You may freely share your QR e-ticket with a friend or family member if you cannot attend.
                      </div>
                    </div>
                  );
                })}
                </div>
              ) : (
                <div className="glass-card p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10 max-w-md mx-auto bg-white/95 dark:bg-[#12121b]/90 shadow-sm">
                  <Ticket className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No bookings yet</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                    Ready to watch a performance? Explore all upcoming shows in Sri Lanka.
                  </p>
                  <Link href="/shows" className="btn-theatre-gold px-6 py-2.5 rounded-full text-xs font-bold inline-block">
                    Explore Shows
                  </Link>
                </div>
              )}

              {/* Sri Lankan Audience Helpful Information & Venue Guide */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🇱🇰 Sri Lankan Theatregoer Guide & Assistance</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Helpful tips for attending live stage drama performances in Sri Lanka
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#12121b]/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Digital QR Ticket Entry</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        No printing needed! Just display your e-ticket QR code on your mobile phone at the auditorium entrance.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#12121b]/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Arrive 15–20 Mins Early</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        Major venues (Nelum Pokuna, Lionel Wendt, Elphinstone) close hall doors promptly when the drama starts.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#12121b]/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Sri Lankan Support Team</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        Need booking assistance? Call or WhatsApp{" "}
                        <a
                          href="https://wa.me/94741550909"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          +94 74 155 0909
                        </a>{" "}
                        (Sinhala & English, 9AM – 8PM).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-5xl mx-auto">
              <ProfileAndSecurityContent embedded={true} />
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#12121c] shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Leave an Audience Review</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Share your thoughts on the acting, stage design, and overall performance!
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingValue(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingValue
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              placeholder="What did you love most about this stage drama?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181824] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none resize-none mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 btn-theatre-gold py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      {refundModalOpen && selectedBookingForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#12121c] shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-500" />
                  <span>Request Ticket Refund</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  For Cancelled or Postponed Events • LankaPay CEFT/SLIPS Direct Transfer
                </p>
              </div>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Refund Amount Details */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Event:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedBookingForRefund.show?.title || "Stage Drama Show"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Ticket ID:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  #{selectedBookingForRefund.booking?.ticketId || selectedBookingForRefund.booking?.id}
                </span>
              </div>
              <div className="border-t border-amber-500/20 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">Refundable Amount (100% Face Value):</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  LKR {((selectedBookingForRefund.booking?.baseTicketTotal || selectedBookingForRefund.booking?.totalAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                * Refund covers 100% of the ticket face value. The online convenience fee is non-refundable per platform terms.
              </p>
            </div>

            {/* Bank Transfer Form */}
            <form onSubmit={handleSubmitRefund} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Bank, Sampath Bank"
                    value={refundForm.bankName}
                    onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#181824] text-xs text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kollupitiya, Fort"
                    value={refundForm.bankBranch}
                    onChange={(e) => setRefundForm({ ...refundForm, bankBranch: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#181824] text-xs text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Exact account holder name as in passbook"
                  value={refundForm.accountName}
                  onChange={(e) => setRefundForm({ ...refundForm, accountName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100012345678"
                  value={refundForm.accountNumber}
                  onChange={(e) => setRefundForm({ ...refundForm, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Show cancelled by organizer"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="flex-1 btn-theatre-gold py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submittingRefund ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Refund Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModernFooter />
    </>
  );
}
