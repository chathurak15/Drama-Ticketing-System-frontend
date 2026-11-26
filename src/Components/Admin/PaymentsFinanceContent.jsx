"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  Download,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Layers,
  ArrowUpRight,
  Eye,
  Copy,
  Printer,
  RefreshCw,
  X,
  RotateCcw,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getAdminPayments, getFinanceSummary } from "../../services/FinanceService";
import { getAllRefundsAdmin, processRefundAdmin, manualRefundBookingAdmin } from "../../services/RefundService";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

const PaymentsFinanceContent = () => {
  const [activeSubTab, setActiveSubTab] = useState("payments"); // 'payments' | 'reports'

  // --- Payments State ---
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentTotalItems, setPaymentTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // --- Reports State ---
  const [dateRangeOption, setDateRangeOption] = useState("all"); // 'all' | '7d' | '30d' | 'this_month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // --- Refunds State ---
  const [refundRequests, setRefundRequests] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [processModalRefund, setProcessModalRefund] = useState(null);
  const [processForm, setProcessForm] = useState({
    refundMethod: "BANK_TRANSFER",
    refundReferenceNo: "",
  });
  const [submittingProcess, setSubmittingProcess] = useState(false);

  // --- Manual Override Refund State ---
  const [manualRefundBooking, setManualRefundBooking] = useState(null);
  const [manualRefundForm, setManualRefundForm] = useState({
    reason: "Admin manual override refund",
    refundMethod: "PAYHERE_REVERSAL",
    refundReferenceNo: "",
    releaseSeats: true,
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  useEffect(() => {
    if (activeSubTab === "refunds") {
      fetchRefunds();
    }
  }, [activeSubTab]);

  const fetchRefunds = async () => {
    setLoadingRefunds(true);
    try {
      const res = await getAllRefundsAdmin();
      setRefundRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching refund requests", err);
      toast.error("Failed to load refund requests.");
    } finally {
      setLoadingRefunds(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!processForm.refundReferenceNo.trim()) {
      toast.warn("Please enter a refund reference number.");
      return;
    }
    setSubmittingProcess(true);
    try {
      const res = await processRefundAdmin(processModalRefund.id, {
        refundMethod: processForm.refundMethod,
        refundReferenceNo: processForm.refundReferenceNo.trim(),
        status: "PROCESSED",
      });
      toast.success("Refund processed successfully! Confirmation email sent to ticket holder.");
      setRefundRequests((prev) =>
        prev.map((r) => (r.id === processModalRefund.id ? res.data : r))
      );
      setProcessModalRefund(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to process refund.";
      toast.error(typeof msg === "string" ? msg : "Failed to process refund.");
    } finally {
      setSubmittingProcess(false);
    }
  };

  const handleManualRefund = async (e) => {
    e.preventDefault();
    if (!manualRefundForm.refundReferenceNo.trim()) {
      toast.warn("Please enter a refund reference number.");
      return;
    }
    setSubmittingManual(true);
    try {
      await manualRefundBookingAdmin(manualRefundBooking.id, {
        reason: manualRefundForm.reason.trim(),
        refundMethod: manualRefundForm.refundMethod,
        refundReferenceNo: manualRefundForm.refundReferenceNo.trim(),
        releaseSeats: manualRefundForm.releaseSeats,
      });
      toast.success("Manual override refund processed successfully! Ticket has been voided.");
      setPayments((prev) =>
        prev.map((p) => (p.id === manualRefundBooking.id ? { ...p, status: "REFUNDED" } : p))
      );
      setManualRefundBooking(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to process manual refund.";
      toast.error(typeof msg === "string" ? msg : "Failed to process manual refund.");
    } finally {
      setSubmittingManual(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [paymentPage, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, [dateRangeOption]);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await getAdminPayments({
        page: paymentPage,
        size: 15,
        status: statusFilter === "ALL" ? "" : statusFilter,
        search: searchQuery,
      });
      setPayments(res.data.content || []);
      setPaymentTotalPages(res.data.totalPages || 1);
      setPaymentTotalItems(res.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching payments", err);
      toast.error("Failed to load payment transactions.");
    } finally {
      setLoadingPayments(false);
    }
  };

  const calculateDates = () => {
    if (dateRangeOption === "all") {
      return {
        startDate: "",
        endDate: "",
      };
    }

    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (dateRangeOption === "7d") {
      start.setDate(today.getDate() - 7);
    } else if (dateRangeOption === "30d") {
      start.setDate(today.getDate() - 30);
    } else if (dateRangeOption === "this_month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (dateRangeOption === "custom") {
      return {
        startDate: customStartDate || "",
        endDate: customEndDate || "",
      };
    }

    const fmt = (d) => d.toISOString().split("T")[0];
    return {
      startDate: fmt(start),
      endDate: fmt(end),
    };
  };

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const dates = calculateDates();
      const res = await getFinanceSummary(dates);
      setSummaryData(res.data);
    } catch (err) {
      console.error("Error fetching financial summary", err);
      toast.error("Failed to compile financial metrics.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCopyTicket = (ticketId) => {
    navigator.clipboard.writeText(ticketId).then(() => {
      toast.success(`Copied ticket ID: ${ticketId}`);
    }).catch(() => {
      toast.error("Failed to copy ticket ID.");
    });
  };

  // --- Export to CSV ---
  const handleExportCSV = () => {
    if (!summaryData) {
      toast.error("Please load financial data first.");
      return;
    }

    let csv = "NATAKA.LK FINANCIAL & BOX OFFICE LEDGER\n";
    csv += `Period: ${summaryData.periodStart || ""} to ${summaryData.periodEnd || ""}\n\n`;

    csv += "--- PLATFORM TREASURY & FINANCIAL SEPARATION ---\n";
    csv += `Buyer Gross Collected (LKR),${summaryData.buyerGrossCollected || summaryData.totalGrossRevenue || 0}\n`;
    csv += `Platform Convenience Fee Revenue (LKR),${summaryData.platformConvenienceFeeRevenue || 0}\n`;
    csv += `Organizer Net Ticket Share (LKR),${summaryData.organizerNetTicketShare || 0}\n`;
    csv += `Tranche 1 Advance Disbursed (LKR),${summaryData.tranche1Disbursed || 0}\n`;
    csv += `Tranche 2 Final Disbursed (LKR),${summaryData.tranche2Disbursed || 0}\n`;
    csv += `Total Disbursed (LKR),${summaryData.totalDisbursed || 0}\n`;
    csv += `Net Balance Due to Partners (LKR),${summaryData.netBalanceDue || 0}\n\n`;

    csv += "--- EXECUTIVE SUMMARY ---\n";
    csv += `Total Gross Revenue (LKR),${summaryData.totalGrossRevenue || 0}\n`;
    csv += `Confirmed Net Revenue (LKR),${summaryData.confirmedRevenue || 0}\n`;
    csv += `All-Time Confirmed Revenue (LKR),${summaryData.allTimeConfirmedRevenue || 0}\n`;
    csv += `Confirmed Transactions,${summaryData.confirmedCount || 0}\n`;
    csv += `Total Tickets Sold,${summaryData.totalTicketsSold || 0}\n`;
    csv += `Average Order Value (LKR),${summaryData.averageOrderValue || 0}\n\n`;

    csv += "--- REVENUE BY DRAMA PRODUCTION ---\n";
    csv += "Drama Title,Tickets Sold,Gross Revenue (LKR),Box Office Share (%)\n";
    if (summaryData.dramaBreakdown) {
      summaryData.dramaBreakdown.forEach((d) => {
        csv += `"${d.dramaTitle}",${d.ticketsSold},${d.revenue},${d.sharePercentage}%\n`;
      });
    }

    csv += "\n--- REVENUE BY THEATRE VENUE ---\n";
    csv += "Theatre / Venue,Gross Revenue (LKR)\n";
    if (summaryData.theatreBreakdown) {
      summaryData.theatreBreakdown.forEach((t) => {
        csv += `"${t.theatreName}",${t.revenue}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `nataka_finance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Financial statement exported to CSV successfully!");
  };

  // --- Export to PDF ---
  const handleExportPDF = () => {
    if (!summaryData) {
      toast.error("Please load financial data first.");
      return;
    }

    try {
      const doc = new jsPDF();

      // Brand Header
      doc.setFillColor(102, 31, 25); // #661F19 Nataka Crimson
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(254, 216, 0); // #FED800 Gold
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("NATAKA.LK", 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL FINANCIAL & BOX OFFICE LEDGER STATEMENT", 60, 18);

      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()} | Period: ${dateRangeOption.toUpperCase()}`, 14, 27);

      // Section 1: Platform Treasury & Executive KPI Summary
      let y = 44;
      doc.setTextColor(30, 30, 45);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("1. Platform Treasury & Revenue Separation Audit", 14, y);

      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(102, 31, 25);
      doc.text(`Buyer Gross Collected: LKR ${(summaryData.buyerGrossCollected || summaryData.totalGrossRevenue || 0).toLocaleString()}`, 14, y);
      doc.setTextColor(190, 130, 0);
      doc.text(`eNataka Platform Fee Revenue: LKR ${(summaryData.platformConvenienceFeeRevenue || 0).toLocaleString()}`, 110, y);

      y += 6;
      doc.setTextColor(30, 30, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`Organizer Net Ticket Share: LKR ${(summaryData.organizerNetTicketShare || 0).toLocaleString()}`, 14, y);
      doc.text(`Total Disbursed (T1+T2): LKR ${(summaryData.totalDisbursed || 0).toLocaleString()}`, 110, y);

      y += 6;
      doc.text(`Tranche 1 Advance Disbursed: LKR ${(summaryData.tranche1Disbursed || 0).toLocaleString()}`, 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 40, 40);
      doc.text(`Net Balance Due to Partners: LKR ${(summaryData.netBalanceDue || 0).toLocaleString()}`, 110, y);

      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 70);
      doc.text(`Total Tickets Sold: ${summaryData.totalTicketsSold || 0} admissions | Confirmed Orders: ${summaryData.confirmedCount || 0} | Avg Order: LKR ${(summaryData.averageOrderValue || 0).toLocaleString()}`, 14, y);

      // Section 2: Production Breakdown
      y += 14;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("2. Box Office Breakdown by Drama Production", 14, y);

      y += 8;
      doc.setFillColor(240, 240, 245);
      doc.rect(14, y, 182, 7, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 70);
      doc.text("Production Title", 16, y + 5);
      doc.text("Tickets Sold", 100, y + 5);
      doc.text("Gross Revenue (LKR)", 135, y + 5);
      doc.text("Share (%)", 175, y + 5);

      y += 8;
      doc.setFont("helvetica", "normal");
      if (summaryData.dramaBreakdown && summaryData.dramaBreakdown.length > 0) {
        summaryData.dramaBreakdown.forEach((item, index) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          if (index % 2 === 1) {
            doc.setFillColor(248, 248, 250);
            doc.rect(14, y - 3, 182, 6, "F");
          }
          doc.text(String(item.dramaTitle).substring(0, 45), 16, y + 1);
          doc.text(String(item.ticketsSold || 0), 105, y + 1);
          doc.text(`LKR ${(item.revenue || 0).toLocaleString()}`, 135, y + 1);
          doc.text(`${item.sharePercentage || 0}%`, 178, y + 1);
          y += 6;
        });
      } else {
        doc.text("No production transactions recorded in this period.", 16, y + 1);
        y += 8;
      }

      // Section 3: Theatre Venues
      y += 8;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 45);
      doc.text("3. Venue Financial Contribution", 14, y);

      y += 8;
      doc.setFillColor(240, 240, 245);
      doc.rect(14, y, 182, 7, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 70);
      doc.text("Theatre / Venue Location", 16, y + 5);
      doc.text("Total Volume (LKR)", 140, y + 5);

      y += 8;
      doc.setFont("helvetica", "normal");
      if (summaryData.theatreBreakdown && summaryData.theatreBreakdown.length > 0) {
        summaryData.theatreBreakdown.forEach((item, index) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          if (index % 2 === 1) {
            doc.setFillColor(248, 248, 250);
            doc.rect(14, y - 3, 182, 6, "F");
          }
          doc.text(String(item.theatreName).substring(0, 55), 16, y + 1);
          doc.text(`LKR ${(item.revenue || 0).toLocaleString()}`, 140, y + 1);
          y += 6;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Nataka.lk System Generated Financial Audit Statement • Page ${i} of ${pageCount}`, 14, 290);
      }

      doc.save(`nataka_financial_statement_${Date.now()}.pdf`);
      toast.success("PDF Financial Statement successfully generated and downloaded!");
    } catch (e) {
      console.error("PDF generation failed:", e);
      toast.error("Failed to generate PDF document.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" />
              Treasury & Settlements
            </span>
            <span className="text-xs text-slate-400">All-In-One Box Office Ledger</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Payments & Finance Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit customer payments, manage PayHere transactions, inspect seat revenues, and generate exportable financial statements.
          </p>
        </div>

        {/* Sub-Tab Navigation Toggle */}
        <div className="flex items-center bg-[#1b1b28] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveSubTab("payments")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === "payments"
                ? "bg-gradient-to-r from-[#661F19] to-[#80251e] text-white shadow-md shadow-[#661F19]/40 border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#FED800]" />
            <span>Payments Ledger</span>
          </button>
          <button
            onClick={() => setActiveSubTab("refunds")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === "refunds"
                ? "bg-gradient-to-r from-[#661F19] to-[#80251e] text-white shadow-md shadow-[#661F19]/40 border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Refunds Management</span>
          </button>
          <button
            onClick={() => setActiveSubTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === "reports"
                ? "bg-gradient-to-r from-[#661F19] to-[#80251e] text-white shadow-md shadow-[#661F19]/40 border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-[#FED800]" />
            <span>Finance Reports</span>
          </button>
        </div>
      </div>

      {/* Platform Treasury & Financial Audit Cards (Strict Separation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FED800]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Platform Treasury & Milestone Revenue Audit
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Strict Separation • Buyer vs. Platform vs. Partner
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Buyer Gross Collected */}
          <div className="bg-[#14141e] border border-white/10 p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute right-3 top-3 w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Buyer Gross Collected
            </div>
            <div className="text-xl font-black text-white mt-1">
              LKR {(summaryData?.buyerGrossCollected ?? (summaryData?.confirmedRevenue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>Gross via PayHere Gateway</span>
            </div>
          </div>

          {/* 2. Platform Convenience Fee Revenue */}
          <div className="bg-[#14141e] border border-[#FED800]/20 bg-gradient-to-br from-[#14141e] to-[#FED800]/5 p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:border-[#FED800]/50 transition-all">
            <div className="absolute right-3 top-3 w-10 h-10 bg-[#FED800]/15 rounded-xl flex items-center justify-center text-[#FED800] border border-[#FED800]/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold text-[#FED800] uppercase tracking-wider flex items-center gap-1">
              <span>eNataka Platform Fee</span>
            </div>
            <div className="text-xl font-black text-[#FED800] mt-1">
              LKR {(summaryData?.platformConvenienceFeeRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-300 mt-1 font-medium">
              6.5% / 5.5% platform margin
            </div>
          </div>

          {/* 3. Organizer Net Ticket Share */}
          <div className="bg-[#14141e] border border-white/10 p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="absolute right-3 top-3 w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Organizer Net Ticket Share
            </div>
            <div className="text-xl font-black text-blue-300 mt-1">
              LKR {(summaryData?.organizerNetTicketShare || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-blue-400 mt-1">
              Partner gross face value share
            </div>
          </div>

          {/* 4. Tranche 1 Advance Disbursed */}
          <div className="bg-[#14141e] border border-white/10 p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="absolute right-3 top-3 w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tranche 1 Disbursed
            </div>
            <div className="text-xl font-black text-purple-300 mt-1">
              LKR {(summaryData?.tranche1Disbursed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Total Paid: LKR {(summaryData?.totalDisbursed || 0).toLocaleString()}
            </div>
          </div>

          {/* 5. Net Balance Due */}
          <div className="bg-[#14141e] border border-rose-500/20 bg-gradient-to-br from-[#14141e] to-rose-500/5 p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div className="absolute right-3 top-3 w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
              Net Balance Due
            </div>
            <div className="text-xl font-black text-rose-400 mt-1">
              LKR {(summaryData?.netBalanceDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-rose-300 mt-1 font-semibold">
              Remaining partner liability
            </div>
          </div>
        </div>

        {/* Secondary Operational KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-[#1b1b28]/60 border border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span className="text-[11px] text-slate-400">All-Time Confirmed Gross</span>
            <span className="text-xs font-bold text-white">
              LKR {(summaryData?.allTimeConfirmedRevenue || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#1b1b28]/60 border border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Total Tickets Sold</span>
            <span className="text-xs font-bold text-[#FED800]">
              {(summaryData?.totalTicketsSold || paymentTotalItems).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#1b1b28]/60 border border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Confirmed Orders</span>
            <span className="text-xs font-bold text-emerald-400">
              {(summaryData?.confirmedCount ?? summaryData?.confirmedOrders ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#1b1b28]/60 border border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Average Order Value</span>
            <span className="text-xs font-bold text-cyan-400">
              LKR {(summaryData?.averageOrderValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: LIVE PAYMENTS LEDGER                                */}
      {/* ============================================================== */}
      {activeSubTab === "payments" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#14141e]/60 p-4 rounded-xl border border-white/5">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search payments by Ticket ID, Customer Name, Email, or Drama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchPayments();
                }}
                className="w-full bg-[#1b1b28] border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="Confirmed">Confirmed / Paid</option>
                <option value="Pending">Pending / Processing</option>
                <option value="Admitted">Admitted (Checked In)</option>
                <option value="Canceled">Cancelled / Refunded</option>
              </select>

              <button
                onClick={fetchPayments}
                className="p-2 bg-[#1b1b28] hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
                title="Refresh Table"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          {loadingPayments ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading payments transactions...</p>
            </div>
          ) : (
            <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-3 font-semibold">Ticket ID</th>
                      <th className="py-3.5 px-3 font-semibold">Customer</th>
                      <th className="py-3.5 px-3 font-semibold">Drama & Venue</th>
                      <th className="py-3.5 px-3 font-semibold text-right">Ticket Subtotal</th>
                      <th className="py-3.5 px-3 font-semibold text-right">Platform Fee</th>
                      <th className="py-3.5 px-3 font-semibold text-right">Buyer Grand Total</th>
                      <th className="py-3.5 px-3 font-semibold text-right">Partner Net Share</th>
                      <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                      <th className="py-3.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.length > 0 ? (
                      payments.map((p) => {
                        const subtotal = p.ticketSubtotal != null ? p.ticketSubtotal : p.totalAmount;
                        const fee = p.platformConvenienceFee != null ? p.platformConvenienceFee : 0;
                        const buyerTotal = p.buyerGrandTotal != null ? p.buyerGrandTotal : p.totalAmount;
                        const partnerShare = p.organizerNetShare != null ? p.organizerNetShare : subtotal;

                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-white text-xs">
                                <span>{p.ticketId}</span>
                                <button
                                  onClick={() => handleCopyTicket(p.ticketId)}
                                  className="text-slate-500 hover:text-[#FED800] transition-colors"
                                  title="Copy ticket ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {p.bookingDate ? new Date(p.bookingDate).toLocaleDateString() : "Recent"}
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="font-semibold text-white truncate max-w-[120px]">{p.customerName || "Customer"}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{p.customerEmail}</div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="font-semibold text-white truncate max-w-[140px]">
                                {p.showTitle || "Show"}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {p.theatreName || p.location} • {p.seatCount} Seat(s)
                              </div>
                            </td>

                            {/* Ticket Subtotal (Gross Face Value) */}
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="font-bold text-slate-200 text-xs">
                                LKR {Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[9px] text-slate-500">Gross Face Value</div>
                            </td>

                            {/* Platform Convenience Fee */}
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="font-bold text-[#FED800] text-xs">
                                +LKR {Number(fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                {p.feeMode === "ORGANIZER_ABSORBS" ? "Absorbed 5.5%" : "Buyer 6.5%"}
                              </div>
                            </td>

                            {/* Buyer Grand Total (Collected via PayHere) */}
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="font-extrabold text-white text-xs">
                                LKR {Number(buyerTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[9px] text-emerald-400 font-semibold uppercase">PayHere Gross</div>
                            </td>

                            {/* Partner Net Share */}
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="font-black text-emerald-400 text-sm">
                                LKR {Number(partnerShare).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[9px] text-slate-400">Due to Partner</div>
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                  p.status === "Confirmed" || p.status === "Admitted"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : p.status === "Canceled" || p.status === "Cancelled"
                                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {p.paymentStatus || p.status || "Pending"}
                              </span>
                            </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedReceipt(p)}
                                className="px-2.5 py-1 bg-[#FED800]/10 hover:bg-[#FED800]/20 text-[#FED800] rounded-lg border border-[#FED800]/20 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                              {["Confirmed", "Admitted"].includes(p.status) && (
                                <button
                                  onClick={() => {
                                    setManualRefundBooking(p);
                                    setManualRefundForm({
                                      reason: "Admin manual override refund",
                                      refundMethod: "PAYHERE_REVERSAL",
                                      refundReferenceNo: `PAYHERE-REV-${Date.now().toString().slice(-6)}`,
                                      releaseSeats: true,
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                                  title="Issue Manual Override Refund"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Refund</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-slate-500">
                          No payment transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paymentTotalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/5 bg-[#171722] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    Showing page <span className="text-white font-semibold">{paymentPage + 1}</span> of{" "}
                    <span className="text-white font-semibold">{paymentTotalPages}</span> •{" "}
                    <span>{paymentTotalItems} Total Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPaymentPage((p) => Math.max(p - 1, 0))}
                      disabled={paymentPage === 0}
                      className={`p-2 rounded-xl text-xs flex items-center gap-1 border border-white/10 ${
                        paymentPage === 0
                          ? "bg-white/5 text-slate-600 cursor-not-allowed"
                          : "bg-[#1b1b28] text-slate-300 hover:text-white hover:border-[#FED800]/40"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>
                    <button
                      onClick={() => setPaymentPage((p) => Math.min(p + 1, paymentTotalPages - 1))}
                      disabled={paymentPage >= paymentTotalPages - 1}
                      className={`p-2 rounded-xl text-xs flex items-center gap-1 border border-white/10 ${
                        paymentPage >= paymentTotalPages - 1
                          ? "bg-white/5 text-slate-600 cursor-not-allowed"
                          : "bg-[#1b1b28] text-slate-300 hover:text-white hover:border-[#FED800]/40"
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: REFUNDS MANAGEMENT (Cancelled/Postponed Shows & Overrides) */}
      {/* ============================================================== */}
      {activeSubTab === "refunds" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span>Refund Requests & Settlement Audits</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  100% Face Value refunds for cancelled/postponed productions • LankaPay CEFT/SLIPS & PayHere Reversals
                </p>
              </div>

              <button
                onClick={fetchRefunds}
                disabled={loadingRefunds}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRefunds ? "animate-spin" : ""}`} />
                <span>Refresh Requests</span>
              </button>
            </div>

            {loadingRefunds ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading refund requests...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#171722] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-3.5 px-4">Ticket & Submitted</th>
                      <th className="py-3.5 px-4">Show & Production</th>
                      <th className="py-3.5 px-4">Patron Details</th>
                      <th className="py-3.5 px-4">Bank Settlement Details</th>
                      <th className="py-3.5 px-4">Refund Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {refundRequests.length > 0 ? (
                      refundRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-white text-xs block">
                              #{r.ticketId}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">
                              {r.createdAt ? new Date(r.createdAt).toLocaleString() : "Recent"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-200 block truncate max-w-[180px]">
                              {r.showTitle || "Stage Drama Show"}
                            </span>
                            <span className="text-[10px] text-amber-400/90 block mt-0.5 truncate max-w-[180px]" title={r.reason}>
                              Reason: {r.reason || "Show Cancelled/Postponed"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-white block">{r.buyerName || "Patron"}</span>
                            <span className="text-[10px] text-slate-400 block">{r.buyerEmail || r.buyerPhone || "N/A"}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            {r.bankName ? (
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-300 block">
                                  {r.bankName} • {r.bankBranch}
                                </span>
                                <span className="font-mono text-[11px] text-[#FED800] block">
                                  Acc: {r.accountNumber}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                                  {r.accountName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">PayHere Card Reversal</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-emerald-400 text-sm block">
                              LKR {(r.refundAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase">100% Face Value</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                r.status === "PROCESSED"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : r.status === "REJECTED"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                              }`}
                            >
                              {r.status}
                            </span>
                            {r.status === "PROCESSED" && r.refundReferenceNo && (
                              <span className="block text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[130px]" title={r.refundReferenceNo}>
                                Ref: {r.refundReferenceNo}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {r.status === "PENDING" ? (
                              <button
                                onClick={() => {
                                  setProcessModalRefund(r);
                                  setProcessForm({
                                    refundMethod: r.bankName ? "BANK_TRANSFER" : "PAYHERE_REVERSAL",
                                    refundReferenceNo: r.bankName ? `CEFT-${Date.now().toString().slice(-8)}` : `PAYHERE-REV-${Date.now().toString().slice(-6)}`,
                                  });
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Process</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-semibold">
                                Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-slate-500">
                          No pending refund requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: FINANCIAL REPORT GENERATOR                          */}
      {/* ============================================================== */}
      {activeSubTab === "reports" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filter and Date Range Card */}
          <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FED800]" />
                <span>Reporting Window:</span>
              </span>

              <div className="flex items-center bg-[#1b1b28] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setDateRangeOption("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    dateRangeOption === "all" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setDateRangeOption("7d")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    dateRangeOption === "7d" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Past 7 Days
                </button>
                <button
                  onClick={() => setDateRangeOption("30d")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    dateRangeOption === "30d" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Past 30 Days
                </button>
                <button
                  onClick={() => setDateRangeOption("this_month")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    dateRangeOption === "this_month"
                      ? "bg-[#661F19] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setDateRangeOption("custom")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    dateRangeOption === "custom" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Custom
                </button>
              </div>

              {dateRangeOption === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-[#1b1b28] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <span className="text-slate-500 text-xs">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-[#1b1b28] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    onClick={fetchSummary}
                    className="px-3 py-1.5 bg-[#FED800] text-black font-bold text-xs rounded-xl hover:bg-[#ffe234]"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-red-700 to-[#661F19] hover:from-red-600 hover:to-[#7a251e] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/10 shadow-lg shadow-[#661F19]/30 transition-all hover:scale-[1.02]"
              >
                <Printer className="w-3.5 h-3.5 text-[#FED800]" />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-[#1b1b28] hover:bg-[#252538] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Report Summary Cards */}
          {loadingSummary ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FED800] mx-auto mb-3" />
              <p className="text-slate-400 text-xs">Compiling financial metrics and revenue shares...</p>
            </div>
          ) : summaryData ? (
            <>
              {/* Financial Breakdown Table: Revenue by Drama */}
              <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FED800]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Box Office Revenue by Drama Production
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Period Gross: LKR {(summaryData.totalGrossRevenue || 0).toLocaleString()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Production Title</th>
                        <th className="py-3 px-4 font-semibold">Tickets Sold</th>
                        <th className="py-3 px-4 font-semibold">Gross Revenue</th>
                        <th className="py-3 px-4 font-semibold">Revenue Share</th>
                        <th className="py-3 px-4 font-semibold text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {summaryData.dramaBreakdown && summaryData.dramaBreakdown.length > 0 ? (
                        summaryData.dramaBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-semibold text-white">
                              {item.dramaTitle}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-slate-200">
                                {item.ticketsSold}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-400">
                              LKR {(item.revenue || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#FED800] h-full rounded-full"
                                    style={{ width: `${Math.min(item.sharePercentage || 0, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-300">
                                  {item.sharePercentage}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <span>Active</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-500">
                            No drama ticket sales recorded for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Theatre Venues Contribution Breakdown */}
              <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Revenue Contribution by Theatre Venue
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {summaryData.theatreBreakdown?.length || 0} Venues Recorded
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {summaryData.theatreBreakdown && summaryData.theatreBreakdown.length > 0 ? (
                    summaryData.theatreBreakdown.map((t, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1b1b28] border border-white/5 p-4 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white text-xs truncate max-w-[160px]">
                            {t.theatreName}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Venue settlement</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 text-xs">
                            LKR {(t.revenue || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-slate-500 py-4 text-xs">
                      No theatre breakdown available.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Payment Receipt / Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181826] to-[#14141e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#661F19] text-[#FED800] flex items-center justify-center border border-[#FED800]/40">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Receipt</h3>
                  <p className="text-xs font-mono text-[#FED800]">{selectedReceipt.ticketId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-[#1b1b28] p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Drama / Production:</span>
                  <span className="font-bold text-white">{selectedReceipt.showTitle || "General Show"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Venue:</span>
                  <span className="text-white">{selectedReceipt.theatreName || selectedReceipt.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Show Date & Time:</span>
                  <span className="text-white">{selectedReceipt.showDate} • {selectedReceipt.showTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seats Reserved:</span>
                  <span className="text-white font-mono">{selectedReceipt.seatsSummary || selectedReceipt.seatCount}</span>
                </div>
              </div>

              <div className="bg-[#1b1b28] p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-semibold text-white">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Email:</span>
                  <span className="text-white">{selectedReceipt.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-white">{selectedReceipt.customerPhone}</span>
                </div>
              </div>

              {/* Strict Financial Separation Audit Box (Admin Exclusive) */}
              <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Treasury Revenue Breakdown
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {selectedReceipt.feeMode === "ORGANIZER_ABSORBS" ? "Organizer Absorbs (5.5%)" : "Buyer Pays (6.5%)"}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Gross Ticket Face Value:</span>
                  <span className="font-bold text-white">
                    LKR {Number(selectedReceipt.ticketSubtotal != null ? selectedReceipt.ticketSubtotal : selectedReceipt.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>eNataka Platform Convenience Fee:</span>
                  <span className="font-bold text-[#FED800]">
                    +LKR {Number(selectedReceipt.platformConvenienceFee != null ? selectedReceipt.platformConvenienceFee : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300 border-t border-white/5 pt-1.5">
                  <span className="font-semibold text-white">Buyer Grand Total (PayHere):</span>
                  <span className="font-extrabold text-white">
                    LKR {Number(selectedReceipt.buyerGrandTotal != null ? selectedReceipt.buyerGrandTotal : selectedReceipt.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>PayHere Gateway Fee (3.3%):</span>
                  <span className="font-mono text-rose-300">
                    -LKR {Number(selectedReceipt.payhereGatewayFee != null ? selectedReceipt.payhereGatewayFee : ((selectedReceipt.buyerGrandTotal || selectedReceipt.totalAmount) * 0.033)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>eNataka Net Margin:</span>
                  <span className="font-mono font-bold text-amber-300">
                    LKR {Number(selectedReceipt.netPlatformProfit != null ? selectedReceipt.netPlatformProfit : ((selectedReceipt.platformConvenienceFee || 0) - ((selectedReceipt.buyerGrandTotal || selectedReceipt.totalAmount) * 0.033))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-emerald-500/20 pt-2 flex justify-between items-center bg-emerald-500/5 -mx-4 -mb-4 p-3 rounded-b-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Organizer Net Ticket Share</span>
                    <span className="text-[9px] text-slate-400">Strict ticket face value payable</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">
                    LKR {Number(selectedReceipt.organizerNetShare != null ? selectedReceipt.organizerNetShare : (selectedReceipt.ticketSubtotal || selectedReceipt.totalAmount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Payment Status</div>
                  <div className="text-xs font-semibold text-white">
                    {selectedReceipt.paymentStatus || "PAID"}
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 uppercase">
                  {selectedReceipt.status || "Confirmed"}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#161622] flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {processModalRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white space-y-4 p-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Process Refund & Disburse Funds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reconcile LankaPay CEFT/SLIPS transfer or PayHere reversal
                </p>
              </div>
              <button
                onClick={() => setProcessModalRefund(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Refund Overview */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket Reference:</span>
                <span className="font-mono font-bold text-[#FED800]">#{processModalRefund.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patron Name:</span>
                <span className="font-semibold text-white">{processModalRefund.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Production:</span>
                <span className="text-slate-300">{processModalRefund.showTitle}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="font-bold text-white">100% Face Value Refund:</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  LKR {(processModalRefund.refundAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Patron Bank Details Box */}
            {processModalRefund.bankName && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Beneficiary Bank Account
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Bank</span>
                    <span className="font-bold text-white">{processModalRefund.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Branch</span>
                    <span className="font-semibold">{processModalRefund.bankBranch}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Account Name</span>
                    <span className="font-semibold">{processModalRefund.accountName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Account Number</span>
                    <span className="font-mono font-bold text-[#FED800]">{processModalRefund.accountNumber}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleProcessRefund} className="space-y-3.5 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Refund Method *
                  </label>
                  <select
                    value={processForm.refundMethod}
                    onChange={(e) => setProcessForm({ ...processForm, refundMethod: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">LankaPay CEFT / SLIPS</option>
                    <option value="PAYHERE_REVERSAL">PayHere Portal Reversal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Bank / Gateway Ref No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CEFT-12345678"
                    value={processForm.refundReferenceNo}
                    onChange={(e) => setProcessForm({ ...processForm, refundReferenceNo: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProcessModalRefund(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProcess}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submittingProcess ? "Processing..." : "Confirm & Mark Processed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Override Refund Modal */}
      {manualRefundBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white space-y-4 p-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rose-400" />
                  <span>Manual Override Refund</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Issue refund for duplicate charges or administrative exceptions
                </p>
              </div>
              <button
                onClick={() => setManualRefundBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket ID:</span>
                <span className="font-mono font-bold text-[#FED800]">#{manualRefundBooking.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patron:</span>
                <span className="font-semibold text-white">{manualRefundBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Show / Drama:</span>
                <span className="text-slate-300">{manualRefundBooking.showTitle}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="font-bold text-white">Refund Amount:</span>
                <span className="text-lg font-extrabold text-rose-400">
                  LKR {(manualRefundBooking.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleManualRefund} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Reason for Override *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duplicate charge on credit card"
                  value={manualRefundForm.reason}
                  onChange={(e) => setManualRefundForm({ ...manualRefundForm, reason: e.target.value })}
                  className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Refund Method *
                  </label>
                  <select
                    value={manualRefundForm.refundMethod}
                    onChange={(e) => setManualRefundForm({ ...manualRefundForm, refundMethod: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PAYHERE_REVERSAL">PayHere Portal Reversal</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PAYHERE-REV-12345"
                    value={manualRefundForm.refundReferenceNo}
                    onChange={(e) => setManualRefundForm({ ...manualRefundForm, refundReferenceNo: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualRefundForm.releaseSeats}
                  onChange={(e) => setManualRefundForm({ ...manualRefundForm, releaseSeats: e.target.checked })}
                  className="rounded border-slate-600 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>Release booked seats back to AVAILABLE for active shows</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualRefundBooking(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {submittingManual ? "Processing..." : "Confirm Manual Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsFinanceContent;
