"use client";
import React, { useEffect, useState } from "react";
import { Calendar, Star, Ticket, RotateCcw, AlertCircle, X } from "lucide-react";
import {
  getBookingsByUserId,
} from "../../services/BookingService";
import { requestBuyerRefund } from "../../services/RefundService";
import { useAuth } from "../../utils/AuthContext";
import { useRouter } from "next/navigation";
import { getShowById } from "../../services/ShowService";
import { addReview } from "../../services/ReviewService"; 
import notify from "../../utils/notify";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ ratingValue: 5, comment: "" });
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    booking: null,
    show: null,
    loading: false,
  });
  const [refundForm, setRefundForm] = useState({
    bankName: "",
    bankBranch: "",
    accountName: "",
    accountNumber: "",
    reason: "",
  });
  const { user } = useAuth();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState({});

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await getBookingsByUserId(user.id);
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  useEffect(() => {
    const fetchShowDetails = async (showId) => {
      const response = await getShowById(showId);
      return response.data;
    };
    if (!bookings || bookings.length === 0) return;
    bookings.forEach((booking) => {
      if (booking.showId && !showDetails[booking.showId]) {
        fetchShowDetails(booking.showId)
          .then((details) => {
            setShowDetails((prev) => ({
              ...prev,
              [booking.showId]: details,
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch show details:", error);
          });
      }
    });
  }, [bookings]);

  const handleOpenRefundModal = (booking, show) => {
    setRefundModal({
      isOpen: true,
      booking,
      show,
      loading: false,
    });
    setRefundForm({
      bankName: "",
      bankBranch: "",
      accountName: ((user?.firstName || user?.fname || "") + " " + (user?.lastName || user?.lname || "")).trim(),
      accountNumber: "",
      reason: show?.cancellationReason || "Show cancelled or postponed",
    });
  };

  const handleConfirmRefund = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!refundForm.bankName || !refundForm.accountNumber || !refundForm.accountName) {
      notify.warning("Please enter complete bank details (Bank name, account name, and account number).");
      return;
    }
    const bookingId = refundModal.booking?.id;
    if (!bookingId) return;

    setRefundModal((prev) => ({ ...prev, loading: true }));
    try {
      await requestBuyerRefund(bookingId, {
        bankName: refundForm.bankName.trim(),
        bankBranch: refundForm.bankBranch.trim(),
        accountName: refundForm.accountName.trim(),
        accountNumber: refundForm.accountNumber.trim(),
        reason: refundForm.reason.trim(),
      });
      notify.success("Refund request submitted successfully! Our finance team will process your LankaPay CEFT/SLIPS transfer.");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "REFUND_REQUESTED" } : b))
      );
      setRefundModal({ isOpen: false, booking: null, show: null, loading: false });
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || "Failed to submit refund request.";
      notify.error(typeof msg === "string" ? msg : "Failed to submit refund request.");
      setRefundModal((prev) => ({ ...prev, loading: false }));
    }
  };

 const handleReviewSubmit = async (bookingId) => {
  if (!reviewData.ratingValue || !reviewData.comment?.trim()) {
    notify.warn("Please provide a rating and comment for your review.");
    return;
  }

  try {
    const booking = bookings.find((b) => b.id === bookingId);
    const drama = showDetails[booking.showId]?.drama;

    if (!drama || !drama.id) {
      notify.error("Drama information is not available for this booking.");
      return;
    }

    const reviewPayload = {
      ratingValue: reviewData.ratingValue,
      comment: reviewData.comment,
      userId: user.id,
      dramaId: drama.id, 
    };

    const response = await addReview(reviewPayload);
    if (response.status === 200 || response.status === 201) {
      notify.success(response.data || "Review submitted successfully!");
      setReviewModal(null);
      setReviewData({ ratingValue: 5, comment: "" });
    }
  } catch (error) {
    console.error("Failed to submit review:", error);
    notify.apiError(error, "Something went wrong while submitting your review.");
  }
};

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "complete":
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isFutureShow = (showDate) => {
    if (!showDate) return false;

    return new Date(showDate) > new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        My Bookings
      </h2>

      {!bookings.length ? (
        <p>No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ticket ID:{" "}
                    <span className="text-indigo-600">{booking.ticketId}</span>
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                <div>
                  <strong>Theater:</strong> {booking.theatreName}
                </div>
                <div>
                  <strong>Total Amount:</strong> Rs. {booking.totalAmount}
                </div>
                <div>
                  <strong>Seats:</strong>{" "}
                  {booking.seats?.length > 0
                    ? booking.seats.map((s) => s.seatIdentifier).join(", ")
                    : "N/A"}
                </div>
                <div>
                  <strong>Seat Count:</strong> {booking.seatCount}
                </div>
                <div>
                  <strong>Show Date:</strong>{" "}
                  {showDetails[booking.showId]?.showDate
                    ? new Date(
                        showDetails[booking.showId].showDate
                      ).toLocaleDateString()
                    : "Loading..."}
                </div>
              </div>

              {booking.hasReview && booking.review && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Your Review:
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= booking.review.ratingValue
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {booking.review.comment}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-2 flex-wrap">
                {booking.status.toLowerCase() === "complete" &&
                  !booking.hasReview && (
                    <button
                      onClick={() => setReviewModal(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Star className="w-4 h-4" />
                      Add Review
                    </button>
                  )}

                {(() => {
                  const currentShow = showDetails[booking.showId];
                  const showStatus = (currentShow?.status || "").toLowerCase();
                  const isCancelledOrPostponed = showStatus.includes("cancel") || showStatus.includes("postpone");
                  const bStatus = (booking.status || "").toLowerCase();
                  const isRefunded = bStatus === "refunded";
                  const isRefundRequested = bStatus === "refund_requested";

                  if (isCancelledOrPostponed && !isRefunded && !isRefundRequested) {
                    return (
                      <button
                        onClick={() => handleOpenRefundModal(booking, currentShow)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-600 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Request Refund
                      </button>
                    );
                  }
                  if (isRefundRequested) {
                    return (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs">
                        Refund Requested
                      </span>
                    );
                  }
                  if (isRefunded) {
                    return (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-xs">
                        Refunded / Voided
                      </span>
                    );
                  }
                  return null;
                })()}

                <button
                  onClick={() =>
                    router.push("/booking/ticket/" + booking.ticketId)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  Download Ticket
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500 border-t pt-2">
                All ticket sales are final and non-refundable unless the show is cancelled or postponed by the organizer. You may freely share your QR e-ticket with a friend or family member if you cannot attend.
              </p>
            </div>
          ))}
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Review</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setReviewData({ ...reviewData, ratingValue: star })
                    }
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewData.ratingValue
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReviewSubmit(reviewModal)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewData({ ratingValue: 5, comment: "" });
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      {refundModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  Request Ticket Refund
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Cancelled / Postponed Show • Direct LankaPay CEFT/SLIPS Bank Transfer
                </p>
              </div>
              <button
                onClick={() => setRefundModal({ isOpen: false, booking: null, show: null, loading: false })}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Event:</span>
                <span className="font-bold text-gray-900">{refundModal.show?.title || "Stage Drama Show"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket ID:</span>
                <span className="font-mono font-bold text-amber-700">#{refundModal.booking?.ticketId}</span>
              </div>
              <div className="border-t border-amber-200 pt-1.5 flex justify-between font-bold text-sm">
                <span>Refundable Amount (100% Face Value):</span>
                <span className="text-emerald-600">
                  LKR {((refundModal.booking?.baseTicketTotal || refundModal.booking?.totalAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 italic">
                * The online convenience fee is non-refundable per platform terms.
              </p>
            </div>

            <form onSubmit={handleConfirmRefund} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Bank"
                    value={refundForm.bankName}
                    onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Branch *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kollupitiya"
                    value={refundForm.bankBranch}
                    onChange={(e) => setRefundForm({ ...refundForm, bankBranch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Exact account name"
                  value={refundForm.accountName}
                  onChange={(e) => setRefundForm({ ...refundForm, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100012345678"
                  value={refundForm.accountNumber}
                  onChange={(e) => setRefundForm({ ...refundForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModal({ isOpen: false, booking: null, show: null, loading: false })}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundModal.loading}
                  className="flex-1 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-600 disabled:opacity-50"
                >
                  {refundModal.loading ? "Submitting..." : "Submit Refund Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
