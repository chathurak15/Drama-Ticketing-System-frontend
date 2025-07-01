import React, { useState, useCallback } from "react";
import { X, AlertCircle, MapPin, Clock, Calendar } from "lucide-react";

const SeatPopup = ({ isOpen, onClose, showData }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [sessionId] = useState(Math.random().toString(36).substr(2, 9));
  // const [customerInfo, setCustomerInfo] = useState({
  //   name: "",
  //   email: "",
  //   phone: "",
  // });

  // Generate seats based on show's ticket prices
  const generateSeats = () => {
    if (!showData?.ticketPrices) return [];

    let seatId = 1;
    const allSeats = [];

    showData.ticketPrices.forEach((ticketCategory, categoryIndex) => {
      if (!ticketCategory.available) return;

      const price = parseInt(ticketCategory.price.replace(/[^\d]/g, ""));
      const category = ticketCategory.category;

      let seatsInCategory = ticketCategory.totalSeats;
      let seatsPerRow = ticketCategory.seatsPerRow;

      // Configure seats based on category
      // switch (category.toLowerCase()) {
      //   case 'vip':
      //   case 'premium':
      //     seatsInCategory = 20;
      //     seatsPerRow = 8;
      //     break;
      //   case 'standard':
      //   case 'balcony':
      //     seatsInCategory = 40;
      //     seatsPerRow = 10;
      //     break;
      //   default:
      //     seatsInCategory = ticketCategory.totalSeats;
      //     seatsPerRow = ticketCategory.seatsPerRow;
      // }

      for (let i = 0; i < seatsInCategory; i++) {
        const rowIndex = Math.floor(i / seatsPerRow);
        const row = String.fromCharCode(65 + rowIndex + categoryIndex * 4);
        const seat = {
          id: seatId++,
          row: row,
          number: (i % seatsPerRow) + 1,
          price: price,
          status: Math.random() > 0.8 ? "BOOKED" : "AVAILABLE",
          seatType: category,
          category: category,
        };
        allSeats.push(seat);
      }
    });
    return allSeats;
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

  const seats = generateSeats();

  const lockSeats = useCallback(
    async (seatIds) => {
      try {
        console.log("Locking seats:", seatIds, "Session:", sessionId);
        setLockedSeats((prev) => [...prev, ...seatIds]);

        // Auto-release after 5 minutes
        setTimeout(() => {
          setLockedSeats((prev) => prev.filter((id) => !seatIds.includes(id)));
          setSelectedSeats((prev) =>
            prev.filter((seat) => !seatIds.includes(seat.id))
          );
        }, 300000);

        return true;
      } catch (error) {
        console.error("Failed to lock seats:", error);
        return false;
      }
    },
    [sessionId]
  );

  const handleSeatClick = async (seat) => {
    if (seat.status === "BOOKED" || seat.status === "BLOCKED") return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    if (isSelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      setLockedSeats((prev) => prev.filter((id) => id !== seat.id));
    } else {
      const success = await lockSeats([seat.id]);
      if (success) {
        setSelectedSeats((prev) => [...prev, seat]);
      } else {
        alert("This seat is no longer available");
      }
    }
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.some((s) => s.id === seat.id)) return "selected";
    if (lockedSeats.includes(seat.id)) return "locked";
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

  const getTotalAmount = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleBooking = () => {

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    const bookingData = {
      show: showData,
      seats: selectedSeats,
      total: getTotalAmount(),
      sessionId: sessionId,
    };

    console.log("Booking Data:", bookingData);
    alert(
      `Booking confirmed for ${
        selectedSeats.length
      } seat(s) - Total: LKR ${getTotalAmount()}`
    );
    handleClose();
  };

  const handleClose = () => {
    setSelectedSeats([]);
    setLockedSeats([]);
    onClose();
  };

  // Group seats by category for better organization
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.category]) {
      acc[seat.category] = [];
    }
    acc[seat.category].push(seat);
    return acc;
  }, {});

  const renderSeatGrid = (categorySeats) => {
    // Group seats by their actual row letters
    const seatsByRow = categorySeats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {});

    // Sort rows alphabetically and seats within each row by number
    const sortedRows = Object.keys(seatsByRow).sort();

    return (
      <div className="space-y-3">
        {sortedRows.map((rowLetter) => {
          // Sort seats in this row by seat number
          const rowSeats = seatsByRow[rowLetter].sort(
            (a, b) => a.number - b.number
          );

          return (
            <div
              key={rowLetter}
              className="flex items-center justify-center gap-2"
            >
              {/* Row Label */}
              <div className="w-8 text-center font-semibold text-gray-600 text-sm">
                {rowLetter}
              </div>

              {/* Seats in this row */}
              <div className="flex gap-1">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={getSeatClassName(seat)}
                    title={`${seat.row}${seat.number} - LKR ${seat.price}`}
                  >
                    {/* <div className="relative">
                      <img src="/public/images/chair.png" className="w-8">
                      </img>
                      <span className="text-xs font-bold">
                        {seat.number}
                      </span>
                    </div> */}
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
  const isOpenArea = showData?.isOpenArea;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="booking-btn from-slate-800 to-slate-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{showData.title}</h2>
              <div className="flex items-center gap-4 text-slate-200 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{showData.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{showData.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{showData.venue?.name}</span>
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

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full max-h-[calc(95vh-120px)]">
          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isOpenArea ? (
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">
                        Open Area Event
                      </h3>
                      <p className="text-blue-700 text-sm">
                        This is an open area show. Admission is on a first-come,
                        first-served basis.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const bookingData = {
                      show: showData,
                      sessionId: sessionId,
                    };

                    console.log("Open Area Booking Data:", bookingData);
                    alert("Open area booking confirmed!");
                    handleClose();
                  }}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  Confirm Booking - {showData.ticketPrices[0]?.price}
                </button>
              </div>
            ) : (
              <div>
                {/* Stage */}
                <div className="text-center mb-3">
                  <div className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg">
                    🎭 STAGE
                  </div>
                </div>

                {/* Seat Categories */}
                <div className="space-y-2">
                  {Object.entries(groupedSeats).map(
                    ([category, categorySeats]) => (
                      <div key={category} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 capitalize">
                            {category} Section
                          </h3>
                          <span className="text-sm text-gray-600">
                            LKR {categorySeats[0]?.price} per seat
                          </span>
                        </div>
                        {renderSeatGrid(categorySeats)}
                      </div>
                    )
                  )}
                </div>

                
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          {!isOpenArea && (
            <div className="lg:w-80 border-l border-gray-200 p-6 bg-gray-50">
                <div className="mb-15 bg-gray-50 rounded-lg ">
                  <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
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
                      <span>Temporarily Locked</span>
                    </div>
                  </div>
                </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Summary
              </h3>

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
                            LKR {seat.price}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>LKR {getTotalAmount()}</span>
                    </div>
                  </div>

                  {/* <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div> */}

                  <button
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
                  >
                    Confirm Booking
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Select seats to see booking summary
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatPopup;
