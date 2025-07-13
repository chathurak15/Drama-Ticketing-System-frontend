import React, { useEffect, useState,useRef } from "react";
import {QrCode, Calendar, Clock, MapPin, Download, Theater, Smartphone } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { getBooking } from "../../services/BookingService";
import { getShowById } from "../../services/ShowService";
import { QRCodeSVG } from "qrcode.react";

const TicketView = () => {
  const { id } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [showData, setShowData] = useState({});
  const ticketRef = useRef();

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const booking = await getBooking(id);
        setBookingData(booking.data);
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

  const handleDownloadTicket = async () => {
  const ticketElement = ticketRef.current;
  if (!ticketElement) return;
  try {
    const canvas = await html2canvas(ticketElement, {
      scale: 1.5,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/jpeg", 1); 
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });
    pdf.addImage(
      imgData,
      "JPEG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight()
    );
    pdf.save(`ticket_${bookingData.ticketId}.pdf`);
  } catch (err) {
    alert("Failed to generate PDF. See console for details.");
    console.error(err);
  }
};

 

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          ref={ticketRef}
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2rem",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            overflow: "hidden"
          }}
        >
          {/* Header with gradient (replace oklab with hex) */}
          <div style={{
            background: "linear-gradient(to right, #3f110f, #661F19, #8b2a21)",
            padding: "2rem 0.5rem 1rem 2rem",
            color: "#fff",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }}></div>
            <div style={{ position: "relative", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <img src="/public/images/logo nataka white.png" alt="logo" style={{ width: "140px" }} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Ticket ID</div>
                  <div style={{ fontFamily: "monospace", fontSize: "1.2rem" }}>{bookingData.ticketId}</div>
                </div>
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{showData.title}</h2>
            </div>
          </div>

          <div style={{ padding: "2rem" }}>
            {/* QR Code Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <QrCode style={{ width: "24px", height: "24px", color: "#4b5563" }} />
                    <span style={{ fontWeight: 600, color: "#1f2937" }}>Scan to Enter</span>
                  </div>
                  <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", justifyContent: "center" }}>
                    <QRCodeSVG value={`${bookingData.ticketId}`} size={192} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                    <Smartphone style={{ width: "16px", height: "16px" }} />
                    <span>Show this code at the venue</span>
                  </div>
                </div>
              </div>

              {/* Show Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1f2937", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Calendar style={{ width: "20px", height: "20px", color: "#9333ea" }} />
                    Event Details
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#f3e8ff", borderRadius: "0.5rem" }}>
                      <Calendar style={{ width: "20px", height: "20px", color: "#9333ea" }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>Date</div>
                        <div style={{ color: "#4b5563" }}>{new Date(showData.showDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#eff6ff", borderRadius: "0.5rem" }}>
                      <Clock style={{ width: "20px", height: "20px", color: "#2563eb" }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>Time</div>
                        <div style={{ color: "#4b5563" }}>{showData.showTime}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#ecfdf5", borderRadius: "0.5rem" }}>
                      <MapPin style={{ width: "20px", height: "20px", color: "#059669" }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>Venue</div>
                        <div style={{ color: "#4b5563" }}>{showData?.location || "Unknown Location"} - {showData?.city?.cityName || "Unknown City"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#fff7ed", borderRadius: "0.5rem" }}>
                      <Theater style={{ width: "20px", height: "20px", color: "#ea580c" }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>Theater</div>
                        <div style={{ color: "#4b5563" }}>{bookingData.theatreName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Details */}
            <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1f2937", marginBottom: "1rem" }}>Your Seats</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {bookingData.seats.map((seat, index) => (
                  <div key={seat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "linear-gradient(to right, #f3e8ff, #fce7f3)", borderRadius: "0.5rem", border: "1px solid #e9d5ff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "40px", height: "40px", background: "linear-gradient(to right, #3f110f, #661F19, #8b2a21)", color: "#fff", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{index + 1}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>Seat {seat.seatIdentifier}</div>
                        <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>Premium Seat</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#1f2937" }}>LKR {seat.price ? seat.price.toLocaleString() : "0.00"}</div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "2px solid #e9d5ff", paddingTop: "1rem", marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "linear-gradient(to right, #3f110f, #661F19, #8b2a21)", color: "#fff", borderRadius: "0.5rem" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Total Amount</span>
                    <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>LKR {bookingData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button
                onClick={handleDownloadTicket}
                style={{ background: "linear-gradient(to right, #3f110f, #661F19, #8b2a21)", color: "#fff", padding: "1rem 1.5rem", borderRadius: "1rem", fontWeight: "bold", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontSize: "1rem", border: "none", cursor: "pointer" }}
              >
                <Download style={{ width: "20px", height: "20px" }} />
                Download Ticket
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "1rem 1.5rem", borderRadius: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontSize: "1rem", cursor: "pointer" }}
              >
                <span>Back to Home</span>
              </button>
            </div>

            {/* Additional Info */}
            <div style={{ marginTop: "2rem", padding: "1rem", background: "#eff6ff", borderRadius: "0.75rem", border: "1px solid #bae6fd" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", background: "#3b82f6", borderRadius: "9999px", marginTop: "0.5rem", flexShrink: 0 }}></div>
                <div style={{ fontSize: "0.95rem", color: "#1e40af" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Important Instructions:</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
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