"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  Loader2,
  FileText,
  Building2,
  User,
  CreditCard,
  AlertTriangle,
  X,
  Send,
  Download,
  Sparkles,
  Layers,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Check,
  Calendar,
  Pencil,
} from "lucide-react";
import {
  getAllPayoutsForAdmin,
  updatePayoutStatus,
  downloadPayoutReceiptPdf,
  getAllTranchesForAdmin,
  releaseTranche,
  updateTrancheStatus,
  updateTrancheBankAccount,
  downloadTrancheReceiptPdf,
  getShowTrancheEligibility,
  verifyShowDoc,
  rejectShowDoc,
  getShowProofsForAdmin,
  updateShowPayoutPlan,
} from "../../services/PayoutService";
import {
  getOrganizerKycDocuments,
  verifyKycDocument,
  rejectKycDocument,
} from "../../services/KycService";
import { getApiBaseUrl } from "../../utils/cdn";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import { toast } from "react-toastify";

export default function PayoutsManagementContent({ setActiveTab }) {
  const [activeView, setActiveView] = useState("TRANCHES"); // "TRANCHES" | "SHOW_PROOFS" | "LEGACY"

  // --- Show Proofs & Plans State ---
  const [showProofs, setShowProofs] = useState([]);
  const [loadingShowProofs, setLoadingShowProofs] = useState(false);
  const [proofSearchQuery, setProofSearchQuery] = useState("");
  const [proofFilterStatus, setProofFilterStatus] = useState("ALL"); // "ALL" | "PENDING" | "MILESTONE" | "STANDARD"
  const [updatingPlanShowId, setUpdatingPlanShowId] = useState(null);

  // --- Two-Tranche Milestone Ledger State ---
  const [tranches, setTranches] = useState([]);
  const [loadingTranches, setLoadingTranches] = useState(true);
  const [trancheFilterStatus, setTrancheFilterStatus] = useState("ALL");
  const [trancheSearchQuery, setTrancheSearchQuery] = useState("");
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [trancheActionType, setTrancheActionType] = useState(null); // "RELEASE" | "REJECT" | "APPROVE"
  const [trancheTransferRef, setTrancheTransferRef] = useState("");
  const [trancheRemarks, setTrancheRemarks] = useState("");
  const [processingTranche, setProcessingTranche] = useState(false);

  // Bank details editing state inside audit modal
  const [isEditingBankDetails, setIsEditingBankDetails] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    payeeName: "",
    payeeBankName: "",
    payeeBranch: "",
    payeeAccountNumber: "",
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  // Show Verification Docs State (Hall receipt, Director agreement, Payee auth)
  const [showEligibilityData, setShowEligibilityData] = useState(null);
  const [loadingShowDocs, setLoadingShowDocs] = useState(false);
  const [rejectingShowDocId, setRejectingShowDocId] = useState(null);
  const [rejectShowDocReason, setRejectShowDocReason] = useState("");
  const [showRejectShowDocModal, setShowRejectShowDocModal] = useState(false);

  // --- Legacy Payouts State ---
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayout, setSelectedPayout] = useState(null);

  // Action modal states
  const [actionType, setActionType] = useState(null); // "RELEASE" | "REJECT" | "APPROVE"
  const [transferRef, setTransferRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);
  const { payhereApprovedLive } = usePlatformConfig();

  // Dedicated KYC Documents State for selected organizer
  const [organizerKycDocs, setOrganizerKycDocs] = useState([]);
  const [loadingKycDocs, setLoadingKycDocs] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchTranches = async () => {
    try {
      setLoadingTranches(true);
      const res = await getAllTranchesForAdmin();
      if (res?.data) {
        setTranches(res.data);
      }
    } catch (err) {
      console.error("Error loading milestone tranches for admin:", err);
      toast.error("Could not load milestone tranche ledger");
    } finally {
      setLoadingTranches(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await getAllPayoutsForAdmin();
      if (res?.data) {
        setPayouts(res.data);
      }
    } catch (err) {
      console.error("Error loading payouts for admin:", err);
      toast.error("Could not load payout requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchShowProofs = async () => {
    try {
      setLoadingShowProofs(true);
      const res = await getShowProofsForAdmin();
      if (res?.data) {
        setShowProofs(res.data);
      }
    } catch (err) {
      console.error("Error loading show verification proofs:", err);
      toast.error("Could not load show verification proofs");
    } finally {
      setLoadingShowProofs(false);
    }
  };

  const handleTogglePayoutPlan = async (showId, currentPlan) => {
    const newPlan = currentPlan === "MILESTONE_50_50" ? "STANDARD_POST_SHOW" : "MILESTONE_50_50";
    setUpdatingPlanShowId(showId);
    try {
      await updateShowPayoutPlan(showId, newPlan, 50.0);
      toast.success(
        newPlan === "MILESTONE_50_50"
          ? "Show payout plan switched to Milestone 50/50! Pre-Show Advance unlocked."
          : "Show payout plan switched to Standard Post-Show (100% Final Settlement)."
      );
      await fetchShowProofs();
      await fetchTranches();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update show payout plan");
    } finally {
      setUpdatingPlanShowId(null);
    }
  };

  const handleVerifyDirectShowProof = async (docId) => {
    try {
      await verifyShowDoc(docId, 1);
      toast.success("Document marked as VERIFIED! Milestone release criteria updated.");
      fetchShowProofs();
      fetchTranches();
      if (selectedTranche?.showId) loadShowDocs(selectedTranche.showId);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to verify show document");
    }
  };

  useEffect(() => {
    fetchTranches();
    fetchPayouts();
    fetchShowProofs();
  }, []);

  const loadShowDocs = async (showId) => {
    if (!showId) return;
    try {
      setLoadingShowDocs(true);
      const res = await getShowTrancheEligibility(showId);
      setShowEligibilityData(res.data);
    } catch (err) {
      console.debug("Could not load show verification docs in admin audit:", err);
    } finally {
      setLoadingShowDocs(false);
    }
  };

  const loadKycDocs = async (userId) => {
    try {
      setLoadingKycDocs(true);
      const docs = await getOrganizerKycDocuments(userId);
      setOrganizerKycDocs(docs || []);
    } catch (e) {
      console.debug("Could not load organizer KYC docs in admin payout:", e);
      if (selectedPayout?.kycDocuments) {
        setOrganizerKycDocs(selectedPayout.kycDocuments);
      }
    } finally {
      setLoadingKycDocs(false);
    }
  };

  useEffect(() => {
    if (selectedTranche?.showId) {
      loadShowDocs(selectedTranche.showId);
    } else {
      setShowEligibilityData(null);
    }
    if (selectedTranche?.organizerId) {
      loadKycDocs(selectedTranche.organizerId);
    }
  }, [selectedTranche]);

  useEffect(() => {
    if (selectedPayout?.userId) {
      loadKycDocs(selectedPayout.userId);
    } else if (!selectedTranche) {
      setOrganizerKycDocs([]);
    }
  }, [selectedPayout]);

  // Document Verification handlers
  const handleVerifyDoc = async (docId) => {
    try {
      await verifyKycDocument(docId);
      toast.success("KYC Document marked as VERIFIED!");
      if (selectedPayout?.userId) loadKycDocs(selectedPayout.userId);
      if (selectedTranche?.organizerId) loadKycDocs(selectedTranche.organizerId);
    } catch (e) {
      toast.error(e?.message || "Failed to verify document");
    }
  };

  const handleConfirmRejectDoc = async () => {
    if (!rejectingDocId) return;
    try {
      await rejectKycDocument(rejectingDocId, rejectReasonInput || "Document is blurry or illegible. Please re-upload.");
      toast.success("Document marked as REJECTED with reason recorded.");
      setShowRejectModal(false);
      setRejectReasonInput("");
      setRejectingDocId(null);
      if (selectedPayout?.userId) loadKycDocs(selectedPayout.userId);
      if (selectedTranche?.organizerId) loadKycDocs(selectedTranche.organizerId);
    } catch (e) {
      toast.error(e?.message || "Failed to reject document");
    }
  };

  const handleVerifyShowDoc = async (docId) => {
    try {
      await verifyShowDoc(docId, 1);
      toast.success("Show verification proof marked as VERIFIED!");
      if (selectedTranche?.showId) loadShowDocs(selectedTranche.showId);
      fetchTranches();
      fetchShowProofs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to verify show document");
    }
  };

  const handleConfirmRejectShowDoc = async () => {
    if (!rejectingShowDocId) return;
    try {
      await rejectShowDoc(rejectingShowDocId, 1, rejectShowDocReason || "Document rejected by administration.");
      toast.success("Show document marked as REJECTED.");
      setShowRejectShowDocModal(false);
      setRejectShowDocReason("");
      setRejectingShowDocId(null);
      if (selectedTranche?.showId) loadShowDocs(selectedTranche.showId);
      fetchTranches();
      fetchShowProofs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to reject show document");
    }
  };

  // Milestone Tranche Actions
  const handleReleaseTranche = async (e) => {
    if (e) e.preventDefault();
    if (!trancheTransferRef.trim()) {
      toast.warn("Please enter the LankaPay / CEFT bank transaction reference number.");
      return;
    }
    setProcessingTranche(true);
    try {
      const res = await releaseTranche(selectedTranche.id, 1, {
        bankTransferRef: trancheTransferRef.trim(),
        adminRemarks: trancheRemarks.trim() || undefined,
      });
      toast.success(`Tranche released successfully! ZEY-STL receipt ${res.data?.receiptNumber || ""} generated & archived.`);
      setSelectedTranche(res.data || null);
      setTrancheActionType(null);
      setTrancheTransferRef("");
      setTrancheRemarks("");
      fetchTranches();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to release milestone tranche.");
    } finally {
      setProcessingTranche(false);
    }
  };

  const handleUpdateTrancheStatus = async (status) => {
    if (!selectedTranche) return;
    setProcessingTranche(true);
    try {
      const res = await updateTrancheStatus(selectedTranche.id, 1, status, trancheRemarks.trim() || undefined);
      toast.success(`Tranche status updated to ${status}!`);
      setSelectedTranche(res.data || null);
      setTrancheActionType(null);
      setTrancheRemarks("");
      fetchTranches();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update tranche status.");
    } finally {
      setProcessingTranche(false);
    }
  };

  const startEditingBank = () => {
    setBankFormData({
      payeeName: selectedTranche?.payeeName || showEligibilityData?.organizerAccountName || "",
      payeeBankName: selectedTranche?.payeeBankName || showEligibilityData?.organizerBankName || "Commercial Bank of Ceylon",
      payeeBranch: selectedTranche?.payeeBranch || showEligibilityData?.organizerBankBranch || "Colombo Main",
      payeeAccountNumber: selectedTranche?.payeeAccountNumber || showEligibilityData?.organizerAccountNumber || "",
    });
    setIsEditingBankDetails(true);
  };

  const handleSaveBankDetails = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTranche) return;
    if (!bankFormData.payeeAccountNumber || !bankFormData.payeeAccountNumber.trim()) {
      toast.error("Please enter a valid Account Number.");
      return;
    }
    try {
      setIsSavingBank(true);
      const res = await updateTrancheBankAccount(selectedTranche.id, bankFormData, 1);
      toast.success("Beneficiary bank account updated successfully!");
      if (res?.data) {
        setSelectedTranche(res.data);
        setTranches((prev) =>
          prev.map((t) => (t.id === res.data.id ? res.data : t))
        );
      }
      setIsEditingBankDetails(false);
      fetchTranches();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleDownloadTrancheReceipt = async (tranche) => {
    if (tranche.receiptPdfPresignedUrl) {
      window.open(tranche.receiptPdfPresignedUrl, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const res = await downloadTrancheReceiptPdf(tranche.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tranche.receiptNumber || `ZEY-STL-TRANCHE-${tranche.id}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download failed", err);
      toast.error("Could not download tranche settlement receipt.");
    }
  };

  // Legacy Payout actions
  const handleUpdateStatus = async (status) => {
    if (!selectedPayout) return;

    if (status === "RELEASED" && !transferRef.trim()) {
      toast.warn("Please enter the LankaPay / CEFT bank transaction reference number");
      return;
    }

    if (status === "REJECTED" && !remarks.trim()) {
      toast.warn("Please enter the reason for rejection");
      return;
    }

    setProcessing(true);
    try {
      await updatePayoutStatus(selectedPayout.id, {
        status: status,
        releaseTransactionRef: transferRef.trim() || undefined,
        adminRemarks: remarks.trim() || undefined,
      });

      toast.success(
        status === "RELEASED"
          ? "Payment released and marked as transferred!"
          : status === "VERIFIED_APPROVED"
          ? "Payout documents verified and approved!"
          : "Payout request rejected."
      );

      setActionType(null);
      setSelectedPayout(null);
      setTransferRef("");
      setRemarks("");
      fetchPayouts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  const generateClientSideReceiptPdf = async (payout) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;

      // Brand Banner (Dark navy #12141D)
      doc.setFillColor(18, 20, 29);
      doc.rect(0, 0, pageWidth, 22, "F");

      // Left: Zeylex Logo
      try {
        const zeylexImg = new Image();
        zeylexImg.src = "/images/zeylex-logo.png";
        doc.addImage(zeylexImg, "PNG", margin, 5.5, 25, 10);
      } catch (e) {
        doc.setTextColor(254, 216, 0);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("ZEYLEX", margin, 10);
        doc.setTextColor(241, 245, 249);
        doc.setFontSize(5.5);
        doc.text("DIGITAL SOLUTIONS", margin, 15);
      }

      // Right: Naataka Logo
      try {
        const natakaImg = new Image();
        natakaImg.src = "/images/nataka-logo.png";
        doc.addImage(natakaImg, "PNG", pageWidth - margin - 25, 5.5, 25, 10);
      } catch (e) {
        doc.setTextColor(254, 216, 0);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Naataka.lk", pageWidth - margin - 20, 10);
        doc.setTextColor(241, 245, 249);
        doc.setFontSize(5.5);
        doc.text("TICKETING", pageWidth - margin - 20, 15);
      }

      doc.setTextColor(254, 216, 0); // Gold
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("FINAL SETTLEMENT STATEMENT & PAYOUT RECEIPT", pageWidth / 2, 9.5, { align: "center" });

      doc.setTextColor(241, 245, 249);
      doc.setFontSize(6.6);
      doc.setFont("helvetica", "normal");
      doc.text("Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform) | BR No: POL/ELH/ESD/02/01/1941/2026", pageWidth / 2, 16, { align: "center" });

      let y = 26.5;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.text("Executed electronically under Sri Lanka Electronic Transactions Act No. 19 of 2006 | LankaPay Direct Bank Settlement", pageWidth / 2, y, { align: "center" });

      // Metadata Box
      y += 3.5;
      const metaBoxY = y;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(215, 220, 228);
      doc.rect(margin, metaBoxY, contentWidth, 20, "FD");

      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      const payRef = `PAY-${String(payout.id).padStart(4, "0")}`;
      const agrRef = payout.contractId || `ZEY-AGR-${new Date(payout.createdAt || Date.now()).toISOString().slice(0, 10).replace(/-/g, "")}-${String(payout.userId || payout.id).padStart(4, "0")}`;
      const ceftRef = payout.releaseTransactionRef || payout.bankCeftRef || "12345896238";
      const procTime = payout.releasedAt ? new Date(payout.releasedAt) : (payout.updatedAt ? new Date(payout.updatedAt) : new Date());
      const procDateStr = procTime.toLocaleString() + " (+05:30 Asia/Colombo)";

      doc.setFont("helvetica", "bold");
      doc.text("Payout Reference:", margin + 3.5, metaBoxY + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text(payRef, margin + 35, metaBoxY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.text("Linked Agreement ID:", margin + 95, metaBoxY + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text(agrRef, margin + 130, metaBoxY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.text("Bank CEFT Ref:", margin + 3.5, metaBoxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(ceftRef, margin + 35, metaBoxY + 11);

      doc.setFont("helvetica", "bold");
      doc.text("Status:", margin + 95, metaBoxY + 11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105); // emerald
      doc.text("RELEASED / PAID", margin + 130, metaBoxY + 11);

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("Processed Date/Time:", margin + 3.5, metaBoxY + 16.5);
      doc.setFont("helvetica", "normal");
      doc.text(procDateStr, margin + 35, metaBoxY + 16.5);

      y = metaBoxY + 24;

      // 1. Destination Bank & Beneficiary Details
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("1. Destination Bank Account & Beneficiary Details", margin, y);

      y += 3.5;
      const bankBoxY = y;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(215, 220, 228);
      doc.rect(margin, bankBoxY, contentWidth, 20, "FD");

      const repName = payout.accountHolderName || payout.userName || "Authorized Signatory";
      const nicNo = payout.nicNumber || "On File";
      const bName = payout.bankName || "Commercial Bank of Ceylon";
      const bBranch = payout.bankBranch || "Main Branch";
      const bAcc = payout.accountNumber || "N/A";
      const venueName = payout.theatreName || "Designated Venue / Show Partner";

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("Account Holder:", margin + 3.5, bankBoxY + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text(repName, margin + 32, bankBoxY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.text("National ID (NIC):", margin + 105, bankBoxY + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text(nicNo, margin + 138, bankBoxY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.text("Beneficiary Bank:", margin + 3.5, bankBoxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(bName, margin + 32, bankBoxY + 11);

      doc.setFont("helvetica", "bold");
      doc.text("Branch:", margin + 105, bankBoxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(bBranch, margin + 138, bankBoxY + 11);

      doc.setFont("helvetica", "bold");
      doc.text("Account Number:", margin + 3.5, bankBoxY + 16.5);
      doc.setFont("helvetica", "normal");
      doc.text(bAcc, margin + 32, bankBoxY + 16.5);

      doc.setFont("helvetica", "bold");
      doc.text("Associated Venue:", margin + 105, bankBoxY + 16.5);
      doc.setFont("helvetica", "normal");
      doc.text(venueName, margin + 138, bankBoxY + 16.5);

      y = bankBoxY + 24;

      // 2. Settlement Breakdown & Financial Reconciliation
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("2. Settlement Breakdown & Financial Reconciliation (100% Reconciled)", margin, y);

      y += 3.5;
      const breakdownBoxY = y;
      doc.setFillColor(248, 252, 250);
      doc.setDrawColor(200, 220, 210);
      doc.rect(margin, breakdownBoxY, contentWidth, 26, "FD");

      const reqAmt = Number(payout.requestedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
      const netAmt = Number(payout.netPayableAmount || payout.requestedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("Requested Payout Amount:", margin + 3.5, breakdownBoxY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`LKR ${reqAmt}`, margin + 65, breakdownBoxY + 6);

      doc.setFont("helvetica", "bold");
      doc.text("Additional Payout Fee:", margin + 3.5, breakdownBoxY + 11.5);
      doc.setFont("helvetica", "normal");
      doc.text("LKR 0.00 (Commission settled per booking under Active Agreement)", margin + 65, breakdownBoxY + 11.5);

      // Line inside box
      doc.setDrawColor(210, 230, 220);
      doc.line(margin + 3.5, breakdownBoxY + 15, margin + contentWidth - 3.5, breakdownBoxY + 15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text("Net Bank Transfer Amount:", margin + 3.5, breakdownBoxY + 20.5);
      doc.setTextColor(5, 150, 105); // emerald
      doc.text(`LKR ${netAmt}  (100% Reconciled - 0% Extra Withdrawal Fee)`, margin + 65, breakdownBoxY + 20.5);

      y = breakdownBoxY + 30;

      // 3. Agency Footnote
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("3. Agency Representation & Revenue Classification", margin, y);

      y += 3.8;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const footnote = `Gross ticket face values remitted hereunder represent pass-through proceeds collected strictly on behalf of the Organizer (Party B) under the linked Ticketing & Settlement Agreement (${agrRef}). Zeylex Digital Solutions (Naataka.lk) acts solely as an authorized digital ticketing facilitator and collection agent. All platform commissions and payment gateway fees have been fully settled per booking under the Agreement. Municipal entertainment taxes and event permits remain the exclusive responsibility of Party B.`;
      const splitFootnote = doc.splitTextToSize(footnote, contentWidth);
      doc.text(splitFootnote, margin, y);
      y += splitFootnote.length * 3.2 + 4;

      // Divider
      doc.setDrawColor(215, 220, 228);
      doc.line(margin, y, margin + contentWidth, y);
      y += 5;

      // 4. Signatures & Seal
      const sigColWidth = contentWidth / 2 - 5;
      const col2Left = margin + sigColWidth + 10;

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Authorized Settlement Desk (Party A):", margin, y);
      doc.text("Electronic Settlement Audit Trail:", col2Left, y);

      y += 4;
      try {
        const sealImg = new Image();
        sealImg.src = "/images/zeylex-proprietor-seal.png";
        doc.addImage(sealImg, "PNG", margin + 2, y, 38, 19);
      } catch (e) {
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("[PROPRIETOR SEAL & SIGNATURE]", margin + 2, y + 10);
      }

      // Right audit box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(215, 220, 228);
      doc.rect(col2Left, y, sigColWidth, 19, "FD");
      doc.setFontSize(6.8);
      doc.setTextColor(5, 150, 105);
      doc.text(`LankaPay Transaction Ref: ${ceftRef}`, col2Left + 3, y + 5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Settlement Ref: ZEY-STL-PAY-${String(payout.id).padStart(4, "0")}`, col2Left + 3, y + 10);
      doc.setFontSize(6);
      doc.text("Governing Law: Electronic Transactions Act No. 19 of 2006", col2Left + 3, y + 15);

      y += 23;
      doc.setDrawColor(180, 190, 205);
      doc.line(margin, y, margin + sigColWidth, y);
      y += 4;

      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      doc.text("Proprietor / Authorized Signatory, Zeylex Digital Solutions", margin, y);
      doc.setFontSize(6);
      doc.text("Official Rubber Seal | LankaPay CEFT Settlement Operations Desk", margin, y + 3.5);

      doc.save(`ZEY-STL-PAY-${String(payout.id).padStart(4, "0")}.pdf`);
      toast.success("Settlement statement & payout receipt downloaded (PDF)");
    } catch (e) {
      console.error("Failed to generate client-side PDF:", e);
      toast.error("Failed to generate settlement receipt PDF");
    }
  };

  const handleDownloadSettlementReceipt = async (payout) => {
    try {
      const res = await downloadPayoutReceiptPdf(payout.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ZEY-STL-PAY-${String(payout.id).padStart(4, "0")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Settlement statement & payout receipt downloaded (PDF)");
    } catch (err) {
      console.warn("Backend receipt PDF stream failed, using client-side renderer:", err);
      generateClientSideReceiptPdf(payout);
    }
  };

  const filteredPayouts = payouts.filter((item) => {
    const matchesStatus =
      filterStatus === "ALL" || item.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.userName?.toLowerCase().includes(query) ||
      item.nicNumber?.toLowerCase().includes(query) ||
      item.bankName?.toLowerCase().includes(query) ||
      item.theatreName?.toLowerCase().includes(query) ||
      String(item.id).includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "RELEASED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Released / Paid</span>
          </span>
        );
      case "VERIFIED_APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified & Approved</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case "PENDING_REVIEW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  // Tranche filtering & helpers
  const filteredTranches = tranches.filter((t) => {
    const matchesStatus = trancheFilterStatus === "ALL" || t.status === trancheFilterStatus;
    const query = trancheSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.showTitle?.toLowerCase().includes(query) ||
      t.organizerName?.toLowerCase().includes(query) ||
      t.payeeName?.toLowerCase().includes(query) ||
      t.payeeBankName?.toLowerCase().includes(query) ||
      t.payeeAccountNumber?.toLowerCase().includes(query) ||
      t.receiptNumber?.toLowerCase().includes(query) ||
      t.bankTransferRef?.toLowerCase().includes(query) ||
      String(t.id).includes(query);
    return matchesStatus && matchesSearch;
  });

  const filteredShowProofs = showProofs.filter((item) => {
    if (proofFilterStatus === "PENDING" && (item.pendingDocsCount || 0) === 0) return false;
    if (proofFilterStatus === "MILESTONE" && item.payoutPlan !== "MILESTONE_50_50") return false;
    if (proofFilterStatus === "STANDARD" && item.payoutPlan !== "STANDARD_POST_SHOW") return false;

    if (!proofSearchQuery.trim()) return true;
    const q = proofSearchQuery.toLowerCase().trim();
    return (
      item.showTitle?.toLowerCase().includes(q) ||
      item.dramaName?.toLowerCase().includes(q) ||
      item.organizerName?.toLowerCase().includes(q) ||
      item.organizerEmail?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.theatreName?.toLowerCase().includes(q) ||
      String(item.showId).includes(q)
    );
  });

  const getTrancheStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Disbursed & Paid</span>
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified & Approved</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case "ELIGIBLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eligible</span>
          </span>
        );
      case "LOCKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Locked</span>
          </span>
        );
      case "REQUESTED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Audit</span>
          </span>
        );
    }
  };

  const getTrancheTypeBadge = (type) => {
    if (type === "TRANCHE_1_ADVANCE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
          Stage 1: Advance (50%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
        Stage 2: Final Settlement
      </span>
    );
  };

  const getPayeeTypeBadge = (payeeType) => {
    switch (payeeType) {
      case "DIRECTOR_DIRECT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Direct Drama Director
          </span>
        );
      case "VENUE_DIRECT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Direct Auditorium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/10">
            Show Organizer
          </span>
        );
    }
  };

  // Tranche metrics
  const requestedTranchesCount = tranches.filter((t) => t.status === "REQUESTED").length;
  const requestedTranchesTotal = tranches
    .filter((t) => t.status === "REQUESTED")
    .reduce((sum, t) => sum + (Number(t.netPayableAmount) || 0), 0);
  const approvedTranchesCount = tranches.filter((t) => t.status === "APPROVED").length;
  const paidTranchesTotal = tranches
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + (Number(t.netPayableAmount) || 0), 0);

  // Legacy Metrics
  const pendingCount = payouts.filter((p) => p.status === "PENDING_REVIEW").length;
  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING_REVIEW")
    .reduce((sum, p) => sum + (Number(p.netPayableAmount) || 0), 0);
  const releasedTotal = payouts
    .filter((p) => p.status === "RELEASED")
    .reduce((sum, p) => sum + (Number(p.netPayableAmount) || 0), 0);

  // Show Proofs & Plans metrics
  const totalPendingShowDocs = showProofs.reduce(
    (acc, s) => acc + (Number(s.pendingDocsCount) || 0),
    0
  );
  const totalVerifiedShowDocs = showProofs.reduce(
    (acc, s) => acc + (Number(s.verifiedDocsCount) || 0),
    0
  );

  if (loading && loadingTranches) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading payout and milestone records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              Platform Financial Administration
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">AML & Electronic Milestone Settlement</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Payout Disbursements & Milestone Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Audit pre-show verification proofs (Hall receipts, Director agreements), verify partner KYC, and disburse two-tranche milestone settlements via LankaPay CEFT.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Sub-Tab Switcher */}
          <div className="flex items-center bg-[#1b1b28] p-1.5 rounded-2xl border border-white/10 gap-1 flex-wrap">
            <button
              onClick={() => setActiveView("TRANCHES")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === "TRANCHES"
                  ? "bg-gradient-to-r from-[#661F19] to-[#80251e] text-white shadow-md shadow-[#661F19]/40 border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-[#FED800]" />
              <span>Milestone Tranches</span>
              {requestedTranchesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                  {requestedTranchesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView("SHOW_PROOFS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === "SHOW_PROOFS"
                  ? "bg-gradient-to-r from-[#661F19] to-[#80251e] text-white shadow-md shadow-[#661F19]/40 border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Show Proofs & Plans</span>
              {totalPendingShowDocs > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-black animate-pulse">
                  {totalPendingShowDocs}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView("LEGACY")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === "LEGACY"
                  ? "bg-gradient-to-r from-[#661F19] to-[#80251e] text-white shadow-md shadow-[#661F19]/40 border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Wallet className="w-4 h-4 text-slate-300" />
              <span>Legacy Payouts</span>
            </button>
          </div>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab("agreements")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
            >
              <FileText className="w-4 h-4 text-[#FED800]" />
              <span>Agreement History</span>
            </button>
          )}
        </div>
      </div>

      {!payhereApprovedLive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">IPG Review Mode Active:</span> Public ticket payments run in sandbox. Administrator KYC audit, pre-show proof validation, and LankaPay CEFT milestone disbursements remain fully operational.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Compliance Audit
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 1: TWO-TRANCHE MILESTONE LEDGER                        */}
      {/* ============================================================== */}
      {activeView === "TRANCHES" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Tranche Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-amber-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pending Audit Requests
              </p>
              <p className="text-xl font-extrabold text-amber-400">
                {requestedTranchesCount} Tranche{requestedTranchesCount !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                LKR {Number(requestedTranchesTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })} awaiting approval
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-blue-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Verified & Approved
              </p>
              <p className="text-xl font-extrabold text-blue-400">
                {approvedTranchesCount} Ready to Release
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Ready for LankaPay CEFT transfer
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-emerald-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Lifetime Milestone Disbursed
              </p>
              <p className="text-xl font-extrabold text-emerald-400">
                LKR {Number(paidTranchesTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Archived with ZEY-STL receipts
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-purple-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Milestone Records
              </p>
              <p className="text-xl font-extrabold text-purple-300">
                {tranches.length} Tranches
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Stage 1 Advances & Final Settlements
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#14141e] p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search show, partner, bank, receipt..."
                value={trancheSearchQuery}
                onChange={(e) => setTrancheSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {["ALL", "REQUESTED", "APPROVED", "PAID", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setTrancheFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    trancheFilterStatus === st
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {st === "ALL"
                    ? "All"
                    : st === "REQUESTED"
                    ? "Pending Audit"
                    : st === "APPROVED"
                    ? "Approved"
                    : st === "PAID"
                    ? "Disbursed / Paid"
                    : "Rejected"}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Tranches Table */}
          <div className="bg-[#14141e] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e0e16] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Tranche & Stage</th>
                    <th className="py-3.5 px-4 font-bold">Drama Production</th>
                    <th className="py-3.5 px-4 font-bold">Payee & Beneficiary</th>
                    <th className="py-3.5 px-4 font-bold">Destination Bank</th>
                    <th className="py-3.5 px-4 font-bold text-right">Net Payable</th>
                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                    <th className="py-3.5 px-4 font-bold">Receipt / CEFT Ref</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredTranches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold">No milestone tranches matching criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTranches.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-amber-400 text-xs">
                            #TRN-{String(item.id).padStart(4, "0")}
                          </div>
                          <div className="mt-1">
                            {getTrancheTypeBadge(item.trancheType)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-bold truncate max-w-[150px]">
                            {item.showTitle || "Show"}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {item.theatreName} • {item.showDate ? new Date(item.showDate).toLocaleDateString() : ""}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-semibold truncate max-w-[140px]">
                            {item.payeeName}
                          </div>
                          <div className="mt-0.5">
                            {getPayeeTypeBadge(item.payeeType)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                            Org: {item.organizerName}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-semibold">{item.payeeBankName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.payeeAccountNumber} ({item.payeeBranch})
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="text-sm font-black text-emerald-400">
                            LKR {Number(item.netPayableAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            Snapshot: LKR {Number(item.organizerTicketRevenueSnapshot || 0).toLocaleString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {getTrancheStatusBadge(item.status)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                          {item.receiptNumber ? (
                            <div className="text-[#FED800] font-bold">
                              {item.receiptNumber}
                            </div>
                          ) : null}
                          {item.bankTransferRef ? (
                            <div className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block border border-emerald-500/20 mt-0.5">
                              {item.bankTransferRef}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[10px]">Pending transfer</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === "PAID" && (
                              <button
                                onClick={() => handleDownloadTrancheReceipt(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-bold inline-flex items-center gap-1 border border-emerald-500/30"
                                title="Download ZEY-STL Milestone Receipt PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedTranche(item)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-bold inline-flex items-center gap-1.5 border border-amber-500/30"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Audit & Release</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 1.5: SHOW PROOFS & PAYOUT PLANS ADMINISTRATION         */}
      {/* ============================================================== */}
      {activeView === "SHOW_PROOFS" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Proofs & Plans Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-amber-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pending Document Audits
              </p>
              <p className="text-xl font-extrabold text-amber-400 flex items-center gap-2">
                <span>{totalPendingShowDocs} Document{totalPendingShowDocs !== 1 ? "s" : ""}</span>
                {totalPendingShowDocs > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    Action Needed
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Venue receipts & director agreements awaiting verification
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-emerald-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Verified Production Proofs
              </p>
              <p className="text-xl font-extrabold text-emerald-400">
                {totalVerifiedShowDocs} Document{totalVerifiedShowDocs !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Ready for pre-show advance liquidity
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-cyan-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Milestone 50/50 Shows
              </p>
              <p className="text-xl font-extrabold text-cyan-400">
                {showProofs.filter((s) => s.payoutPlan === "MILESTONE_50_50").length} Shows
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Advance tranche engine enabled
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-purple-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Standard Post-Show
              </p>
              <p className="text-xl font-extrabold text-purple-400">
                {showProofs.filter((s) => s.payoutPlan === "STANDARD_POST_SHOW").length} Shows
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                100% final settlement after curtain-up
              </p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-[#14141e] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search show, drama, partner, venue..."
                value={proofSearchQuery}
                onChange={(e) => setProofSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0e0e16] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setProofFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  proofFilterStatus === "ALL"
                    ? "bg-[#FED800] text-slate-950 shadow-md"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                All Shows ({showProofs.length})
              </button>
              <button
                onClick={() => setProofFilterStatus("PENDING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  proofFilterStatus === "PENDING"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <span>Pending Audit</span>
                {totalPendingShowDocs > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                    {totalPendingShowDocs}
                  </span>
                )}
              </button>
              <button
                onClick={() => setProofFilterStatus("MILESTONE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  proofFilterStatus === "MILESTONE"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Milestone 50/50
              </button>
              <button
                onClick={() => setProofFilterStatus("STANDARD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  proofFilterStatus === "STANDARD"
                    ? "bg-purple-500 text-slate-950 shadow-md"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Standard Post-Show
              </button>
            </div>
          </div>

          {/* Show Proofs & Plans Table */}
          <div className="bg-[#14141e] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e0e16] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Show &amp; Production</th>
                    <th className="py-3.5 px-4 font-bold">Organizer / Partner</th>
                    <th className="py-3.5 px-4 font-bold">Payout Plan &amp; Advance</th>
                    <th className="py-3.5 px-4 font-bold">Pre-Show Proofs (Hall Receipt / Agreement)</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {loadingShowProofs ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
                        <p className="text-xs">Loading production proofs &amp; payout plans...</p>
                      </td>
                    </tr>
                  ) : filteredShowProofs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold">No shows matching the selected criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredShowProofs.map((show) => {
                      const hallDoc = show.documents?.find((d) => d.docType === "HALL_BOOKING_RECEIPT");
                      const dirDoc = show.documents?.find((d) => d.docType === "DIRECTOR_AGREEMENT");
                      const isMilestone = show.payoutPlan === "MILESTONE_50_50";
                      const isUpdatingThisPlan = updatingPlanShowId === show.showId;

                      return (
                        <tr key={show.showId} className="hover:bg-white/[0.02] transition-colors">
                          {/* Show & Production */}
                          <td className="py-3.5 px-4">
                            <div className="text-white font-bold text-sm">
                              {show.showTitle || "Show"}
                            </div>
                            {show.dramaName && (
                              <div className="text-xs text-amber-400 font-semibold mt-0.5">
                                {show.dramaName}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {show.showDate ? new Date(show.showDate).toLocaleDateString() : ""} {show.showTime || ""}
                              </span>
                              <span>•</span>
                              <span>{show.theatreName || show.location || "-"}</span>
                            </div>
                          </td>

                          {/* Organizer / Partner */}
                          <td className="py-3.5 px-4">
                            <div className="text-white font-bold">{show.organizerName || "Partner"}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {show.organizerEmail || show.organizerPhone || "-"}
                            </div>
                            <div className="mt-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                                  show.kycVerified
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {show.kycVerified ? "KYC VERIFIED" : "PENDING KYC"}
                              </span>
                            </div>
                          </td>

                          {/* Payout Plan & Advance */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                                    isMilestone
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                      : "bg-slate-700/40 text-slate-300 border-white/10"
                                  }`}
                                >
                                  {isMilestone ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Milestone 50/50</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Standard Post-Show</span>
                                    </>
                                  )}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-400">
                                Paid Sales:{" "}
                                <strong className="text-amber-300 font-mono">
                                  LKR {Number(show.totalConfirmedTicketRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </strong>
                              </div>

                              {/* Plan Switch Button */}
                              <button
                                type="button"
                                disabled={isUpdatingThisPlan}
                                onClick={() => handleTogglePayoutPlan(show.showId, show.payoutPlan)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
                                  isMilestone
                                    ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                                }`}
                                title={isMilestone ? "Revert to Standard Post-Show" : "Enable 50% Pre-Show Advance"}
                              >
                                {isUpdatingThisPlan ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : isMilestone ? (
                                  <RotateCcw className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                )}
                                <span>{isMilestone ? "Revert to Post-Show" : "Switch to 50/50 Advance"}</span>
                              </button>
                            </div>
                          </td>

                          {/* Uploaded Proofs */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-2 min-w-[260px] max-w-[320px]">
                              {/* Hall Receipt Item */}
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-white text-[11px]">Hall Booking Receipt</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                      hallDoc?.verificationStatus === "VERIFIED"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : hallDoc?.verificationStatus === "PENDING"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                        : hallDoc?.verificationStatus === "REJECTED"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : "bg-white/5 text-slate-500"
                                    }`}
                                  >
                                    {hallDoc?.verificationStatus || "NOT UPLOADED"}
                                  </span>
                                </div>

                                {hallDoc?.rejectionReason && (
                                  <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1 rounded border border-rose-500/20">
                                    <strong>Rejection:</strong> {hallDoc.rejectionReason}
                                  </p>
                                )}

                                {hallDoc ? (
                                  <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/5">
                                    {hallDoc.presignedUrl ? (
                                      <a
                                        href={hallDoc.presignedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded"
                                      >
                                        <Eye className="w-3 h-3" /> View Proof
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-slate-500">File uploaded</span>
                                    )}

                                    <div className="flex items-center gap-1">
                                      {hallDoc.verificationStatus !== "VERIFIED" && (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyDirectShowProof(hallDoc.id)}
                                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors"
                                        >
                                          Verify
                                        </button>
                                      )}
                                      {hallDoc.verificationStatus !== "REJECTED" && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRejectingShowDocId(hallDoc.id);
                                            setShowRejectShowDocModal(true);
                                          }}
                                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold transition-colors"
                                        >
                                          Reject
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-500 italic">Waiting for organizer upload</p>
                                )}
                              </div>

                              {/* Director Agreement Item */}
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-white text-[11px]">Director Agreement</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                      dirDoc?.verificationStatus === "VERIFIED"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : dirDoc?.verificationStatus === "PENDING"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                        : dirDoc?.verificationStatus === "REJECTED"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : "bg-white/5 text-slate-500"
                                    }`}
                                  >
                                    {dirDoc?.verificationStatus || "NOT UPLOADED"}
                                  </span>
                                </div>

                                {dirDoc?.rejectionReason && (
                                  <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1 rounded border border-rose-500/20">
                                    <strong>Rejection:</strong> {dirDoc.rejectionReason}
                                  </p>
                                )}

                                {dirDoc ? (
                                  <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/5">
                                    {dirDoc.presignedUrl ? (
                                      <a
                                        href={dirDoc.presignedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded"
                                      >
                                        <Eye className="w-3 h-3" /> View Proof
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-slate-500">File uploaded</span>
                                    )}

                                    <div className="flex items-center gap-1">
                                      {dirDoc.verificationStatus !== "VERIFIED" && (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyDirectShowProof(dirDoc.id)}
                                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors"
                                        >
                                          Verify
                                        </button>
                                      )}
                                      {dirDoc.verificationStatus !== "REJECTED" && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRejectingShowDocId(dirDoc.id);
                                            setShowRejectShowDocModal(true);
                                          }}
                                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold transition-colors"
                                        >
                                          Reject
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-500 italic">Optional (director transfer)</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Direct Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex flex-col items-end gap-2">
                              {hallDoc?.verificationStatus === "VERIFIED" && show.kycVerified && isMilestone ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Advance Eligible</span>
                                </span>
                              ) : hallDoc?.verificationStatus === "PENDING" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Proof Awaiting Audit</span>
                                </span>
                              ) : !isMilestone ? (
                                <span className="text-[10px] text-slate-500 italic">
                                  Post-Show Settlement
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  Pending Venue Proof
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: LEGACY PAYOUTS LEDGER                               */}
      {/* ============================================================== */}
      {activeView === "LEGACY" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Legacy 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-amber-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pending Audit
              </p>
              <p className="text-xl font-extrabold text-amber-400">
                {pendingCount} Request{pendingCount !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                ₨ {Number(pendingTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })} awaiting approval
              </p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-emerald-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Lifetime Released Disbursements
              </p>
              <p className="text-xl font-extrabold text-emerald-400">
                ₨ {Number(releasedTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Transferred to theatre accounts</p>
            </div>

            <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-purple-500/50 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Payout Requests
              </p>
              <p className="text-xl font-extrabold text-purple-300">
                {payouts.length}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">All historical submissions</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#14141e] p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search partner, NIC, bank, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {["ALL", "PENDING_REVIEW", "VERIFIED_APPROVED", "RELEASED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === st
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {st === "ALL"
                    ? "All"
                    : st === "PENDING_REVIEW"
                    ? "Pending Audit"
                    : st === "VERIFIED_APPROVED"
                    ? "Approved"
                    : st === "RELEASED"
                    ? "Released"
                    : "Rejected"}
                </button>
              ))}
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-[#14141e] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e0e16] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Request ID</th>
                    <th className="py-3.5 px-4 font-bold">Theatre Partner</th>
                    <th className="py-3.5 px-4 font-bold">NIC Number</th>
                    <th className="py-3.5 px-4 font-bold">Net Payable (LKR)</th>
                    <th className="py-3.5 px-4 font-bold">Bank Details</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Bank CEFT Ref</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold">No payout requests matching criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          #PAY-{String(item.id).padStart(4, "0")}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-white font-bold">{item.userName || "Partner"}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.theatreName || "Theatre"} • {item.userPhone || "-"}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          {item.nicNumber || "-"}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                          ₨ {Number(item.netPayableAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-white font-semibold">{item.bankName}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.accountNumber} ({item.bankBranch})
                          </p>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {item.releaseTransactionRef ? (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {item.releaseTransactionRef}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Not Transferred</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === "RELEASED" && (
                              <button
                                onClick={() => handleDownloadSettlementReceipt(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-bold inline-flex items-center gap-1 border border-emerald-500/30"
                                title="Download Settlement Statement & Payout Receipt (PDF)"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPayout(item)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-bold inline-flex items-center gap-1.5 border border-amber-500/30"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Audit / Action</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MILESTONE TRANCHE AUDIT & RELEASE MODAL                 */}
      {/* ============================================================== */}
      {selectedTranche && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181826] to-[#14141e]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>Audit Milestone Tranche #TRN-{String(selectedTranche.id).padStart(4, "0")}</span>
                  </h3>
                  {getTrancheTypeBadge(selectedTranche.trancheType)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Production: <strong>{selectedTranche.showTitle}</strong> • Organizer: <strong>{selectedTranche.organizerName}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTranche(null);
                  setTrancheActionType(null);
                  setIsEditingBankDetails(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Financial Box */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0e0e16] border border-white/10 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Confirmed Ticket Revenue</p>
                  <p className="text-sm font-bold text-white mt-1">
                    LKR {Number(selectedTranche.organizerTicketRevenueSnapshot || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Paid seats snapshot</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Previous Tranche Deducted</p>
                  <p className="text-sm font-bold text-amber-400 mt-1">
                    -LKR {Number(selectedTranche.previousTrancheDeducted || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Stage 1 advance paid</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Net Disbursable (LKR)</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-1">
                    LKR {Number(selectedTranche.netPayableAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-emerald-400/80 mt-0.5 font-semibold">Exact LankaPay amount</p>
                </div>
              </div>

              {/* Beneficiary Bank Account */}
              <div className="p-4 rounded-2xl bg-[#0e0e16] border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Destination Beneficiary Account:</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {getPayeeTypeBadge(selectedTranche.payeeType)}
                    {!isEditingBankDetails && (
                      <button
                        onClick={startEditingBank}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/10 transition-colors"
                        title="Edit Beneficiary Bank Account"
                      >
                        <Pencil className="w-3 h-3 text-amber-400" />
                        <span>Edit Bank</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingBankDetails ? (
                  <form onSubmit={handleSaveBankDetails} className="space-y-3 pt-1">
                    {showEligibilityData?.organizerAccountNumber &&
                      showEligibilityData.organizerAccountNumber !== bankFormData.payeeAccountNumber && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                          <div className="text-[11px] text-amber-300">
                            <strong>Registered KYC Account:</strong> {showEligibilityData.organizerBankName} ({showEligibilityData.organizerAccountNumber})
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBankFormData({
                                payeeName: showEligibilityData.organizerAccountName || bankFormData.payeeName,
                                payeeBankName: showEligibilityData.organizerBankName || bankFormData.payeeBankName,
                                payeeBranch: showEligibilityData.organizerBankBranch || bankFormData.payeeBranch,
                                payeeAccountNumber: showEligibilityData.organizerAccountNumber,
                              })
                            }
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold"
                          >
                            Use This Account
                          </button>
                        </div>
                      )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Payee / Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bankFormData.payeeName}
                          onChange={(e) => setBankFormData({ ...bankFormData, payeeName: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                          placeholder="Beneficiary Account Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankFormData.payeeBankName}
                          onChange={(e) => setBankFormData({ ...bankFormData, payeeBankName: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                          placeholder="e.g. Commercial Bank of Ceylon"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Branch
                        </label>
                        <input
                          type="text"
                          value={bankFormData.payeeBranch}
                          onChange={(e) => setBankFormData({ ...bankFormData, payeeBranch: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                          placeholder="e.g. Colombo Main"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          value={bankFormData.payeeAccountNumber}
                          onChange={(e) => setBankFormData({ ...bankFormData, payeeAccountNumber: e.target.value })}
                          className="w-full bg-[#161622] border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                          placeholder="e.g. 8001234567"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsEditingBankDetails(false)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingBank}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                      >
                        {isSavingBank ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Save Account</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-xs">
                    <p>
                      <strong className="text-slate-400">Payee Name:</strong>{" "}
                      <span className="text-white font-medium">{selectedTranche.payeeName || showEligibilityData?.organizerAccountName || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-slate-400">Bank:</strong>{" "}
                      <span className="text-white font-medium">{selectedTranche.payeeBankName || showEligibilityData?.organizerBankName || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-slate-400">Branch:</strong>{" "}
                      <span className="text-white font-medium">{selectedTranche.payeeBranch || showEligibilityData?.organizerBankBranch || "-"}</span>
                    </p>
                    <div>
                      <strong className="text-slate-400">Account No:</strong>{" "}
                      {selectedTranche.payeeAccountNumber || showEligibilityData?.organizerAccountNumber ? (
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {selectedTranche.payeeAccountNumber || showEligibilityData?.organizerAccountNumber}
                        </span>
                      ) : (
                        <span className="text-rose-400 text-[11px] font-semibold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Not Provided (Click Edit Bank)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* If Direct-to-Director Authorization Doc uploaded */}
                {selectedTranche.authorizationDocPresignedUrl && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-semibold text-[11px]">
                        Payee Direct Authorization Letter (R2 Private)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={selectedTranche.authorizationDocPresignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[11px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-Show Verification Proofs (Hall Receipt, Director Agreement) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pre-Show Verification Proofs (5-Min Presigned R2):</span>
                  </p>
                  {loadingShowDocs && (
                    <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading proofs...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Hall Booking Receipt Card */}
                  {(() => {
                    const hallDoc = showEligibilityData?.verificationDocs?.find(
                      (d) => d.docType === "HALL_BOOKING_RECEIPT"
                    );
                    const status = hallDoc?.verificationStatus || "NOT_UPLOADED";
                    return (
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-amber-300">Auditorium / Hall Receipt</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {hallDoc?.fileName || "Venue confirmation proof"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              status === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : status === "PENDING"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-white/5 text-slate-500"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        {hallDoc?.rejectionReason && (
                          <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                            <strong>Reason:</strong> {hallDoc.rejectionReason}
                          </p>
                        )}

                        {hallDoc?.presignedUrl && (
                          <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <a
                              href={hallDoc.presignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Proof
                            </a>

                            <div className="flex items-center gap-1">
                              {status !== "VERIFIED" && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyShowDoc(hallDoc.id)}
                                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold"
                                >
                                  Verify
                                </button>
                              )}
                              {status !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingShowDocId(hallDoc.id);
                                    setShowRejectShowDocModal(true);
                                  }}
                                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[10px] font-bold"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Director Agreement Card */}
                  {(() => {
                    const dirDoc = showEligibilityData?.verificationDocs?.find(
                      (d) => d.docType === "DIRECTOR_AGREEMENT"
                    );
                    const status = dirDoc?.verificationStatus || "NOT_UPLOADED";
                    return (
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-amber-300">Drama Director Agreement</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {dirDoc?.fileName || "Director contract & authorization"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              status === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : status === "PENDING"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-white/5 text-slate-500"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        {dirDoc?.rejectionReason && (
                          <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                            <strong>Reason:</strong> {dirDoc.rejectionReason}
                          </p>
                        )}

                        {dirDoc?.presignedUrl && (
                          <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <a
                              href={dirDoc.presignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Proof
                            </a>

                            <div className="flex items-center gap-1">
                              {status !== "VERIFIED" && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyShowDoc(dirDoc.id)}
                                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold"
                                >
                                  Verify
                                </button>
                              )}
                              {status !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingShowDocId(dirDoc.id);
                                    setShowRejectShowDocModal(true);
                                  }}
                                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[10px] font-bold"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Linked Organizer Identity & KYC Overview */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Organizer Identity & KYC Status
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {selectedTranche.organizerName}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    showEligibilityData?.kycVerified
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {showEligibilityData?.kycVerified ? "KYC VERIFIED" : "PENDING KYC"}
                </span>
              </div>

              {/* Release Action Form */}
              {trancheActionType === "RELEASE" && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-emerald-400 text-sm">
                      Disburse Milestone via LankaPay CEFT
                    </h4>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Enter the official LankaPay / CEFT bank transaction reference number. Submitting this will record the transfer, set status to <strong>PAID</strong>, and generate the official <strong>ZEY-STL</strong> receipt PDF archived in Cloudflare R2:
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      LankaPay / CEFT Bank Transfer Reference *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CEFT-20261124-88412"
                      value={trancheTransferRef}
                      onChange={(e) => setTrancheTransferRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white font-mono font-bold focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Administrative Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Advance released following hall booking verification"
                      value={trancheRemarks}
                      onChange={(e) => setTrancheRemarks(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:outline-none text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setTrancheActionType(null)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReleaseTranche}
                      disabled={processingTranche}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {processingTranche ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating ZEY-STL Receipt...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Confirm Disbursed & Generate Receipt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!trancheActionType && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0e0e16]">
                <button
                  onClick={() => {
                    setSelectedTranche(null);
                    setTrancheActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedTranche.status === "REQUESTED" && (
                    <button
                      onClick={() => handleUpdateTrancheStatus("APPROVED")}
                      disabled={processingTranche}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve Tranche</span>
                    </button>
                  )}

                  {selectedTranche.status !== "PAID" && (
                    <button
                      onClick={() => setTrancheActionType("RELEASE")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Disburse LankaPay CEFT</span>
                    </button>
                  )}

                  {selectedTranche.status === "PAID" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadTrancheReceipt(selectedTranche)}
                        className="px-4 py-2 rounded-xl bg-[#FED800]/20 hover:bg-[#FED800]/30 text-[#FED800] border border-[#FED800]/40 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download ZEY-STL Receipt (PDF)</span>
                      </button>
                    </div>
                  ) : (
                    selectedTranche.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateTrancheStatus("REJECTED")}
                        className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show Verification Document Reject Modal */}
      {showRejectShowDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Reject Show Verification Proof</span>
              </h3>
              <button
                onClick={() => {
                  setShowRejectShowDocModal(false);
                  setRejectingShowDocId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please enter the specific reason why this show proof (Hall Receipt or Director Agreement) was rejected. This feedback will be displayed to the theatre partner so they can re-upload.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Rejection Reason / Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectShowDocReason}
                onChange={(e) => setRejectShowDocReason(e.target.value)}
                placeholder="e.g. Hall booking receipt does not specify the correct drama show date or is missing the auditorium seal."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectShowDocModal(false);
                  setRejectingShowDocId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectShowDoc}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Audit & Action Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#14141e] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>
                    Audit Payout Request #PAY-{String(selectedPayout.id).padStart(4, "0")}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Applicant: <strong>{selectedPayout.userName}</strong> (NIC: {selectedPayout.nicNumber})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedPayout(null);
                  setActionType(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Financial Box */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#0e0e16] border border-white/10 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Requested Withdrawal</p>
                  <p className="text-sm font-bold text-white mt-1">
                    ₨ {Number(selectedPayout.requestedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Additional Payout Fee</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">
                    ₨ 0.00
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Settled per booking</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Net LankaPay CEFT</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-1">
                    ₨ {Number(selectedPayout.netPayableAmount || selectedPayout.requestedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/10 space-y-2">
                <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Destination Bank Information:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p><strong>Bank:</strong> {selectedPayout.bankName}</p>
                  <p><strong>Branch:</strong> {selectedPayout.bankBranch}</p>
                  <p><strong>Account Name:</strong> {selectedPayout.accountHolderName}</p>
                  <p className="font-mono font-bold text-amber-300">
                    <strong>Account No:</strong> {selectedPayout.accountNumber}
                  </p>
                </div>
              </div>

              {/* Documents Inspection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Submitted KYC & Legal Verification Documents:</span>
                  </p>
                  {loadingKycDocs && (
                    <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading KYC files...
                    </span>
                  )}
                </div>

                {(() => {
                  const nicFront =
                    organizerKycDocs.find((d) => d.documentType === "NIC_FRONT") ||
                    (selectedPayout.nicFrontUrl
                      ? { fileUrl: selectedPayout.nicFrontUrl, fileName: "NIC_Front.jpg", status: "PENDING" }
                      : selectedPayout.nicDocumentUrl
                      ? { fileUrl: selectedPayout.nicDocumentUrl, fileName: "NIC_Document.jpg", status: "PENDING" }
                      : null);

                  const nicBack =
                    organizerKycDocs.find((d) => d.documentType === "NIC_BACK") ||
                    (selectedPayout.nicBackUrl
                      ? { fileUrl: selectedPayout.nicBackUrl, fileName: "NIC_Back.jpg", status: "PENDING" }
                      : null);

                  const brCert =
                    organizerKycDocs.find((d) => d.documentType === "BUSINESS_REGISTRATION") ||
                    (selectedPayout.brDocumentUrl
                      ? { fileUrl: selectedPayout.brDocumentUrl, fileName: "Business_Registration.pdf", status: "PENDING" }
                      : null);

                  const bankProof =
                    organizerKycDocs.find((d) => d.documentType === "BANK_PROOF") ||
                    (selectedPayout.bankProofUrl
                      ? { fileUrl: selectedPayout.bankProofUrl, fileName: "Bank_Proof.pdf", status: "PENDING" }
                      : selectedPayout.bankStatementUrl
                      ? { fileUrl: selectedPayout.bankStatementUrl, fileName: "Bank_Statement.pdf", status: "PENDING" }
                      : null);

                  const otherDocs = organizerKycDocs.filter((d) => d.documentType === "OTHER_KYC");

                  const getDocLink = (doc) => {
                    if (!doc) return "";
                    const url = doc.fileUrl;
                    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                      return url;
                    }
                    if (doc.id) {
                      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
                      return `${apiBase}/organizer/kyc/documents/${doc.id}/file`;
                    }
                    return url || "";
                  };

                  const renderDocCard = (title, doc, isRequired = false, isOptional = false) => {
                    if (!doc?.fileUrl) {
                      return (
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300">{title}</span>
                            <span className="text-[10px] text-slate-500 italic">
                              {isOptional ? "Not uploaded (Optional)" : "Missing / Not attached"}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const status = (doc.status || "PENDING").toUpperCase();
                    const docUrl = getDocLink(doc);
                    return (
                      <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 space-y-2 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-amber-300 truncate">{title}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5" title={doc.fileName}>
                              {doc.fileName || "Uploaded Document"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              status === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        {doc.rejectionReason && (
                          <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                            <strong>Reason:</strong> {doc.rejectionReason}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </a>
                            <a
                              href={docUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>

                          {doc.id && (
                            <div className="flex items-center gap-1">
                              {status !== "VERIFIED" && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyDoc(doc.id)}
                                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold transition-colors"
                                  title="Approve this document"
                                >
                                  Verify
                                </button>
                              )}
                              {status !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingDocId(doc.id);
                                    setShowRejectModal(true);
                                  }}
                                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[10px] font-bold transition-colors"
                                  title="Reject this document with feedback"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {renderDocCard("NIC Front Copy", nicFront, true)}
                        {renderDocCard("NIC Back Copy", nicBack, true)}
                        {renderDocCard("Bank Statement Proof", bankProof, true)}
                        {renderDocCard("Business Registration (BR)", brCert, false, true)}
                      </div>

                      {otherDocs.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <p className="text-xs font-bold text-slate-300">
                            Other Supporting Documents ({otherDocs.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {otherDocs.map((doc) =>
                              renderDocCard(doc.customLabel || "Supporting Document", doc, false, true)
                            )}
                          </div>
                        </div>
                      )}

                      {selectedPayout.agreementDocumentUrl && (
                        <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 flex items-center justify-between text-amber-300 font-bold">
                          <span className="truncate text-xs">View Signed Agreement Document (PDF/Image)</span>
                          <div className="flex items-center gap-2">
                            <a
                              href={selectedPayout.agreementDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </a>
                            <a
                              href={selectedPayout.agreementDocumentUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {setActiveTab && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayout(null);
                            setActiveTab("agreements");
                          }}
                          className="w-full p-2.5 rounded-xl bg-[#FED800]/10 hover:bg-[#FED800]/20 border border-[#FED800]/30 flex items-center justify-between text-[#FED800] font-bold text-xs text-left transition-colors"
                        >
                          <span className="truncate">Inspect Organizer in Agreement History Vault</span>
                          <ArrowUpRight className="w-4 h-4 shrink-0" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Digital Signature */}
              {selectedPayout.signatureDataUrl && (
                <div className="p-3 rounded-xl bg-[#0e0e16] border border-white/10">
                  <p className="font-bold text-white mb-2">Electronic Signature Applied by Signatory:</p>
                  <img
                    src={selectedPayout.signatureDataUrl}
                    alt="Digital Signature"
                    className="h-16 max-w-xs object-contain border border-white/10 rounded p-1 bg-black/40"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Signed at: {selectedPayout.signedAt ? new Date(selectedPayout.signedAt).toLocaleString() : "-"}
                  </p>
                </div>
              )}

              {/* Action Panels */}
              {actionType === "RELEASE" && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <h4 className="font-bold text-emerald-400">Confirm Payment Release</h4>
                  <p className="text-slate-300 text-[11px]">
                    Enter the LankaPay CEFT / SLIPS bank transfer transaction reference number:
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CEFT-20261122-98412"
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white font-mono font-bold focus:border-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Optional transfer note to applicant"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus("RELEASED")}
                      disabled={processing}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                    >
                      {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Confirm Released</span>
                    </button>
                    <button
                      onClick={() => setActionType(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {actionType === "REJECT" && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                  <h4 className="font-bold text-rose-400">Reject Payout Request</h4>
                  <p className="text-slate-300 text-[11px]">
                    Specify reason for rejection (e.g. mismatched account name, illegible NIC copy):
                  </p>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter rejection reason..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-rose-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus("REJECTED")}
                      disabled={processing}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                    >
                      {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Confirm Rejection</span>
                    </button>
                    <button
                      onClick={() => setActionType(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!actionType && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0e0e16]">
                <button
                  onClick={() => {
                    setSelectedPayout(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedPayout.status === "PENDING_REVIEW" && (
                    <button
                      onClick={() => handleUpdateStatus("VERIFIED_APPROVED")}
                      disabled={processing}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Approve</span>
                    </button>
                  )}

                  {selectedPayout.status !== "RELEASED" && (
                    <button
                      onClick={() => setActionType("RELEASE")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Disburse Payment (CEFT)</span>
                    </button>
                  )}

                  {selectedPayout.status === "RELEASED" ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">Bank CEFT Ref:</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {selectedPayout.releaseTransactionRef || selectedPayout.bankCeftRef || "12345896238"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadSettlementReceipt(selectedPayout)}
                        className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Receipt (PDF)</span>
                      </button>
                    </div>
                  ) : (
                    selectedPayout.status !== "REJECTED" && (
                      <button
                        onClick={() => setActionType("REJECT")}
                        className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC Document Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Reject KYC Document</span>
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingDocId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please enter the specific reason why this document was rejected. This feedback will be displayed in the organizer&apos;s KYC vault so they can re-upload a compliant document.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Rejection Feedback / Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="e.g. Document photo is too blurry / Account number not legible. Please re-upload a clear color scan."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingDocId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectDoc}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
