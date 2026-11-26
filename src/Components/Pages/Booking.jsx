"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ArrowLeft,
  Ticket,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "../../utils/useNavigateCompat";
import { getShowById } from "../../services/ShowService.js";
import TimeCounter from "../TimeCounter";
import { addBooking } from "../../services/BookingService.js";
import { getActiveCommission } from "../../services/CommissionService.js";
import notify from "../../utils/notify";
import StageDramaButton from "../common/StageDramaButton";

const BookingPage = () => {
  // Next.js booking state from sessionStorage
  let passedBookingData = null;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("nataka_booking");
      if (stored) passedBookingData = JSON.parse(stored);
    } catch {
      // ignore parse error
    }
  }
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showData, setShowData] = useState();
  const [bookingData, setBookingData] = useState();
  const [activeCommission, setActiveCommission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(590); // 10 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  useEffect(() => {
    getActiveCommission()
      .then((res) => {
        if (res?.data) setActiveCommission(res.data);
      })
      .catch((err) => console.warn("Could not load commission model", err));
  }, []);

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
          notify.error("Booking reservation time expired. Please select your seats again.");
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

  // --- PayHere Integration Logic ---
  const handlePayHerePayment = async () => {
    if (!consentAgreed) {
      notify.warning("Please agree to the Terms & Conditions and Refund Policy to proceed with checkout.");
      return;
    }
    setIsProcessing(true);

    try {
      const baseTicketTotal = (bookingData?.seats || []).reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0
      ) || (bookingData?.totalAmount || 0);

      const buyerFeePercent = activeCommission?.buyerFeePercent != null ? Number(activeCommission.buyerFeePercent) : 6.5;
      const buyerFeeAmount = buyerFeePercent > 0 ? (baseTicketTotal * buyerFeePercent) / 100 : 0;
      const totalPayable = baseTicketTotal + buyerFeeAmount;

      //Create initial booking record in backend (status: PENDING)
      const response = await addBooking({
        ...bookingData,
        totalAmount: totalPayable,
      });

      if (response.status !== 200) {
        notify.error("Booking initiation failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Extract Payment Data & Hash from Backend Response
      // Backend MUST return: bookingId, merchantId, hash, amount, currency
      const { bookingId, hash, merchantId } = response.data;

      const payment = {
        sandbox: import.meta.env.VITE_PAYHERE_SANDBOX === "true",
        merchant_id: merchantId, 
        return_url: `${import.meta.env.VITE_APP_URL}/booking/success`,
        cancel_url: `${import.meta.env.VITE_APP_URL}/booking/cancel`,  
        notify_url: `${import.meta.env.VITE_API_BASE_URL}payment/notify`, 
        order_id: bookingId,
        items: `Ticket for ${showData.drama.title}`,
        amount: totalPayable.toFixed(2),
        currency: "LKR",
        hash: hash,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone || "0777123456",
        address: "No.1, Colombo",
        city: "Colombo",
        country: "Sri Lanka",
      };

      // Define PayHere Event Handlers
      window.payhere.onCompleted = function onCompleted(orderId) {
        setIsProcessing(false);
        notify.success("Payment successful! Generating your e-ticket...");
        navigate("/booking/ticket/" + orderId);
      };

      window.payhere.onDismissed = function onDismissed() {
        setIsProcessing(false);
        notify.info("Payment window closed.");
      };

      window.payhere.onError = function onError(error) {
        setIsProcessing(false);
        notify.error("Payment Error: " + (error || "Transaction was not completed."));
      };

      // Open PayHere Popup
      window.payhere.startPayment(payment);

    } catch (error) {
      console.error("Payment Error:", error);
      if (error.response?.status === 404) {
        notify.error("Selected seats are no longer available. Please select different seats.");
      } else {
        notify.apiError(error, "Payment processing failed. Please try again.");
      }
      setIsProcessing(false);
    }
  };

  if (!bookingData || !showData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading booking details...</p>
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
                <h1 className="text-3xl font-bold mb-2">
                  Complete Your Booking
                </h1>
                <p className="text-black-100">
                  Please review your selection and proceed to payment
                </p>
              </div>
              <TimeCounter timeLeft={timeLeft} totalTime={590} />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Show Information (Unchanged) */}
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

            {/* Payment Options (UPDATED SECTION) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Single PayHere Option */}
                <div className="p-4 border-2 border-emerald-500 bg-emerald-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-800">
                        Online Payment Gateway
                      </p>
                      <p className="text-sm text-emerald-600">
                        Pay securely via PayHere
                      </p>
                    </div>
                  </div>
                  {/* Payment Method Icons */}
                  <div className="flex gap-2 opacity-70">
                    <img
                      src="https://www.payhere.lk/downloads/images/payhere_square_banner.png"
                      alt="PayHere"
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-blue-800 text-sm font-semibold mb-1">
                    Accepted Payment Methods:
                  </p>
                  <p className="text-blue-700 text-sm">
                    VISA, MasterCard, Amex, eZ Cash, mCash, Genie, Vishwa & more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary (Sidebar) */}
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
                        <p className="text-sm text-gray-600">
                          {seat.seatIdentifier}
                        </p>
                      </div>
                      <p className="font-semibold">
                        LKR {seat.price ? seat.price.toLocaleString() : "0.00"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown & Total */}
              {(() => {
                const baseTicketTotal = (bookingData?.seats || []).reduce(
                  (sum, s) => sum + (Number(s.price) || 0),
                  0
                ) || (bookingData?.totalAmount || 0);

                const buyerFeePercent = activeCommission?.buyerFeePercent != null ? Number(activeCommission.buyerFeePercent) : 6.5;
                const buyerFeeAmount = buyerFeePercent > 0 ? (baseTicketTotal * buyerFeePercent) / 100 : 0;
                const totalPayable = baseTicketTotal + buyerFeeAmount;

                return (
                  <>
                    <div className="border-t pt-4 space-y-2 mb-6 text-sm">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Tickets Subtotal</span>
                        <span className="font-semibold text-gray-800">
                          LKR {baseTicketTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {buyerFeePercent > 0 && (
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Convenience Fee ({buyerFeePercent}%)</span>
                          <span className="font-semibold text-emerald-600">
                            + LKR {buyerFeeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-2 flex justify-between items-center text-lg font-bold">
                        <span>Total Payable</span>
                        <span className="text-emerald-600">
                          LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Consent Checkbox */}
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 cursor-pointer select-none mb-4">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => setConsentAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-4 h-4 shrink-0"
                      />
                      <span className="leading-snug text-[11px]">
                        I agree to eNataka.lk's Terms & Conditions and Refund Policy. I understand that all ticket sales are final and non-refundable unless the show is cancelled or postponed by the organizer, and that the online convenience fee is non-refundable.
                      </span>
                    </label>

                    {/* Stage Drama Pay Button */}
                    <StageDramaButton
                      fullWidth
                      size="lg"
                      variant="theatre"
                      disabled={!consentAgreed || isProcessing}
                      loading={isProcessing}
                      loadingText="Securing Your Stage Seats..."
                      onClick={handlePayHerePayment}
                      icon={Ticket}
                    >
                      Pay LKR {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </StageDramaButton>
                  </>
                );
              })()}

              <p className="text-xs text-gray-500 mt-3 text-center">
                Your stage drama reservation is protected with end-to-end security. Payment is processed securely by PayHere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;