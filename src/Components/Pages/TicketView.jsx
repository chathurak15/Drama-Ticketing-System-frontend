import React, { useEffect, useState } from "react";
import {CheckCircle,QrCode,Calendar,Clock,MapPin,Download,Theater,Smartphone,Sparkles,} from "lucide-react";
import { useParams } from "react-router-dom";
import { getBooking } from "../../services/BookingService";
import { getShowById } from "../../services/ShowService";

const TicketView = () => {
  const { id } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [showData, setShowData] = useState({});
  const [qrCode, setQrCode] = useState(null);

  const generateQRCode = (ticketId, showId, seatCount) => {
    const qrData = `BOOKING:${ticketId}:${showId}:${seatCount}`;

    const size = 200;
    const moduleSize = 8;
    const modules = size / moduleSize;
    
    let qrPattern = [];
    for (let i = 0; i < modules; i++) {
      qrPattern[i] = [];
      for (let j = 0; j < modules; j++) {
        // Create finder patterns (corners)
        if ((i < 7 && j < 7) || (i < 7 && j >= modules - 7) || (i >= modules - 7 && j < 7)) {
          qrPattern[i][j] = (i === 0 || i === 6 || j === 0 || j === 6 || 
                           (i >= 2 && i <= 4 && j >= 2 && j <= 4));
        }
        // Timing patterns
        else if (i === 6 || j === 6) {
          qrPattern[i][j] = (i + j) % 2 === 0;
        }
        // Data pattern (pseudo-random based on ticket data)
        else {
          const hash = (i * 31 + j * 17 + ticketId.length * 7) % 100;
          qrPattern[i][j] = hash > 45;
        }
      }
    }
    
    // Generate SVG
    let rects = '';
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        if (qrPattern[i][j]) {
          rects += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#1f2937"/>`;
        }
      }
    }
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="white" rx="8"/>
        ${rects}
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const booking = await getBooking(id);
        setBookingData(booking.data);
        const qrCodeData = generateQRCode(
          booking.data.ticketId,
          booking.data.showId,
          booking.data.seatCount
        );
        setQrCode(qrCodeData);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };

    fetchBookingData();
  }, [id]);

  useEffect(() => {
    const fetchShowData = async () => {
      if (!bookingData?.showId) return;
      try {
        const response = await getShowById(bookingData.showId);
        setShowData(response.data);
      } catch (error) {
        console.error("Error fetching show data:", error);
      }
    };

    fetchShowData();
  }, [bookingData]);

  if (!bookingData || !showData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  const handleDownloadTicket = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${bookingData.ticketId}_ticket.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
            <CheckCircle className="w-16 h-16 text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">
            Booking {bookingData.status}!
          </h1>
          <p className="text-purple-200 text-lg">
            Your digital tickets are ready
          </p>
        </div> */}

        {/* Main Ticket Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#3f110f] via-[#661F19] to-[#8b2a21] px-8 py-3 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                 <img src="/public/images/logo nataka white.png" alt="logo" className="w-50" />
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Ticket ID</div>
                  <div className="font-mono text-lg">{bookingData.ticketId}</div>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">{showData.title}</h2>
            </div>
          </div>

          <div className="p-8">
            {/* QR Code Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <QrCode className="w-6 h-6 text-gray-600" />
                    <span className="font-semibold text-gray-800">Scan to Enter</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-inner">
                    <img
                      src={qrCode}
                      alt="Booking QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                    <Smartphone className="w-4 h-4" />
                    <span>Show this code at the venue</span>
                  </div>
                </div>
              </div>

              {/* Show Details */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Event Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Date</div>
                        <div className="text-gray-600">
                          {new Date(showData.showDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Time</div>
                        <div className="text-gray-600">{showData.showTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Venue</div>
                        <div className="text-gray-600">
                          {showData?.location || "Unknown Location"} - {showData?.city?.cityName || "Unknown City"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Theater className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Theater</div>
                        <div className="text-gray-600">{bookingData.theatreName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Seats</h3>
              <div className="grid gap-3">
                {bookingData.seats.map((seat, index) => (
                  <div
                    key={seat.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#3f110f] via-[#661F19] to-[#8b2a21] text-white rounded-lg flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Seat {seat.seatIdentifier}</div>
                        <div className="text-sm text-gray-600">Premium Seat</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">
                        LKR {seat.price ? seat.price.toLocaleString() : "0.00"}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t-2 border-purple-200 pt-4 mt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#3f110f] via-[#661F19] to-[#8b2a21] text-white rounded-lg">
                    <span className="text-xl font-bold">Total Amount</span>
                    <span className="text-2xl font-bold">LKR {bookingData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadTicket}
                className="group bg-gradient-to-r from-[#3f110f] via-[#661F19] to-[#8b2a21] text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Download Ticket
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-black/60 backdrop-blur-sm border border-white/30 text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Back to Home</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Important Instructions:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Please arrive 30 minutes before the show time</li>
                    <li>• Keep your QR code ready for scanning</li>
                    <li>• Screenshots or printed copies are accepted</li>
                    <li>• Contact support if you face any issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketView;