import React, { useState, useCallback, useEffect } from "react";
import { X, Calendar, MapPin, Clock, Loader2 } from "lucide-react"; // Added Loader2 icon
import { useNavigate } from "react-router-dom";
import {
  getSeatsByShowId,
  getUnavailableSeats,
  lockSeats,
} from "../../services/SeatService";
import { useAuth } from "../../utils/AuthContext";

const SeatPopup = ({ isOpen, onClose, showId }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [backendLockedSeats, setBackendLockedSeats] = useState([]);
  const [showData, setShowData] = useState();
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  
  // NEW: State to track if a booking request is in progress
  const [isProcessing, setIsProcessing] = useState(false);

  const user = useAuth().user;
  const navigate = useNavigate();

  // Helper to fix typos from backend
  const formatCategory = (category) => {
    if (category === "Nomal") return "Normal";
    return category;
  };

  const fetchShowData = useCallback(async () => {
    try {
      const response = await getSeatsByShowId(showId);
      setShowData(response.data || null);
    } catch (error) {
      console.error("Failed to fetch show data:", error);
      setShowData(null);
    }
  }, [showId]);

  const fetchUnavailableSeats = useCallback(async () => {
    try {
      const response = await getUnavailableSeats(showId);
      setBookedSeats(response.data.bookedSeats || []);
      setBackendLockedSeats(response.data.lockedSeats || []);
    } catch (error) {
      console.error("Failed to fetch unavailable seats:", error);
      setBookedSeats([]);
      setBackendLockedSeats([]);
    }
  }, [showId]);

  useEffect(() => {
    if (!showId) return;
    fetchShowData();
    fetchUnavailableSeats();
    setSelectedSeats([]);

    const intervalId = setInterval(() => {
      fetchUnavailableSeats();
    }, 30000); 

    return () => clearInterval(intervalId);
  }, [showId, fetchShowData, fetchUnavailableSeats]);

  const handleSeatClick = (seat) => {
    if (
      seat.status === "BOOKED" ||
      backendLockedSeats.includes(seat.seatIdentifier)
    ) {
      return;
    }

    const isSelected = selectedSeats.some(
      (s) => s.seatIdentifier === seat.seatIdentifier
    );

    if (isSelected) {
      setSelectedSeats((prev) =>
        prev.filter((s) => s.seatIdentifier !== seat.seatIdentifier)
      );
    } else {
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.some((s) => s.seatIdentifier === seat.seatIdentifier))
      return "selected";
    if (backendLockedSeats.includes(seat.seatIdentifier)) return "locked";
    if (bookedSeats.includes(seat.seatIdentifier)) return "booked";
    return seat.status.toLowerCase();
  };

  const getSeatClassName = (seat) => {
    const status = getSeatStatus(seat);
    const baseClass =
      "w-5 h-5 sm:w-8 sm:h-8 rounded-sm sm:rounded-lg border sm:border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-[8px] sm:text-xs font-semibold shrink-0";

    switch (status) {
      case "selected":
        return `${baseClass} bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105 z-10`;
      case "locked":
        return `${baseClass} bg-orange-400 border-orange-500 text-white`;
      case "booked":
        return `${baseClass} bg-red-500 border-red-600 text-white cursor-not-allowed opacity-70`;
      case "blocked":
        return `${baseClass} bg-gray-400 border-gray-500 text-white cursor-not-allowed opacity-70`;
      default:
        return `${baseClass} ${getCategoryColor(
          seat.category
        )} hover:scale-105 hover:shadow-md`;
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "vip":
        return "bg-purple-100 border-purple-300";
      case "premium":
        return "bg-blue-100 border-blue-300";
      case "standard":
      case "nomal": 
        return "bg-green-100 border-green-300";
      case "balcony":
        return "bg-yellow-100 border-yellow-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getTotalAmount = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleBooking = async () => {
    // Check if already processing to prevent double clicks
    if (isProcessing) return;

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    if (!user || user.role !== "Customer" ||user.role !== "TheaterManager") {
      setShowLoginWarning(true);
      return;
    }

    // Set processing state to true immediately
    setIsProcessing(true);

    const lockSeatData = {
      showId,
      seats: selectedSeats.map((s) => s.seatIdentifier),
      userId: user.id,
    };

    const bookingData = {
      showId,
      seats: selectedSeats.map((s) => ({
        seatIdentifier: s.seatIdentifier,
        price: s.price,
      })),
      totalAmount: getTotalAmount(),
      userId: user.id,
    };

    try {
        const response = await lockSeats(lockSeatData);
        
        if (response.status !== 200) {
            alert(response.data || "Failed to lock seats");
            return;
        }

        if (response.data !== "Seats locked successfully") {
            alert(response.data);
            return;
        }

        alert("Please Complete Your Booking in 10 minutes! Your Seats are Locked");

        navigate("/booking", {
            state: { bookingData },
        });

        setSelectedSeats([]);
        setShowLoginWarning(false);
        handleClose();

    } catch (error) {
        console.error("Booking error:", error);
        alert("An error occurred while locking seats. Please try again.");
    } finally {
        // Always reset processing state, whether successful or failed
        setIsProcessing(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login", {
      state: {
        from: "/booking",
        seats: selectedSeats.map((s) => s.seatIdentifier),
        showId,
      },
    });
  };

  const handleClose = () => {
    if (isProcessing) return; // Prevent closing while processing
    setSelectedSeats([]);
    setBackendLockedSeats([]);
    setShowLoginWarning(false);
    onClose();
  };

  const generateSeats = () => {
    if (!showData) return [];

    let seatId = 1;
    const allSeats = [];

    showData.ticketPrices.forEach((ticketCategory, categoryIndex) => {
      const { category, price, totalSeats, seatsPerRow } = ticketCategory;

      for (let i = 0; i < totalSeats; i++) {
        const rowIndex = Math.floor(i / seatsPerRow);
        const row = String.fromCharCode(65 + rowIndex + categoryIndex * 5);
        const seatNumber = (i % seatsPerRow) + 1;
        const seatIdentifier = `${category}-${row}${seatNumber}`;

        const status = bookedSeats.includes(seatIdentifier)
          ? "BOOKED"
          : backendLockedSeats.includes(seatIdentifier)
          ? "LOCKED"
          : "AVAILABLE";

        allSeats.push({
          id: seatId++,
          row,
          number: seatNumber,
          price,
          status,
          seatType: category,
          category,
          seatIdentifier,
        });
      }
    });

    return allSeats;
  };

  const groupedSeats = generateSeats().reduce((acc, seat) => {
    if (!acc[seat.category]) acc[seat.category] = [];
    acc[seat.category].push(seat);
    return acc;
  }, {});

  const renderSeatGrid = (categorySeats) => {
    const seatsByRow = categorySeats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});
    const sortedRows = Object.keys(seatsByRow).sort();

    return (
      <div className="space-y-1 sm:space-y-3 min-w-max">
        {sortedRows.map((rowLetter) => {
          const rowSeats = seatsByRow[rowLetter].sort(
            (a, b) => a.number - b.number
          );
          return (
            <div
              key={rowLetter}
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              <div className="w-4 sm:w-8 text-center font-semibold text-gray-600 text-[10px] sm:text-sm shrink-0">
                {rowLetter}
              </div>
              <div className="flex gap-0.5 sm:gap-1">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={getSeatClassName(seat)}
                    title={`${seat.row}${seat.number} - LKR ${seat.price.toLocaleString()}`}
                    disabled={isProcessing} // Disable seat selection while processing
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const Legend = () => (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] sm:text-sm mb-4 justify-center sm:justify-start">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border sm:border-2 border-gray-300 rounded-sm"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border sm:border-2 border-emerald-600 rounded-sm"></div>
        <span>Selected</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 border sm:border-2 border-red-600 rounded-sm opacity-70"></div>
        <span>Booked</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 border sm:border-2 border-orange-500 rounded-sm"></div>
        <span>Locked</span>
      </div>
    </div>
  );

  if (!isOpen || !showData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="booking-btn from-slate-800 to-slate-700 text-white p-4 sm:p-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg sm:text-2xl font-bold">{showData.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-200 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span>{showData.showDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span>{showData.showTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span>{showData.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-1 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Left Side: Seat Map */}
          <div className="flex-1 p-2 sm:p-6 overflow-y-auto bg-gray-50">
            <div className="lg:hidden mb-2">
              <Legend />
            </div>

            <div className="text-center mb-3">
              <div className="booking-btn h-3 sm:h-4 rounded-full mb-4 sm:mb-6 relative w-3/4 mx-auto">
                <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-sm text-gray-900 font-bold tracking-widest">
                  STAGE
                </div>
              </div>
            </div>
            
            <div className="space-y-2 overflow-x-auto pb-4">
              {Object.entries(groupedSeats).map(([category, categorySeats]) => (
                <div key={category} className="bg-white lg:bg-gray-50 rounded-xl p-2 sm:p-6 min-w-fit mx-auto shadow-sm lg:shadow-none">
                  <div className="flex items-center justify-between mb-2 sm:mb-4 min-w-[200px] sm:min-w-[250px]">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800 capitalize">
                      {formatCategory(category)}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap ml-4">
                      LKR {categorySeats[0]?.price.toLocaleString()}
                    </span>
                  </div>
                  {renderSeatGrid(categorySeats)}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Summary */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white overflow-y-auto shrink-0 max-h-[35vh] lg:max-h-full pb-20 lg:pb-6 p-4 sm:p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10 relative">
            
            <div className="hidden lg:block">
              <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
              <Legend />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 sticky top-0 bg-white z-10 py-2">
              Booking Summary
            </h3>

            {showLoginWarning && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-4">
                You must be logged in to confirm booking.
                <button
                  onClick={handleLoginRedirect}
                  className="block w-full mt-2 text-center bg-red-500 text-white py-1.5 rounded hover:bg-red-600"
                >
                  Login to Book
                </button>
              </div>
            )}

            {selectedSeats.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                  <h4 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm">
                    Selected Seats
                  </h4>
                  <div className="space-y-1.5 max-h-24 sm:max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex justify-between items-center text-xs sm:text-sm"
                      >
                        <span>
                          {seat.row}
                          {seat.number} ({formatCategory(seat.category)})
                        </span>
                        <span className="font-semibold whitespace-nowrap ml-2">
                          LKR {seat.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center font-bold text-base sm:text-lg">
                    <span>Total</span>
                    <span>LKR {getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
                
                {/* MODIFIED BUTTON START */}
                <button
                  onClick={handleBooking}
                  disabled={isProcessing}
                  className={`w-full text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm sm:text-base flex items-center justify-center gap-2
                    ${isProcessing 
                        ? "bg-slate-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    }`}
                >
                  {isProcessing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
                {/* MODIFIED BUTTON END */}
                
              </div>
            ) : (
              <div className="text-center py-4 sm:py-8 text-gray-500 text-xs sm:text-sm">
                Select seats to see booking summary
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatPopup;