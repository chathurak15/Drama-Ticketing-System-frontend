import { jsPDF } from "jspdf";

/**
 * Safely loads a local static image as a PNG data URL using an HTML5 canvas.
 * Times out gracefully after 1500ms to guarantee download is never blocked.
 *
 * @param {string} url - Static image path (e.g. "/logo-nataka-white.png")
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<string|null>} Data URL string or null
 */
export const loadLocalImageAsDataUrl = (url, timeoutMs = 1500) => {
  if (typeof window === "undefined" || !url) return Promise.resolve(null);

  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 140;
          canvas.height = img.naturalHeight || img.height || 40;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (err) {
          console.warn("Failed to get dataURL for image:", url, err);
          resolve(null);
        }
      };
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      };
      img.src = url;
    } catch (err) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
};

/**
 * Extract QR code data URL from an HTML5 canvas or SVG element.
 * Zero CORS / zero network / completely local.
 */
export const extractQrDataUrl = (canvasOrContainer) => {
  if (typeof window === "undefined" || !canvasOrContainer) return null;

  try {
    // 1. Direct canvas
    if (canvasOrContainer.tagName?.toLowerCase() === "canvas" && typeof canvasOrContainer.toDataURL === "function") {
      return canvasOrContainer.toDataURL("image/png");
    }

    // 2. Query canvas inside container
    const innerCanvas = canvasOrContainer.querySelector ? canvasOrContainer.querySelector("canvas") : null;
    if (innerCanvas && typeof innerCanvas.toDataURL === "function") {
      return innerCanvas.toDataURL("image/png");
    }

    // 3. Document fallback by ID
    const fallbackCanvas = document.getElementById("ticket-qr-canvas");
    if (fallbackCanvas && typeof fallbackCanvas.toDataURL === "function") {
      return fallbackCanvas.toDataURL("image/png");
    }
  } catch (err) {
    console.warn("Failed to extract QR code data URL from canvas:", err);
  }

  return null;
};

/**
 * Clean programmatic 1-Page A4 Printable Ticket PDF Generator using jsPDF directly.
 * Zero html2canvas, zero CSS color parsing errors, zero CORS issues.
 *
 * @param {Object} options
 * @param {Object} options.bookingData
 * @param {Object} options.showData
 * @param {string} [options.qrDataUrl] - base64 PNG data URL of the QR code
 * @param {string} [options.logoDataUrl] - base64 PNG data URL of the logo
 * @returns {jsPDF} Generated jsPDF instance
 */
export const generateTicketPdf = async ({
  bookingData = {},
  showData = {},
  qrDataUrl = null,
  logoDataUrl = null,
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // Card Boundary Geometry
  const cardX = 15;
  const cardY = 16;
  const cardW = 180;
  const cardH = 250;
  const cardRadius = 5;

  // Background outer subtle tint
  doc.setFillColor(248, 249, 251);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Main Ticket Card Base (Clean crisp white)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 224, 230);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, cardY, cardW, cardH, cardRadius, cardRadius, "FD");

  // --------------------------------------------------------------------------
  // 1. THEATRICAL CURTAIN HEADER BAND (Deep Maroon / Burgundy: #661F19)
  // --------------------------------------------------------------------------
  const headerH = 28;
  doc.setFillColor(102, 31, 25); // #661F19
  doc.roundedRect(cardX, cardY, cardW, headerH, cardRadius, cardRadius, "F");
  // Flatten bottom corners of the header band
  doc.rect(cardX, cardY + headerH - 4, cardW, 4, "F");

  // Gold accent divider line at bottom of header
  doc.setFillColor(254, 216, 0); // #FED800
  doc.rect(cardX, cardY + headerH, cardW, 0.8, "F");

  // Left: Brand Logo / Typography Fallback
  const logoX = cardX + 8;
  const logoY = cardY + 5;
  let logoDrawn = false;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", logoX, logoY, 36, 12, undefined, "FAST");
      logoDrawn = true;
    } catch (e) {
      console.warn("Could not embed logo image in PDF, using typographic fallback:", e);
    }
  }

  if (!logoDrawn) {
    // Elegant gold + white typographic logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(254, 216, 0); // Gold
    doc.text("Naataka", logoX, logoY + 8);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(".lk", logoX + 27, logoY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(253, 230, 138); // Amber-200
    doc.text("SRI LANKA'S PREMIER DRAMA PORTAL", logoX, logoY + 13);
  }

  // Right: Status Badge & Ticket ID
  const isRefunded = (bookingData.status || "").toLowerCase() === "refunded";
  const isRefundRequested = (bookingData.status || "").toLowerCase() === "refund_requested";
  const ticketIdStr = bookingData.ticketId || bookingData.id || "MAL-000-0000";

  // Status Badge Container
  const badgeW = 44;
  const badgeH = 7.5;
  const badgeX = cardX + cardW - badgeW - 8;
  const badgeY = cardY + 5.5;

  if (isRefunded) {
    doc.setFillColor(225, 29, 72); // Rose-600
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("VOIDED / REFUNDED", badgeX + badgeW / 2, badgeY + 5.2, { align: "center" });
  } else if (isRefundRequested) {
    doc.setFillColor(147, 51, 234); // Purple-600
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("REFUND UNDER REVIEW", badgeX + badgeW / 2, badgeY + 5.2, { align: "center" });
  } else {
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("CONFIRMED E-TICKET", badgeX + badgeW / 2, badgeY + 5.2, { align: "center" });
  }

  // Ticket ID display below badge
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(254, 240, 138); // Amber-100
  doc.text(`#${ticketIdStr}`, cardX + cardW - 8, cardY + 19, { align: "right" });

  // --------------------------------------------------------------------------
  // 2. EVENT DETAILS SECTION (Drama Title, Date, Time, Venue)
  // --------------------------------------------------------------------------
  let currentY = cardY + headerH + 8;

  // Small Category Tracker
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text("SRI LANKAN STAGE DRAMA PERFORMANCE", cardX + 8, currentY);
  currentY += 5.5;

  // Drama Title (Large & Bold)
  const dramaTitle =
    showData?.drama?.title ||
    showData?.title ||
    bookingData.showTitle ||
    "Stage Drama Show";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900

  // Split title into multiple lines if needed to prevent overflow
  const splitTitle = doc.splitTextToSize(dramaTitle, cardW - 16);
  doc.text(splitTitle, cardX + 8, currentY);
  currentY += splitTitle.length * 6.5;

  // Show subtitle if distinct
  if (showData?.title && showData.title !== dramaTitle) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(showData.title, cardX + 8, currentY);
    currentY += 5;
  }

  currentY += 1.5;

  // Key-Value Grid Box for Date, Time, Venue, and Door Details
  const gridBoxX = cardX + 8;
  const gridBoxY = currentY;
  const gridBoxW = cardW - 16;
  const gridBoxH = 31;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(gridBoxX, gridBoxY, gridBoxW, gridBoxH, 2.5, 2.5, "FD");

  // Col 1: Show Date
  const showDateVal = showData?.showDate || bookingData.showDate;
  const showDateFormatted = showDateVal
    ? new Date(showDateVal).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Date TBA";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("SHOW DATE", gridBoxX + 6, gridBoxY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(showDateFormatted, gridBoxX + 6, gridBoxY + 11.5);

  // Col 2: Curtain Time
  const curtainTime = showData?.showTime || bookingData.showTime || "7:00 PM";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("CURTAIN TIME", gridBoxX + 90, gridBoxY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(curtainTime, gridBoxX + 90, gridBoxY + 11.5);

  // Thin separator within grid
  doc.setDrawColor(226, 232, 240);
  doc.line(gridBoxX + 6, gridBoxY + 15, gridBoxX + gridBoxW - 6, gridBoxY + 15);

  // Row 2: Venue / Auditorium & Entrance Doors
  const theatreName =
    bookingData.theatreName ||
    showData?.theatre?.name ||
    showData?.location ||
    "Theatre Auditorium";
  const cityName = showData?.city?.cityName || "";
  const venueDisplay =
    cityName && !theatreName.toLowerCase().includes(cityName.toLowerCase())
      ? `${theatreName}, ${cityName}`
      : theatreName;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("VENUE / THEATRE AUDITORIUM", gridBoxX + 6, gridBoxY + 20.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(venueDisplay, 80), gridBoxX + 6, gridBoxY + 25.5);

  const doorDetails = showData?.theatre?.doorDetails
    ? `Gate: ${showData.theatre.entranceGate || "Main"} • Doors: ${showData.theatre.doorDetails}`
    : "Auditorium Main Entrance Gate";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("ENTRY GATE & DOORS", gridBoxX + 90, gridBoxY + 20.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(doc.splitTextToSize(doorDetails, 72), gridBoxX + 90, gridBoxY + 25.5);

  currentY = gridBoxY + gridBoxH + 6;

  // --------------------------------------------------------------------------
  // 3. THEATRICAL PERFORATED DIVIDER
  // --------------------------------------------------------------------------
  const dividerY = currentY + 1;
  // Left and right ticket notches (punched circles)
  doc.setFillColor(248, 249, 251);
  doc.circle(cardX, dividerY, 3.5, "F");
  doc.circle(cardX + cardW, dividerY, 3.5, "F");

  // Dashed tear-line
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([2.5, 2], 0);
  doc.line(cardX + 6, dividerY, cardX + cardW - 6, dividerY);
  doc.setLineDashPattern([], 0); // Reset to solid

  currentY = dividerY + 6;

  // --------------------------------------------------------------------------
  // 4. SEATS & LARGE SCANNABLE QR CODE ROW
  // --------------------------------------------------------------------------
  const seatQrRowY = currentY;
  const qrBoxSize = 46; // 46mm x 46mm
  const qrBoxX = cardX + cardW - qrBoxSize - 8;
  const seatsBoxW = cardW - qrBoxSize - 22;
  const seatsBoxH = qrBoxSize;

  // Left: Assigned Seats Card
  doc.setFillColor(255, 251, 235); // Amber-50
  doc.setDrawColor(253, 230, 138); // Amber-200
  doc.setLineWidth(0.35);
  doc.roundedRect(cardX + 8, seatQrRowY, seatsBoxW, seatsBoxH, 2.5, 2.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text("ASSIGNED AUDITORIUM SEATS", cardX + 13, seatQrRowY + 7.5);

  // Seat identifiers list
  const seatsList =
    bookingData.seats?.map((s) => s.seatIdentifier).filter(Boolean).join(", ") ||
    "General Admission";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(146, 64, 14); // Amber-800
  const splitSeats = doc.splitTextToSize(seatsList, seatsBoxW - 10);
  doc.text(splitSeats, cardX + 13, seatQrRowY + 15);

  const seatCount =
    bookingData.seatCount ||
    bookingData.seats?.length ||
    1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Admission: ${seatCount} Reserved Seat${seatCount > 1 ? "s" : ""}`,
    cardX + 13,
    seatQrRowY + 28
  );

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 113, 108);
  doc.text("Guaranteed seating • Please take your assigned seats promptly.", cardX + 13, seatQrRowY + 34);

  // Right: Large Scannable QR Code Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(qrBoxX, seatQrRowY, qrBoxSize, qrBoxSize, 2.5, 2.5, "FD");

  let qrDrawn = false;
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", qrBoxX + 2, seatQrRowY + 2, qrBoxSize - 4, qrBoxSize - 4, undefined, "FAST");
      qrDrawn = true;
    } catch (e) {
      console.warn("Failed to embed QR code image in PDF:", e);
    }
  }

  if (!qrDrawn) {
    // Stylized fallback for QR box
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("VERIFIED TICKET", qrBoxX + qrBoxSize / 2, seatQrRowY + 18, { align: "center" });
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`#${ticketIdStr}`, qrBoxX + qrBoxSize / 2, seatQrRowY + 26, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan At Entrance", qrBoxX + qrBoxSize / 2, seatQrRowY + 33, { align: "center" });
  }

  // QR Label below box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("SCAN FOR ENTRY", qrBoxX + qrBoxSize / 2, seatQrRowY + qrBoxSize + 3.5, { align: "center" });

  currentY = seatQrRowY + qrBoxSize + 7;

  // --------------------------------------------------------------------------
  // 5. ITEMIZED PAYMENT BREAKDOWN TABLE
  // --------------------------------------------------------------------------
  const totalPaid = Number(bookingData.totalAmount || 0);

  // Compute Base Face Value & Buyer Fee
  let faceValue = 0;
  if (
    bookingData.baseTicketTotal !== undefined &&
    bookingData.baseTicketTotal !== null &&
    Number(bookingData.baseTicketTotal) > 0
  ) {
    faceValue = Number(bookingData.baseTicketTotal);
  } else if (
    bookingData.seats &&
    bookingData.seats.length > 0 &&
    bookingData.seats.some((s) => Number(s.price) > 0)
  ) {
    faceValue = bookingData.seats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  } else if (bookingData.buyerFeeAmount && Number(bookingData.buyerFeeAmount) > 0) {
    faceValue = Math.max(0, totalPaid - Number(bookingData.buyerFeeAmount));
  } else if (bookingData.appliedBuyerFeePercent && Number(bookingData.appliedBuyerFeePercent) > 0) {
    const pct = Number(bookingData.appliedBuyerFeePercent);
    faceValue = Math.round((totalPaid / (1 + pct / 100)) * 100) / 100;
  } else {
    faceValue = totalPaid;
  }

  let buyerFeePercent = Number(bookingData.appliedBuyerFeePercent || 0);
  let buyerFeeAmount = Number(bookingData.buyerFeeAmount || 0);

  if (buyerFeePercent > 0 && (!buyerFeeAmount || buyerFeeAmount <= 0)) {
    buyerFeeAmount = Math.max(0, totalPaid - faceValue);
  } else if (!buyerFeePercent && buyerFeeAmount > 0 && faceValue > 0) {
    buyerFeePercent = Math.round((buyerFeeAmount / faceValue) * 100);
  }

  const hasConvenienceFee = buyerFeePercent > 0 && buyerFeeAmount > 0;
  const paymentBoxH = hasConvenienceFee ? 25 : 19;
  const paymentBoxX = cardX + 8;
  const paymentBoxW = cardW - 16;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(paymentBoxX, currentY, paymentBoxW, paymentBoxH, 2, 2, "FD");

  let pY = currentY + 5.5;

  // Line 1: Ticket Face Value
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Ticket Face Value:", paymentBoxX + 6, pY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `LKR ${faceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    paymentBoxX + paymentBoxW - 6,
    pY,
    { align: "right" }
  );

  // Line 2: Online Convenience Fee (if > 0%)
  if (hasConvenienceFee) {
    pY += 5.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Online Convenience Fee (${buyerFeePercent}%):`, paymentBoxX + 6, pY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `LKR ${buyerFeeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      paymentBoxX + paymentBoxW - 6,
      pY,
      { align: "right" }
    );
  }

  // Divider line before Total
  pY += 2.5;
  doc.setDrawColor(226, 232, 240);
  doc.line(paymentBoxX + 6, pY, paymentBoxX + paymentBoxW - 6, pY);

  // Line 3: Total Paid
  pY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Paid:", paymentBoxX + 6, pY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(
    `LKR ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    paymentBoxX + paymentBoxW - 6,
    pY,
    { align: "right" }
  );

  currentY += paymentBoxH + 6;

  // --------------------------------------------------------------------------
  // 6. GATE ADMISSION & SECURITY NOTICE
  // --------------------------------------------------------------------------
  const noticeBoxX = cardX + 8;
  const noticeBoxW = cardW - 16;
  const noticeBoxH = 15;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.roundedRect(noticeBoxX, currentY, noticeBoxW, noticeBoxH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Important Gate Entry & Verification Instructions:", noticeBoxX + 5, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  const noticeText =
    "Present this QR code directly on your mobile device or as a printed ticket at the auditorium gate. Each ticket carries an authentic cryptographic reference and can only be scanned once for entry.";
  doc.text(doc.splitTextToSize(noticeText, noticeBoxW - 10), noticeBoxX + 5, currentY + 8.5);

  currentY += noticeBoxH + 5;

  // --------------------------------------------------------------------------
  // 7. POLICY & SUPPORT FOOTER (Exact user specified policy string)
  // --------------------------------------------------------------------------
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(cardX + 8, currentY, cardX + cardW - 8, currentY);

  currentY += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  const policyText =
    "All ticket sales are final and non-refundable unless the show is cancelled or postponed by the organizer. Issued by Zeylex Digital Solutions (Naataka.lk) | Support: +94 74 155 0909";
  const splitPolicy = doc.splitTextToSize(policyText, cardW - 16);
  doc.text(splitPolicy, cardX + cardW / 2, currentY, { align: "center" });

  currentY += splitPolicy.length * 3.5 + 1;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(
    "Powered by Naataka.lk • Sri Lanka's Verified Stage Drama Ticketing Platform",
    cardX + cardW / 2,
    currentY,
    { align: "center" }
  );

  // --------------------------------------------------------------------------
  // 8. REFUNDED / VOIDED OVERLAY STAMP (if refunded)
  // --------------------------------------------------------------------------
  if (isRefunded) {
    doc.setDrawColor(225, 29, 72);
    doc.setLineWidth(1);
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(cardX + 25, cardY + 70, cardW - 50, 22, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(225, 29, 72);
    doc.text("VOIDED / REFUNDED", cardX + cardW / 2, cardY + 80, { align: "center" });

    doc.setFontSize(7.5);
    doc.setTextColor(159, 18, 57);
    doc.text("THIS TICKET HAS BEEN CANCELLED AND IS INVALID FOR ENTRY", cardX + cardW / 2, cardY + 86, {
      align: "center",
    });
  }

  return doc;
};

/**
 * Clean programmatic 1-Page A4 Customer Payment Receipt PDF Generator strictly conforming
 * to Visa and PAYable (Payments.lk) card-absent transaction receipt requirements.
 *
 * @param {Object} options
 * @param {Object} options.receiptData - 9-section BookingReceiptDTO
 * @param {string} [options.qrDataUrl] - base64 PNG data URL of the QR code
 * @param {string} [options.logoDataUrl] - base64 PNG data URL of brand logo
 * @returns {jsPDF} Generated jsPDF instance
 */
export const generateReceiptPdf = async ({
  receiptData = {},
  qrDataUrl = null,
  logoDataUrl = null,
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Background subtle canvas
  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Receipt Card Base
  const cardX = margin;
  const cardY = 12;
  const cardW = contentWidth;
  const cardH = 272;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, "FD");

  // =========================================================================
  // 1. THEATRICAL MAROON HEADER BAND (#661F19)
  // =========================================================================
  const headerH = 26;
  doc.setFillColor(102, 31, 25); // #661F19
  doc.roundedRect(cardX, cardY, cardW, headerH, 3, 3, "F");
  doc.rect(cardX, cardY + headerH - 3, cardW, 3, "F");

  // Gold accent divider line (#FED800)
  doc.setFillColor(254, 216, 0);
  doc.rect(cardX, cardY + headerH, cardW, 0.8, "F");

  // Header Left: Merchant Legal Entity & Location
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(
    receiptData.merchantLegalName || "Zeylex Digital Solutions (Naataka.lk)",
    cardX + 8,
    cardY + 8
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(254, 240, 138); // Amber-100
  doc.text(
    `BR: ${receiptData.businessRegistrationNumber || "POL/ELH/ESD/02/01/1941/2026"} • Domicile: ${
      receiptData.countryOfDomicile || "Sri Lanka"
    }`,
    cardX + 8,
    cardY + 13.5
  );
  doc.text(
    `${receiptData.merchantAddress || "No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka"} • ${
      receiptData.merchantOnlineAddress || "https://naataka.lk"
    }`,
    cardX + 8,
    cardY + 18
  );

  // Header Right: Badge & Reference
  const isCredit = (receiptData.transactionType || "").toLowerCase() === "credit";
  const badgeW = 40;
  const badgeH = 7;
  const badgeX = cardX + cardW - badgeW - 8;
  const badgeY = cardY + 5;

  doc.setFillColor(isCredit ? 225 : 22, isCredit ? 29 : 163, isCredit ? 72 : 74);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(isCredit ? "REFUND CREDIT" : "PURCHASE PAID", badgeX + badgeW / 2, badgeY + 4.8, {
    align: "center",
  });

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(254, 240, 138);
  doc.text(
    `#${receiptData.bookingReference || receiptData.orderNumber || "WEN-001-C04-00192"}`,
    cardX + cardW - 8,
    cardY + 18,
    { align: "right" }
  );

  let curY = cardY + headerH + 7;

  // Helper function to draw Section Header
  const drawSection = (title) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(102, 31, 25);
    doc.text(title, cardX + 8, curY);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(cardX + 8, curY + 1.8, cardX + cardW - 8, curY + 1.8);
    curY += 6;
  };

  // Helper function to draw Key-Value Row
  const drawKV = (label, value, isBold = false) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(label, cardX + 10, curY);

    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(String(value || "-"), cardX + 64, curY);
    curY += 4.6;
  };

  // =========================================================================
  // 3. ORDER REFERENCE & TRANSACTION DATE
  // =========================================================================
  drawSection("1. ORDER REFERENCE & TRANSACTION RECORD");
  drawKV("Order Reference #:", receiptData.orderNumber || receiptData.bookingReference || "PREVIEW-ORD-2026-001", true);
  drawKV("Booking Reference:", receiptData.bookingReference || "WEN-001-C04-00192", true);
  drawKV(
    "Order Placed / Date:",
    receiptData.formattedDateTime || receiptData.transactionDate || "27 Nov 2026, 01:10:19 AM (+05:30)"
  );
  drawKV("Merchant Online URL:", receiptData.merchantOnlineAddress || "https://naataka.lk");
  curY += 2;

  // =========================================================================
  // 4. BUYER & DIGITAL DELIVERY DETAILS
  // =========================================================================
  drawSection("2. BUYER & ELECTRONIC DELIVERY DETAILS");
  drawKV("Buyer Full Name:", receiptData.buyerName || "Chathura Kavindu", true);
  drawKV("Buyer Contact:", `${receiptData.buyerEmail || "buyer@naataka.lk"} | ${receiptData.buyerMobile || "+94 77 123 4567"}`);
  drawKV(
    "Delivery Method:",
    receiptData.deliveryMethod || "Electronic Delivery — Instant QR E-Ticket (No physical shipping)",
    true
  );
  curY += 2;

  // =========================================================================
  // 5. ITEMIZED DESCRIPTION OF SERVICES PURCHASED
  // =========================================================================
  drawSection("3. ITEMIZED DESCRIPTION OF SERVICES PURCHASED");
  const dramaTitleDisplay =
    receiptData.dramaTitleDisplay ||
    (receiptData.dramaTitleSinhala && receiptData.dramaTitleEnglish
      ? `${receiptData.dramaTitleSinhala} (${receiptData.dramaTitleEnglish})`
      : "කැලණි පාලම (Kelani Palama)");
  drawKV("Stage Drama Title:", dramaTitleDisplay, true);
  drawKV(
    "Theatre Venue & City:",
    receiptData.venueAndCity || `${receiptData.theatreVenue || "Lionel Wendt Memorial Theatre"}, ${receiptData.city || "Colombo 07"}`
  );
  drawKV(
    "Performance Schedule:",
    `${receiptData.showDate || "2026-12-05"} at ${receiptData.showTime || "06:30 PM"}`
  );
  drawKV(
    "Seat Tier & Allocation:",
    `${receiptData.seatTierAndNumbers || "ODC Front — Seats C4, C5"} (${receiptData.seatCount || 2} Seats)`,
    true
  );
  curY += 2;

  // =========================================================================
  // 6 & 7. ITEMIZED AMOUNT & CARD-ABSENT PAYMENT INFORMATION
  // =========================================================================
  drawSection("4. ITEMIZED AMOUNT & CARD-ABSENT PAYMENT AUTHORIZATION");

  // Financial Table Box
  const tableY = curY;
  const tableW = cardW - 16;
  const tableH = 26;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX + 8, tableY, tableW, tableH, 2, 2, "FD");

  const subtotal = Number(receiptData.ticketSubtotalLkr || 3500).toFixed(2);
  const serviceFee = Number(receiptData.serviceFeeLkr || 227.5).toFixed(2);
  const grandTotal = Number(receiptData.grandTotalLkr || 3727.5).toFixed(2);
  const currency = receiptData.currency || "LKR";

  // Row 1: Subtotal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Ticket Subtotal (Face Value):", cardX + 12, tableY + 5.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${currency} ${Number(subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, cardX + cardW - 12, tableY + 5.5, { align: "right" });

  // Row 2: Service Fee
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Online Booking Service Fee:", cardX + 12, tableY + 11.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${currency} ${Number(serviceFee).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, cardX + cardW - 12, tableY + 11.5, { align: "right" });

  // Divider inside table
  doc.setDrawColor(226, 232, 240);
  doc.line(cardX + 10, tableY + 15, cardX + cardW - 10, tableY + 15);

  // Row 3: Grand Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Grand Total (${currency}):`, cardX + 12, tableY + 21);
  doc.setFontSize(9.5);
  doc.setTextColor(102, 31, 25); // Maroon
  doc.text(
    `${currency} ${Number(grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })} (Sri Lankan Rupees)`,
    cardX + cardW - 12,
    tableY + 21,
    { align: "right" }
  );

  curY = tableY + tableH + 6;

  // Payment Block Key Values
  const paymentBrandDisplay =
    receiptData.paymentMethodDisplay ||
    (receiptData.maskedCardLast4
      ? `${receiptData.paymentMethodBrand || "Visa"} ending in ${receiptData.maskedCardLast4}`
      : receiptData.paymentMethodBrand || "Visa / Mastercard");

  drawKV("Payment Method:", paymentBrandDisplay, true);
  drawKV("Authorization Code:", receiptData.authorizationCode || "PREVIEW-AUTH-001", true);
  drawKV(
    "Authorization Date:",
    receiptData.authorizationDateFormatted || receiptData.authorizationDate || receiptData.formattedDateTime || "27 Nov 2026, 01:10:19 AM (+05:30)"
  );
  drawKV("Transaction Type:", receiptData.transactionType || "Purchase", true);

  // QR Code on right side of payment block if available
  if (qrDataUrl) {
    try {
      const qrSize = 34;
      const qrX = cardX + cardW - qrSize - 10;
      const qrY = curY - 26;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text("SCAN FOR VENUE ENTRY", qrX + qrSize / 2, qrY + qrSize + 3, { align: "center" });
    } catch (e) {
      console.warn("Failed to embed QR code in receipt PDF:", e);
    }
  }

  curY += 4;

  // =========================================================================
  // 8. REFUND, CANCELLATION & DELIVERY POLICY SUMMARY
  // =========================================================================
  drawSection("5. REFUND, CANCELLATION & DELIVERY POLICY");
  const policyBoxY = curY;
  const policyBoxW = cardW - 16;
  const policyBoxH = 22;

  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(219, 234, 254);
  doc.roundedRect(cardX + 8, policyBoxY, policyBoxW, policyBoxH, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(30, 64, 175); // Blue-800
  const policyLines = doc.splitTextToSize(
    receiptData.policySummary ||
      "Digital QR e-tickets are valid for single entry at the venue. Full ticket face-value refunds are issued to the original payment card within 5–7 working days if an event is cancelled or rescheduled by the organizer. Buyer cancellations are non-refundable within 24 hours of showtime. View full policy at https://naataka.lk/refund-policy.",
    policyBoxW - 8
  );
  doc.text(policyLines, cardX + 12, policyBoxY + 5.5);

  curY = policyBoxY + policyBoxH + 6;

  // =========================================================================
  // 9. CUSTOMER SERVICE CONTACT & FOOTER
  // =========================================================================
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(cardX + 8, curY, cardX + cardW - 8, curY);
  curY += 4.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    receiptData.customerServiceContact ||
      "Customer Support: support@naataka.lk | hello@zeylex.com | Tel: +94 74 155 0909",
    cardX + cardW / 2,
    curY,
    { align: "center" }
  );
  curY += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Automated card-absent transaction receipt generated by Naataka.lk • Operated by Zeylex Digital Solutions, Sri Lanka",
    cardX + cardW / 2,
    curY,
    { align: "center" }
  );

  return doc;
};
