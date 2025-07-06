import React, { useState, useCallback, useEffect } from "react";
import { X, Calendar, MapPin, Clock } from "lucide-react";
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

  const user = useAuth().user;
  const navigate = useNavigate();

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
    }, 30000); // 30 seconds

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
      "w-8 h-8 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-semibold";

    switch (status) {
      case "selected":
        return `${baseClass} bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105`;
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
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    if (!user || user.role !== "Customer") {
      setShowLoginWarning(true);
      return;
    }

    const lockSeatData = {
      showId,
      seats: selectedSeats.map((s) => s.seatIdentifier),
      userId: user.id,
    };

    const bookingData = {
      showId,
      seats: selectedSeats.map((s) =>({ 
        seatIdentifier: s.seatIdentifier,
        price: s.price})),
      totalAmount: getTotalAmount(),
      userId: user.id,
    };

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
        const row = String.fromCharCode(65 + rowIndex + categoryIndex * 4);
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
      <div className="space-y-3">
        {sortedRows.map((rowLetter) => {
          const rowSeats = seatsByRow[rowLetter].sort(
            (a, b) => a.number - b.number
          );
          return (
            <div
              key={rowLetter}
              className="flex items-center justify-center gap-2"
            >
              <div className="w-8 text-center font-semibold text-gray-600 text-sm">
                {rowLetter}
              </div>
              <div className="flex gap-1">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={getSeatClassName(seat)}
                    title={`${seat.row}${seat.number} - LKR ${seat.price.toLocaleString()}`}
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

  if (!isOpen || !showData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        <div className="booking-btn from-slate-800 to-slate-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{showData.title}</h2>
              <div className="flex items-center gap-4 text-slate-200 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{showData.showDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{showData.showTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{showData.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(95vh-120px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="text-center mb-3">
              <div className="booking-btn h-4 rounded-full mb-6 relative">
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-s text-gray-900">
                  STAGE
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(groupedSeats).map(([category, categorySeats]) => (
                <div key={category} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                      {category} Section
                    </h3>
                    <span className="text-sm text-gray-600">
                      LKR {categorySeats[0]?.price.toLocaleString()} per seat
                    </span>
                  </div>
                  {renderSeatGrid(categorySeats)}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-80 border-l border-gray-200 p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
            <div className="flex flex-wrap gap-4 text-sm mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 border-2 border-emerald-600 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded opacity-70"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 border-2 border-orange-500 rounded"></div>
                <span>Locked</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
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
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Selected Seats
                  </h4>
                  <div className="space-y-2">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>
                          {seat.row}
                          {seat.number} ({seat.category})
                        </span>
                        <span className="font-semibold">
                          LKR {seat.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>LKR {getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
                >
                  Confirm Booking
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
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
