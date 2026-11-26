"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Building2,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Download,
  Loader2,
  Sparkles,
  ArrowRight,
  Lock,
  ChevronDown,
  Info,
  Calendar,
  MapPin,
  FileCheck,
  Check,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getShowsByUser } from "../../services/ShowService";
import {
  getShowTrancheEligibility,
  requestPayoutTranche,
  uploadShowVerificationDoc,
  downloadTrancheReceiptPdf,
} from "../../services/PayoutService";
import { toast } from "react-toastify";

const SRI_LANKAN_BANKS = [
  "Commercial Bank of Ceylon",
  "Bank of Ceylon (BOC)",
  "People's Bank",
  "Hatton National Bank (HNB)",
  "Sampath Bank",
  "Seylan Bank",
  "National Development Bank (NDB)",
  "Nations Trust Bank (NTB)",
  "DFCC Bank",
  "Pan Asia Banking Corporation",
  "Union Bank of Colombo",
  "Amana Bank",
  "Cargills Bank",
  "Sanasa Development Bank (SDB)",
];

export default function TwoStageMilestoneProgressCard({ userId: propUserId, onNavigateToKyc }) {
  const { user: authUser } = useAuth();
  const effectiveUserId = propUserId || authUser?.id;

  const [shows, setShows] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loadingShows, setLoadingShows] = useState(true);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [submittingTranche1, setSubmittingTranche1] = useState(false);
  const [submittingTranche2, setSubmittingTranche2] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null);

  // Direct Drama Director Payout Toggle on Stage 1 Card
  const [directToDirector, setDirectToDirector] = useState(false);
  const [customPayee, setCustomPayee] = useState({
    payeeName: "",
    payeeBankName: "Commercial Bank of Ceylon",
    payeeBranch: "",
    payeeAccountNumber: "",
  });

  useEffect(() => {
    if (effectiveUserId) {
      loadShows();
    }
  }, [effectiveUserId]);

  const loadShows = async () => {
    if (!effectiveUserId) return;
    try {
      setLoadingShows(true);
      const res = await getShowsByUser({ page: 0, size: 50, userId: effectiveUserId });
      const showList = res?.data?.content || res?.data || [];
      setShows(showList);
      if (showList.length > 0) {
        setSelectedShowId((prev) => {
          const exists = showList.some((s) => (s.showId || s.id) === prev);
          return exists ? prev : (showList[0].showId || showList[0].id);
        });
      }
    } catch (err) {
      console.error("Error loading shows:", err);
      toast.error("Could not load shows for milestone tracker.");
    } finally {
      setLoadingShows(false);
    }
  };

  useEffect(() => {
    if (selectedShowId) {
      loadEligibility(selectedShowId);
    } else {
      setEligibility(null);
    }
  }, [selectedShowId]);

  const loadEligibility = async (showId) => {
    try {
      setLoadingEligibility(true);
      const res = await getShowTrancheEligibility(showId);
      if (res?.data) {
        setEligibility(res.data);
      }
    } catch (err) {
      console.error("Error loading eligibility:", err);
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file || !selectedShowId || !effectiveUserId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must not exceed 10MB");
      return;
    }

    try {
      setUploadingDocType(docType);
      await uploadShowVerificationDoc(selectedShowId, effectiveUserId, docType, file);
      toast.success(
        docType === "HALL_BOOKING_RECEIPT"
          ? "Hall Booking Receipt uploaded! Platform Admin notified in Show Proofs & Plans to verify and activate 50/50 advance."
          : "Director Agreement uploaded successfully! Admin will verify."
      );
      await loadEligibility(selectedShowId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload document");
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleRequestStage1 = async () => {
    if (!selectedShowId || !effectiveUserId) return;

    if (directToDirector) {
      if (!customPayee.payeeName.trim()) {
        toast.error("Please enter the Drama Director's full name.");
        return;
      }
      if (!customPayee.payeeAccountNumber.trim()) {
        toast.error("Please enter the Drama Director's bank account number.");
        return;
      }
      const dirDoc = eligibility?.verificationDocs?.find((d) => d.docType === "DIRECTOR_AGREEMENT");
      if (!dirDoc || dirDoc.verificationStatus !== "VERIFIED") {
        toast.error("A verified Director Agreement document is required for direct director payouts.");
        return;
      }
    }

    setSubmittingTranche1(true);
    try {
      const payload = {
        showId: selectedShowId,
        trancheType: "TRANCHE_1_ADVANCE",
        payeeType: directToDirector ? "DIRECTOR_DIRECT" : "ORGANIZER",
        payeeName: directToDirector
          ? customPayee.payeeName.trim()
          : (eligibility?.organizerAccountName || eligibility?.organizerName || undefined),
        payeeBankName: directToDirector
          ? customPayee.payeeBankName
          : (eligibility?.organizerBankName || undefined),
        payeeBranch: directToDirector
          ? customPayee.payeeBranch.trim()
          : (eligibility?.organizerBankBranch || undefined),
        payeeAccountNumber: directToDirector
          ? customPayee.payeeAccountNumber.trim()
          : (eligibility?.organizerAccountNumber || undefined),
      };

      await requestPayoutTranche(effectiveUserId, payload);
      toast.success(
        "Stage 1 (Pre-Show Advance) requested successfully! Submitted to Admin Milestone Tranches ledger."
      );
      await loadEligibility(selectedShowId);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to request advance");
    } finally {
      setSubmittingTranche1(false);
    }
  };

  const handleRequestStage2 = async () => {
    if (!selectedShowId || !effectiveUserId) return;

    setSubmittingTranche2(true);
    try {
      const payload = {
        showId: selectedShowId,
        trancheType: "TRANCHE_2_FINAL",
        payeeType: "ORGANIZER",
        payeeName: eligibility?.organizerAccountName || eligibility?.organizerName || undefined,
        payeeBankName: eligibility?.organizerBankName || undefined,
        payeeBranch: eligibility?.organizerBankBranch || undefined,
        payeeAccountNumber: eligibility?.organizerAccountNumber || undefined,
      };

      await requestPayoutTranche(effectiveUserId, payload);
      toast.success(
        "Stage 2 (Final Settlement) requested successfully! Submitted to Admin Milestone Tranches ledger."
      );
      await loadEligibility(selectedShowId);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to request final settlement");
    } finally {
      setSubmittingTranche2(false);
    }
  };

  const handleDownloadReceipt = async (trancheId) => {
    try {
      toast.info("Generating and downloading official ZEY-STL receipt PDF...");
      const res = await downloadTrancheReceiptPdf(trancheId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ZEY-STL-TRANCHE-${trancheId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("ZEY-STL Receipt PDF downloaded successfully!");
    } catch (err) {
      toast.error("Could not download receipt PDF");
    }
  };

  const renderTrancheBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>DISBURSED (PAID)</span>
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>APPROVED FOR RELEASE</span>
          </span>
        );
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>UNDER AUDIT / CLEARANCE</span>
          </span>
        );
      case "ELIGIBLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ELIGIBLE TO REQUEST</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[11px] font-bold">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>LOCKED</span>
          </span>
        );
    }
  };

  if (loadingShows) {
    return (
      <div id="milestone-settlement-section" className="bg-[#14141e] border border-white/10 rounded-2xl p-8 text-center text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading registered productions & milestone ledger...</p>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div id="milestone-settlement-section" className="bg-[#14141e] border border-white/10 rounded-2xl p-8 text-center text-slate-400">
        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white">No Scheduled Productions Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Once your stage dramas and show dates are registered, our automated Two-Tranche milestone payout ledger will activate here.
        </p>
      </div>
    );
  }

  const hallDoc = eligibility?.verificationDocs?.find((d) => d.docType === "HALL_BOOKING_RECEIPT");
  const directorDoc = eligibility?.verificationDocs?.find((d) => d.docType === "DIRECTOR_AGREEMENT");
  const stage1Paid = eligibility?.existingTranche1?.status === "PAID"
    ? Number(eligibility.existingTranche1.netPayableAmount || 0)
    : 0;

  return (
    <div id="milestone-settlement-section" className="space-y-6 scroll-mt-20">
      {/* SECTION HEADER & SHOW SELECTOR */}
      <div className="bg-[#14141e] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FED800] bg-[#FED800]/10 px-2.5 py-0.5 rounded-full border border-[#FED800]/20">
                Automated Milestone Engine
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Two-Tranche Show Settlements</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Two-Tranche Show Settlement &amp; Advances
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strictly calculates and disburses partner ticket face value earnings. Tranche 1 provides up to 50% pre-show advance liquidity, and Tranche 2 settles the exact remaining ticket balance 48 hours after final curtain-up.
            </p>
          </div>

          {/* Show Selector Dropdown */}
          <div className="min-w-[280px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              SELECT PRODUCTION / SHOW:
            </label>
            <div className="relative">
              <select
                value={selectedShowId || ""}
                onChange={(e) => setSelectedShowId(Number(e.target.value))}
                className="w-full bg-[#1b1b28] border border-white/15 text-xs font-semibold text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FED800] appearance-none cursor-pointer pr-10"
              >
                {shows.map((s) => {
                  const sId = s.showId || s.id;
                  return (
                    <option key={sId} value={sId}>
                      {s.title} ({s.showDate ? String(s.showDate).substring(0, 10) : "TBA"})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {loadingEligibility ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-xs">Evaluating live milestone eligibility for selected show...</p>
          </div>
        ) : eligibility ? (
          <>
            {/* POLICY & REVENUE SNAPSHOT BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Agreed Fee Policy</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-extrabold text-white">
                    {eligibility.feeMode === "ORGANIZER_ABSORBS"
                      ? "Organizer Absorbs (0% Buyer Fee)"
                      : "Buyer Pays Convenience Fee"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    {eligibility.feePercentage || "6.50"}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {eligibility.feeMode === "ORGANIZER_ABSORBS"
                    ? "5.5% platform commission deducted from gross share"
                    : "Partner earns 100% of ticket face value"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Payout Plan Structure</span>
                <span className="font-extrabold text-white mt-0.5 block">
                  {eligibility.payoutPlan === "MILESTONE_50_50"
                    ? "Milestone 50/50 (Advance + Final)"
                    : "Standard Post-Show (100% Final)"}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pre-show advance cap: {eligibility.advanceCapPercentage || "50.00"}%
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Confirmed Paid Ticket Revenue</span>
                <span className="font-black text-[#FED800] text-base mt-0.5 block">
                  LKR {Number(eligibility.totalConfirmedTicketRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Excludes pending or cancelled bookings</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Available Net Settlement Balance</span>
                <span className="font-black text-emerald-400 text-base mt-0.5 block">
                  LKR {Number(eligibility.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Already Disbursed: LKR {Number(eligibility.alreadyDisbursed || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* TWO-TRANCHE SIDE-BY-SIDE CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* ========================================================= */}
              {/* CARD 1 — STAGE 1: PRE-SHOW ADVANCE (UP TO 50%)            */}
              {/* ========================================================= */}
              <div className="bg-[#181824] rounded-2xl border border-white/10 p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/20 transition-all">
                <div className="space-y-4">
                  {/* Card 1 Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                        Milestone Stage 1
                      </span>
                      <h3 className="text-base font-black text-white mt-0.5">
                        Pre-Show Advance (Up to 50%)
                      </h3>
                    </div>
                    {renderTrancheBadge(eligibility.tranche1Status)}
                  </div>

                  {/* Prominent Revenue & Advance Metrics */}
                  <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Confirmed Ticket Sales
                      </span>
                      <span className="text-base font-black text-[#FED800] mt-0.5 block">
                        LKR {Number(eligibility.totalConfirmedTicketRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400">Face value share</span>
                    </div>

                    <div className="border-l border-white/10 pl-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Max 50% Advance Eligible
                      </span>
                      <span className="text-base font-black text-amber-300 mt-0.5 block">
                        LKR {Number(eligibility.tranche1MaxAdvance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400">Pre-show liquidity cap</span>
                    </div>
                  </div>

                  {/* 4-Point Release Criteria Checklist */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Milestone Release Criteria (4 Checks):
                    </span>

                    {/* Check 1: Organizer KYC */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {eligibility.checkKycVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className={eligibility.checkKycVerified ? "text-slate-200" : "text-amber-300"}>
                          1. Organizer KYC Verified (NIC &amp; Bank Proof)
                        </span>
                      </div>
                      {!eligibility.checkKycVerified && onNavigateToKyc && (
                        <button
                          onClick={onNavigateToKyc}
                          className="text-[10px] text-[#FED800] hover:underline font-bold"
                        >
                          Verify KYC
                        </button>
                      )}
                    </div>

                    {/* Check 2: Hall Booking Receipt */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {eligibility.checkHallReceiptVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className={eligibility.checkHallReceiptVerified ? "text-slate-200" : "text-amber-300"}>
                          2. Auditorium / Hall Booking Receipt
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        hallDoc?.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : hallDoc?.verificationStatus === "REJECTED"
                          ? "bg-rose-500/20 text-rose-300"
                          : hallDoc?.verificationStatus === "PENDING"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {hallDoc?.verificationStatus || "NOT UPLOADED"}
                      </span>
                    </div>

                    {/* Check 3: 5-Day Time Window */}
                    <div className="flex items-center gap-2">
                      {eligibility.checkTimeWindowOpen ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={eligibility.checkTimeWindowOpen ? "text-slate-200" : "text-slate-400"}>
                        3. Within 5 days before show &amp; ≥12h before curtain
                      </span>
                    </div>

                    {/* Check 4: Ticket Sales */}
                    <div className="flex items-center gap-2">
                      {eligibility.checkHasSales ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={eligibility.checkHasSales ? "text-slate-200" : "text-slate-400"}>
                        4. Confirmed paid ticket revenue &gt; LKR 0.00
                      </span>
                    </div>
                  </div>

                  {/* Pre-Show Proof Upload Buttons */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pre-Show Verification Documents:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Hall Receipt Upload */}
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Hall Booking Receipt</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              hallDoc?.verificationStatus === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : hallDoc?.verificationStatus === "PENDING"
                                ? "bg-amber-500/20 text-amber-300"
                                : hallDoc?.verificationStatus === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-white/10 text-slate-400"
                            }`}>
                              {hallDoc?.verificationStatus || "NOT UPLOADED"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Auditorium booking invoice / proof</p>
                        </div>

                        <label className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FED800] border border-white/15 flex items-center justify-center gap-1.5 transition-all">
                          {uploadingDocType === "HALL_BOOKING_RECEIPT" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{hallDoc ? "Re-upload Receipt" : "Upload Receipt"}</span>
                          <input
                            id="organizer-hall-receipt-upload"
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "HALL_BOOKING_RECEIPT")}
                          />
                        </label>
                      </div>

                      {/* Director Agreement Upload */}
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Director Agreement</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              directorDoc?.verificationStatus === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : directorDoc?.verificationStatus === "PENDING"
                                ? "bg-amber-500/20 text-amber-300"
                                : directorDoc?.verificationStatus === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-white/10 text-slate-400"
                            }`}>
                              {directorDoc?.verificationStatus || "NOT UPLOADED"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Required for direct director transfer</p>
                        </div>

                        <label className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FED800] border border-white/15 flex items-center justify-center gap-1.5 transition-all">
                          {uploadingDocType === "DIRECTOR_AGREEMENT" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{directorDoc ? "Re-upload Agreement" : "Upload Agreement"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "DIRECTOR_AGREEMENT")}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Pay Directly to Drama Director Toggle */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Pay Directly to Drama Director
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Disburse advance straight to director's bank account (requires verified Director Agreement)
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={directToDirector}
                          onChange={(e) => setDirectToDirector(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {directToDirector && (
                      <div className="space-y-2.5 pt-2 border-t border-white/10 animate-in fade-in duration-150">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Director Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Dharmapriya Dias"
                            value={customPayee.payeeName}
                            onChange={(e) => setCustomPayee({ ...customPayee, payeeName: e.target.value })}
                            className="w-full bg-[#14141e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-300 block mb-1">Commercial Bank</label>
                            <select
                              value={customPayee.payeeBankName}
                              onChange={(e) => setCustomPayee({ ...customPayee, payeeBankName: e.target.value })}
                              className="w-full bg-[#14141e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FED800]"
                            >
                              {SRI_LANKAN_BANKS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-300 block mb-1">Branch Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Borella Branch"
                              value={customPayee.payeeBranch}
                              onChange={(e) => setCustomPayee({ ...customPayee, payeeBranch: e.target.value })}
                              className="w-full bg-[#14141e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Account Number</label>
                          <input
                            type="text"
                            placeholder="Director bank account number"
                            value={customPayee.payeeAccountNumber}
                            onChange={(e) => setCustomPayee({ ...customPayee, payeeAccountNumber: e.target.value })}
                            className="w-full bg-[#14141e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
                          />
                        </div>
                      </div>
                    )}

                    {!directToDirector && (
                      <div className="p-2.5 bg-white/[0.04] rounded-xl border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Destination Account (Registered Organizer Bank):</span>
                          </span>
                          <span className="font-semibold text-emerald-400 text-[10px]">VERIFIED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-0.5">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Bank & Branch</span>
                            <span className="font-medium text-white text-[11px]">
                              {eligibility?.organizerBankName || "Commercial Bank of Ceylon"} • {eligibility?.organizerBankBranch || "Colombo Main"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Account Number</span>
                            <span className="font-mono font-bold text-amber-300 text-[11px]">
                              {eligibility?.organizerAccountNumber || "Linked in Profile KYC"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informational Status / Reason Banner */}
                  <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {eligibility.payoutPlan === "STANDARD_POST_SHOW"
                        ? hallDoc?.verificationStatus === "VERIFIED"
                          ? "Hall Booking Receipt verified! Platform Admin has been notified to activate the Milestone 50/50 Advance Plan."
                          : hallDoc?.verificationStatus === "PENDING"
                          ? "Hall Booking Receipt uploaded and pending Admin audit in Show Proofs & Plans. Once approved, 50% advance liquidity will be enabled."
                          : "Show is currently on Standard Post-Show (100% final settlement). Upload your Auditorium / Hall Booking Receipt below to enable the 50% Pre-Show Liquidity Advance."
                        : eligibility.tranche1Reason}
                    </span>
                  </div>
                </div>

                {/* Stage 1 Action Button / Status Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Max Advance Amount</span>
                    <span className="text-base font-extrabold text-[#FED800]">
                      LKR {Number(eligibility.tranche1MaxAdvance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {eligibility.tranche1Status === "PAID" && eligibility.existingTranche1 ? (
                    <button
                      onClick={() => handleDownloadReceipt(eligibility.existingTranche1.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ZEY-STL Receipt</span>
                    </button>
                  ) : eligibility.tranche1Status === "REQUESTED" ? (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Advance Requested — Under Audit</span>
                    </div>
                  ) : eligibility.tranche1Status === "APPROVED" ? (
                    <div className="px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved for CEFT Release</span>
                    </div>
                  ) : eligibility.tranche1Status === "ELIGIBLE" ? (
                    <button
                      onClick={handleRequestStage1}
                      disabled={submittingTranche1}
                      className="btn-theatre-gold px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      {submittingTranche1 ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                      <span>Request Stage 1 Advance</span>
                    </button>
                  ) : eligibility.payoutPlan === "STANDARD_POST_SHOW" ? (
                    hallDoc?.verificationStatus === "VERIFIED" ? (
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hall Receipt Verified — Awaiting Admin Milestone Activation</span>
                      </div>
                    ) : hallDoc?.verificationStatus === "PENDING" ? (
                      <div className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Hall Receipt Uploaded — Under Admin Audit</span>
                      </div>
                    ) : (
                      <label
                        htmlFor="organizer-hall-receipt-upload"
                        className="btn-theatre-gold px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Enable 50/50 Pre-Show Advance (Upload Hall Receipt)</span>
                      </label>
                    )
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-500 font-bold text-xs flex items-center gap-2 cursor-not-allowed border border-white/10"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Advance Not Available</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* CARD 2 — STAGE 2: FINAL POST-SHOW SETTLEMENT              */}
              {/* ========================================================= */}
              <div className="bg-[#181824] rounded-2xl border border-white/10 p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/20 transition-all">
                <div className="space-y-4">
                  {/* Card 2 Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                        Milestone Stage 2
                      </span>
                      <h3 className="text-base font-black text-white mt-0.5">
                        Final Show Settlement (Remaining Balance)
                      </h3>
                    </div>
                    {renderTrancheBadge(eligibility.tranche2Status)}
                  </div>

                  {/* Remaining Balance Breakdown Metrics */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-2.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Final Settlement Balance Breakdown:
                    </span>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Total Confirmed Ticket Sales (Face Value):</span>
                      <span className="font-bold text-white">
                        LKR {Number(eligibility.totalConfirmedTicketRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Less: Stage 1 Advance Paid:</span>
                      <span className="font-semibold text-rose-400">
                        - LKR {Number(stage1Paid).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-white font-bold">
                      <span>Remaining Balance Due:</span>
                      <span className="text-emerald-400 font-black text-base">
                        LKR {Number(eligibility.tranche2PayableAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* 48-Hour Release Timeline & Policy */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Release Policy &amp; Unlock Timeline:
                    </span>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">
                        Unlocks automatically <strong>48 hours after show conclusion</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">
                        100% of remaining ticket balance disbursed to Organizer verified bank account
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200">
                        Official multi-tranche <strong>ZEY-STL</strong> reconciliation receipt generated
                      </span>
                    </div>
                  </div>

                  {/* Informational Status / Reason Banner */}
                  <div className="text-[11px] text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{eligibility.tranche2Reason}</span>
                  </div>

                  {/* Destination Bank Account Preview */}
                  <div className="p-2.5 bg-white/[0.04] rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Disbursement Destination (Organizer Bank):</span>
                      </span>
                      <span className="font-semibold text-emerald-400 text-[10px]">VERIFIED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-0.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bank & Branch</span>
                        <span className="font-medium text-white text-[11px]">
                          {eligibility?.organizerBankName || "Commercial Bank of Ceylon"} • {eligibility?.organizerBankBranch || "Colombo Main"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Account Number</span>
                        <span className="font-mono font-bold text-amber-300 text-[11px]">
                          {eligibility?.organizerAccountNumber || "Linked in Profile KYC"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 2 Action Button / Status Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Remaining Settlement Due</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      LKR {Number(eligibility.tranche2PayableAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {eligibility.tranche2Status === "PAID" && eligibility.existingTranche2 ? (
                    <button
                      onClick={() => handleDownloadReceipt(eligibility.existingTranche2.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ZEY-STL Receipt</span>
                    </button>
                  ) : eligibility.tranche2Status === "REQUESTED" ? (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Settlement Requested — Under Audit</span>
                    </div>
                  ) : eligibility.tranche2Status === "APPROVED" ? (
                    <div className="px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved for CEFT Release</span>
                    </div>
                  ) : eligibility.tranche2Status === "ELIGIBLE" ? (
                    <button
                      onClick={handleRequestStage2}
                      disabled={submittingTranche2}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      {submittingTranche2 ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                      <span>Request Final Settlement</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-500 font-bold text-xs flex items-center gap-2 cursor-not-allowed border border-white/10"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Final Settlement Locked</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
