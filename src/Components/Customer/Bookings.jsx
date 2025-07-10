import React, { useEffect, useState } from "react";
import { Calendar, Star, Trash2, Ticket } from "lucide-react";
import {
  getBookingsByUserId,
  cancelBooking,
} from "../../services/BookingService";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import { getShowById } from "../../services/ShowService";
import { addReview } from "../../services/ReviewService"; 

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ ratingValue: 5, comment: "" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
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

  const handleCancel = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to cancel this booking?")) {
        return;
      }
      const response = await cancelBooking(id, user.id);
      if (response.status === 200) {
        alert(response.data);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
        );
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking. Please try again later.");
    }
  };

 const handleReviewSubmit = async (bookingId) => {
  if (!reviewData.ratingValue || !reviewData.comment) {
    alert("Please provide a rating and comment for your review.");
    return;
  }

  try {
    const booking = bookings.find((b) => b.id === bookingId);
    const drama = showDetails[booking.showId]?.drama;

    if (!drama || !drama.id) {
      alert("Drama information is not available for this booking.");
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
      alert(response.data || "Review submitted successfully!");

      // setBookings((prev) =>
      //   prev.map((b) =>
      //     b.id === bookingId
      //       ? { ...b, hasReview: true, review: reviewData }
      //       : b
      //   )
      // );

      setReviewModal(null);
      setReviewData({ ratingValue: 5, comment: "" });
    }
  } catch (error) {
    console.error("Failed to submit review:", error);
    alert("Something went wrong while submitting your review.");
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
    console.log("Show Date:", showDate);
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

                {["pending", "confirmed"].includes(
                  booking.status.toLowerCase()
                ) &&
                  isFutureShow(showDetails[booking.showId]?.showDate) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  )}

                <button
                  onClick={() =>
                    navigate("/booking/ticket/" + booking.ticketId)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Ticket className="w-4 h-4" />
                  Download Ticket
                </button>
              </div>
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
    </div>
  );
};

export default Bookings;
