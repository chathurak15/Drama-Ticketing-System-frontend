import React, { useState, useEffect } from "react";
import {Calendar,Clock,MapPin,Users,CreditCard,Phone,CheckCircle,ArrowLeft} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getShowById } from "../../services/ShowService.js";
import TimeCounter from "../TimeCounter";
import { addBooking } from "../../services/BookingService.js";

const BookingPage = () => {
  const location = useLocation();
  const passedBookingData = location.state?.bookingData;
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showData, setShowData] = useState();
  const [bookingData, setBookingData] = useState();
  const [timeLeft, setTimeLeft] = useState(590); // 10 minutes in seconds

  useEffect(() => {
    if (loading || !passedBookingData) return;
    if (!user) navigate("/login");
    else {
      setBookingData(passedBookingData);
      fetchBookingData(passedBookingData.showId);
    }
  }, [user, loading, passedBookingData, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Booking time expired! Please select your seats again.");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookingData = async (showId) => {
    const response = await getShowById(showId);
    if (response.status === 200) {
      setShowData(response.data);
    }
  };
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const handleInputChange = (section, field, value) => {
    if (section === "payment") {
      setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (paymentMethod === "card") {
      const { cardNumber, expiryDate, cvv, cardholderName } = paymentDetails;
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        alert("Please fill in all card details");
        return false;
      }
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      const response = await addBooking(bookingData);
    if (response.status !== 200) {
      alert("Booking failed. Please try again.");
      return;
    }

      const newBookingId = response.data;
      setBookingId(newBookingId);
      setBookingSuccess(true);
    } catch (error) {
      if (error.response?.status === 404) {
      alert( "Seats not available. Please select different seats.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleDownloadTicket = () => {
  //   alert("Ticket download functionality would be implemented here");
  // };

  if (!bookingData || !showData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading booking details...</p>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">
            Booking ID: <span className="font-semibold">{bookingId}</span>
          </p>
          <button
            onClick={() => navigate(`/booking/ticket/`,{bookingId})}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold mb-4 hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            Download Ticket
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 from-slate-50 to-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gray-200 text-black p-6">
            <div className="flex justify-between items-center mb-4">
              <button
                className="flex items-center gap-2 text-black-900 hover:text-red-900"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Seat Selection
              </button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
                <p className="text-black-100">
              Please review your selection and provide payment details
            </p>
              </div>
                <TimeCounter timeLeft={timeLeft} totalTime={590} />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Show Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Show Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {showData.title}
                  </h3>
                  <p className="text-gray-600">
                    Drama : {showData.drama.title}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">
                        {new Date(showData.showDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold">{showData.showTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-semibold">
                        {showData.location}-{showData.city.cityName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Payment Method
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === "card"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Credit/Debit Card</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("mobile")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === "mobile"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Phone className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Mobile Payment</p>
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardholderName}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "cardholderName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Name on card"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "cardNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.expiryDate}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "expiryDate",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cvv}
                          onChange={(e) =>
                            handleInputChange("payment", "cvv", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="123"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "mobile" && (
                  <div className="pt-4 border-t">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 font-semibold mb-2">
                        Mobile Payment Options:
                      </p>
                      <div className="space-y-2 text-sm text-blue-700">
                        <p>• Dialog eZ Cash</p>
                        <p>• Mobitel mCash</p>
                        <p>• Hutch PayMe</p>
                        <p>• Airtel Money</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Booking Summary
              </h2>

              {/* Selected Seats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>
                    {bookingData.seats.length} Seat
                    {bookingData.seats.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {bookingData.seats.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-gray-600">{seat.seatIdentifier}</p>
                      </div>
                      <p className="font-semibold">
                        LKR {seat.price ? seat.price.toLocaleString() : "0.00"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-600">
                    LKR {bookingData.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={isProcessing}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Confirm Booking"
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By confirming, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
