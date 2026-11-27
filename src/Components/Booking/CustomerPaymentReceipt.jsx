"use client";

import React, { useRef, useState } from "react";
import {
  Printer,
  Download,
  Building2,
  Globe,
  Receipt,
  User,
  Ticket,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import {
  generateReceiptPdf,
  loadLocalImageAsDataUrl,
  extractQrDataUrl,
} from "../../utils/ticketPdfGenerator";

/**
 * Standard Customer Payment Receipt Component strictly adhering to Visa & PAYable
 * card-absent transaction receipt requirements.
 * Renders all 9 mandatory sections:
 *  1. Merchant Name, Legal Entity & Location
 *  2. Merchant Online Address
 *  3. Order Reference & Transaction Date
 *  4. Buyer & Digital Delivery Details
 *  5. Itemized Description of Services Purchased (Sinhala & English Title, Venue & City, Seat Tier & Numbers)
 *  6. Itemized Amount & Currency (LKR) with "Online Booking Service Fee"
 *  7. Payment Information Block (Brand, masked last 4, Authorization Code, Auth Date, Purchase/Credit)
 *  8. Refund, Cancellation & Delivery Policy Summary
 *  9. Customer Service Contact
 */
export default function CustomerPaymentReceipt({
  receipt,
  booking,
  show,
  isPreview = false,
  onPrint = null,
  onDownload = null,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  // Fallback / Normalized Data Model
  const data = receipt || {
    merchantLegalName: "Zeylex Digital Solutions (Naataka.lk)",
    businessRegistrationNumber: "POL/ELH/ESD/02/01/1941/2026",
    merchantAddress: "No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka",
    countryOfDomicile: "Sri Lanka",
    merchantOnlineAddress: "https://naataka.lk",
    orderNumber: booking?.Id ? `ORD-${booking.Id}` : "PREVIEW-ORD-2026-001",
    bookingReference: booking?.ticketId || "WEN-001-C04-00192",
    transactionDate: booking?.created_at || "2026-11-27T01:10:19+05:30",
    formattedDateTime: "27 Nov 2026, 01:10:19 AM (+05:30)",
    buyerName: booking?.customerName || "Chathura Kavindu",
    buyerEmail: booking?.customerEmail || "buyer@naataka.lk",
    buyerMobile: booking?.customerPhone || "+94 77 123 4567",
    deliveryMethod: "Electronic Delivery — Instant QR E-Ticket (No physical shipping)",
    dramaTitleSinhala: "කැලණි පාලම",
    dramaTitleEnglish: "Kelani Palama",
    dramaTitleDisplay: show?.title || "කැලණි පාලම (Kelani Palama)",
    theatreVenue: show?.theatre?.name || booking?.theatreName || "Lionel Wendt Memorial Theatre",
    city: show?.city?.cityName || "Colombo 07",
    venueAndCity: "Lionel Wendt Memorial Theatre, Colombo 07",
    showDate: show?.showDate || "2026-12-05",
    showTime: show?.showTime || booking?.showTime || "06:30 PM",
    seatTierAndNumbers: "ODC Front — Seats C4, C5",
    seatCount: booking?.seatCount || 2,
    ticketSubtotalLkr: booking?.baseTicketTotal || 3500.0,
    serviceFeeLkr: booking?.buyerFeeAmount || 227.5,
    grandTotalLkr: booking?.totalAmount || 3727.5,
    currency: "LKR",
    paymentMethodBrand: "Visa",
    maskedCardLast4: "4242",
    paymentMethodDisplay: "Visa ending in 4242",
    authorizationCode: "PREVIEW-AUTH-001",
    authorizationDate: "2026-11-27T01:10:19+05:30",
    authorizationDateFormatted: "27 Nov 2026, 01:10:19 AM (+05:30)",
    transactionType: "Purchase",
    policySummary:
      "Digital QR e-tickets are valid for single entry at the venue. Full ticket face-value refunds are issued to the original payment card within 5–7 working days if an event is cancelled or rescheduled by the organizer. Buyer cancellations are non-refundable within 24 hours of showtime. View full policy at https://naataka.lk/refund-policy.",
    customerServiceContact: "Customer Support: support@naataka.lk | hello@zeylex.com | Tel: +94 74 155 0909",
    customerSupportEmail: "support@naataka.lk",
    customerZeylexEmail: "hello@zeylex.com",
    customerSupportPhone: "+94 74 155 0909",
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      setDownloading(true);
      const qrDataUrl = extractQrDataUrl(
        qrRef.current || document.getElementById("receipt-qr-canvas")
      );
      const logoDataUrl = await loadLocalImageAsDataUrl("/logo-nataka-white.png");

      const pdf = await generateReceiptPdf({
        receiptData: data,
        qrDataUrl,
        logoDataUrl,
      });

      const refNo = data.bookingReference || data.orderNumber || "Receipt";
      pdf.save(`Naataka_Receipt_${refNo}.pdf`);
      toast.success("Payment receipt PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. You can also print the receipt directly.");
    } finally {
      setDownloading(false);
    }
  };

  const copyRef = () => {
    const text = data.bookingReference || data.orderNumber || "";
    if (text && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("Reference number copied!");
    }
  };

  const subtotal = Number(data.ticketSubtotalLkr || 0);
  const serviceFee = Number(data.serviceFeeLkr || 0);
  const grandTotal = Number(data.grandTotalLkr || (subtotal + serviceFee));
  const isCredit = (data.transactionType || "").toLowerCase() === "credit";

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Print isolation styles */}
      <style>{`
        @media print {
          header, footer, nav, .no-print, button, .Toastify, [role="alert"] {
            display: none !important;
            visibility: hidden !important;
          }
          body, html, main {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-receipt-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-4 p-4 rounded-2xl bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Payment Receipt
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Card-absent transaction compliant with Visa & PAYable (Payments.lk) rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer"
            title="Print printable receipt layout"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="btn-theatre-gold px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            title="Download PDF transaction receipt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? "Generating PDF..." : "Download PDF Receipt"}</span>
          </button>
        </div>
      </div>

      {/* Preview Mode Alert Banner (if preview) */}
      {(isPreview || data.isPreview) && (
        <div className="no-print mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
              Preview Mode
            </span>
            <span>
              Inspecting compliance receipt with mock authorization code:{" "}
              <strong>{data.authorizationCode || "PREVIEW-AUTH-001"}</strong>
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINTABLE RECEIPT CARD BASE (9 MANDATORY SECTIONS)
          ========================================================================= */}
      <div
        id="printable-receipt-card"
        className="printable-receipt-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12121a] shadow-xl text-slate-900 dark:text-slate-100 transition-colors"
      >
        {/* 1. Header Band: Merchant Name, Legal Entity & Location */}
        <div className="p-6 bg-gradient-to-r from-[#661F19] via-[#85261F] to-[#661F19] text-white border-b-2 border-amber-400">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-amber-300" />
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {data.merchantLegalName || "Zeylex Digital Solutions (Naataka.lk)"}
                </h2>
              </div>
              <p className="text-xs text-amber-200/90 font-mono">
                Business Reg. No: <strong>{data.businessRegistrationNumber || "POL/ELH/ESD/02/01/1941/2026"}</strong>
              </p>
              <p className="text-[11px] text-amber-100/80 mt-1 leading-relaxed">
                {data.merchantAddress || "No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka"}
                <br />
                Country of Domicile: <strong>{data.countryOfDomicile || "Sri Lanka"}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCredit
                    ? "bg-rose-900/90 text-rose-200 border border-rose-400/40"
                    : "bg-emerald-900/90 text-emerald-200 border border-emerald-400/40"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCredit ? "Refund Credit" : "Payment Confirmed"}</span>
              </span>
              <p className="text-[11px] text-amber-200 font-mono mt-1.5">
                Ref: #{data.bookingReference || data.orderNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* 2 & 3. Merchant Online Address & Order Reference / Transaction Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Merchant Online Address
              </span>
              <a
                href={data.merchantOnlineAddress || "https://naataka.lk"}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#661F19] dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{data.merchantOnlineAddress || "https://naataka.lk"}</span>
                <ExternalLink className="w-3 h-3 opacity-70 no-print" />
              </a>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Order Reference & Date
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                  Order #: {data.bookingReference || data.orderNumber}
                </span>
                <button
                  onClick={copyRef}
                  className="no-print p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500"
                  title="Copy reference"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                Order Placed / Transaction Date:{" "}
                <strong>{data.formattedDateTime || data.transactionDate}</strong>
              </span>
            </div>
          </div>

          {/* 4. Buyer & Digital Delivery Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Buyer & Electronic Delivery Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Buyer Name</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {data.buyerName || "Valued Patron"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Email Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {data.buyerEmail || "customer@naataka.lk"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Mobile Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {data.buyerMobile || "+94 77 123 4567"}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                Delivery Method: {data.deliveryMethod || "Electronic Delivery — Instant QR E-Ticket (No physical shipping)"}
              </span>
            </div>
          </div>

          {/* 5. Itemized Description of Services Purchased */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block mb-1">
              Itemized Description of Services Purchased
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {data.dramaTitleDisplay || `${data.dramaTitleSinhala || "කැලණි පාලම"} (${data.dramaTitleEnglish || "Kelani Palama"})`}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Theatre Venue: <strong>{data.venueAndCity || `${data.theatreVenue}, ${data.city}`}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {data.showDate} at {data.showTime}
                </span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-extrabold text-[11px]">
                  {data.seatCount || 1} Seat{data.seatCount > 1 ? "s" : ""} Reserved
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Auditorium Seat Allocation
                </span>
                <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                  {data.seatTierAndNumbers || "ODC Front — Seats C4, C5"}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Guaranteed reserved admission • Single entry per QR
              </div>
            </div>
          </div>

          {/* 6. Itemized Amount & Currency (LKR) */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-white/5 px-4 py-2.5 border-b border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Itemized Financial Breakdown & Currency (LKR)
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Ticket Subtotal (Face Value):</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  LKR {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Online Booking Service Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  LKR {serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-white/10 text-sm font-extrabold">
                <span className="text-slate-900 dark:text-white">
                  Grand Total (Sri Lankan Rupees):
                </span>
                <span className="text-[#661F19] dark:text-amber-400 text-base">
                  LKR {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Sri Lankan Rupees)
                </span>
              </div>
            </div>
          </div>

          {/* 7. Payment Information Block & Instant Scannable QR Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="space-y-2 text-xs flex-1 w-full">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Card-Absent Payment Authorization Information
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Payment Method</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>{data.paymentMethodDisplay || data.paymentMethodBrand || "Visa / Mastercard"}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Authorization Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {data.authorizationCode || "PREVIEW-AUTH-001"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Authorization Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                    {data.authorizationDateFormatted || data.authorizationDate || data.formattedDateTime}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Transaction Type</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data.transactionType || "Purchase"}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Canvas */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0 text-center">
              <QRCodeCanvas
                id="receipt-qr-canvas"
                ref={qrRef}
                value={`NATAKA-RECEIPT-${data.bookingReference || data.orderNumber}`}
                size={120}
                style={{ width: "110px", height: "110px", display: "block" }}
                level="H"
                includeMargin={true}
                marginSize={1}
              />
              <span className="text-[9px] font-bold text-slate-600 block mt-1 uppercase tracking-wider">
                Instant QR Entry
              </span>
            </div>
          </div>

          {/* 8. Refund, Cancellation & Delivery Policy Summary */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <span className="font-bold block mb-1 flex items-center gap-1.5 text-blue-950 dark:text-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Refund, Cancellation & Delivery Policy Summary</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              {data.policySummary ||
                "Digital QR e-tickets are valid for single entry at the venue. Full ticket face-value refunds are issued to the original payment card within 5–7 working days if an event is cancelled or rescheduled by the organizer. Buyer cancellations are non-refundable within 24 hours of showtime. View full policy at https://naataka.lk/refund-policy."}
            </p>
          </div>

          {/* 9. Customer Service Contact */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-center space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-center gap-3">
              <span>{data.customerServiceContact || "Customer Support: support@naataka.lk | hello@zeylex.com | Tel: +94 74 155 0909"}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Receipt issued by <strong>Zeylex Digital Solutions</strong> (Naataka.lk) • All transactions protected by Visa & PAYable merchant regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
