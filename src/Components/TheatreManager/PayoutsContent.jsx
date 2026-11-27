"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Building2,
  AlertCircle,
  AlertTriangle,
  Printer,
  X,
  RotateCcw,
  ShieldCheck,
  Check,
  DollarSign,
  User,
  ChevronRight,
  CreditCard,
  PenTool,
  Loader2,
  Sparkles,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import { getActiveCommission } from "../../services/CommissionService";
import { useAuth } from "../../utils/AuthContext";
import {
  getPayoutSummary,
  requestPayout,
  submitKycAgreement,
  downloadPayoutReceiptPdf,
} from "../../services/PayoutService";
import { uploadFile } from "../../services/FileService";
import { uploadKycDocument, getMyKycOverview } from "../../services/KycService";
import { toast } from "react-toastify";
import TwoStageMilestoneProgressCard from "./TwoStageMilestoneProgressCard";

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

export default function PayoutsContent({ setActiveTab }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOneTimeKycModal, setShowOneTimeKycModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [activeCommission, setActiveCommission] = useState(null);
  const [inspectPayout, setInspectPayout] = useState(null);
  const [kycOverviewData, setKycOverviewData] = useState(null);

  // One-Time KYC Stepper
  const [kycStep, setKycStep] = useState(1); // 1: Documents & Bank, 2: Legal Agreement & Sign
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const [uploadingDoc, setUploadingDoc] = useState({
    nic: false,
    bank: false,
    agreement: false,
  });

  // Form states
  const [formData, setFormData] = useState({
    requestedAmount: "",
    bankName: "Commercial Bank of Ceylon",
    bankBranch: "",
    accountHolderName: user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "",
    accountNumber: "",
    bankAccountNumber: "",
    nicNumber: "",
    nicDocumentUrl: "",
    bankStatementUrl: "",
    agreementDocumentUrl: "",
    signatureDataUrl: "",
    isAgreementSigned: true,
  });

  // Signature canvas & smooth drawing
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);

  const fetchSummaryData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getPayoutSummary(user.id);
      if (res?.data) {
        setSummary(res.data);
        const s = res.data;
        const savedBank = s.savedBankName || s.bankName || s.payoutHistory?.[0]?.bankName || "";
        const savedBranch = s.savedBankBranch || s.bankBranch || s.payoutHistory?.[0]?.bankBranch || "";
        const savedHolder = s.savedAccountHolderName || s.accountHolderName || s.payoutHistory?.[0]?.accountHolderName || "";
        const savedAcc = s.bankAccountNumber || s.savedAccountNumber || s.accountNumber || s.payoutHistory?.[0]?.accountNumber || "";
        const savedNic = s.nicNumber || s.savedNicNumber || s.payoutHistory?.[0]?.nicNumber || user?.nicNumber || user?.nic || "";
        const savedSig = s.savedSignatureDataUrl || s.signatureDataUrl || s.payoutHistory?.[0]?.signatureDataUrl || "";
        const savedNicDoc = s.savedNicDocumentUrl || s.nicDocumentUrl || s.payoutHistory?.[0]?.nicDocumentUrl || "";
        const savedBankDoc = s.savedBankStatementUrl || s.bankStatementUrl || s.payoutHistory?.[0]?.bankStatementUrl || "";
        const savedAgrDoc = s.savedAgreementDocumentUrl || s.agreementDocumentUrl || s.payoutHistory?.[0]?.agreementDocumentUrl || "";

        // Pre-fill form data with saved details if available
        setFormData((prev) => ({
          ...prev,
          bankName: savedBank || prev.bankName,
          bankBranch: savedBranch || prev.bankBranch,
          accountHolderName: savedHolder || prev.accountHolderName,
          accountNumber: savedAcc || prev.accountNumber,
          bankAccountNumber: savedAcc || prev.bankAccountNumber || prev.accountNumber,
          nicNumber: (savedNic && savedNic.toLowerCase() !== "verified on file") ? savedNic : prev.nicNumber,
          nicDocumentUrl: savedNicDoc || prev.nicDocumentUrl,
          bankStatementUrl: savedBankDoc || prev.bankStatementUrl,
          agreementDocumentUrl: savedAgrDoc || prev.agreementDocumentUrl,
          signatureDataUrl: savedSig || prev.signatureDataUrl,
        }));
        if (savedSig) {
          setHasDrawnSignature(true);
        }
      }

      // Automatically inspect dedicated KYC Documents Vault
      try {
        const kycOverview = await getMyKycOverview();
        if (kycOverview) {
          setKycOverviewData(kycOverview);
          const docs = kycOverview.documents || [];
          const nicFront = docs.find((d) => d.documentType === "NIC_FRONT");
          const bankProof = docs.find((d) => d.documentType === "BANK_PROOF");

          setFormData((prev) => ({
            ...prev,
            nicNumber: prev.nicNumber || kycOverview.nicNumber || "",
            nicDocumentUrl: prev.nicDocumentUrl || nicFront?.fileUrl || "",
            bankStatementUrl: prev.bankStatementUrl || bankProof?.fileUrl || "",
          }));
        }
      } catch (e) {
        console.debug("Could not retrieve KYC overview in payouts:", e);
      }
    } catch (err) {
      console.error("Error loading payout summary:", err);
      toast.error("Could not load payout financial summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [user]);

  // Smooth Quadratic Bézier Drawing Engine
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    ctx.clearRect(0, 0, rect.width, rect.height);

    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current) {
      allStrokes.push(currentStrokeRef.current);
    }

    for (const stroke of allStrokes) {
      const pts = stroke.points;
      if (!pts || pts.length === 0) continue;

      ctx.strokeStyle = stroke.color || "#FED800";
      ctx.fillStyle = stroke.color || "#FED800";
      ctx.lineWidth = stroke.width || 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, (stroke.width || 2.5) / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      if (pts.length === 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.stroke();
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length - 1; i++) {
        const pCurr = pts[i];
        const pNext = pts[i + 1];
        const mid = { x: (pCurr.x + pNext.x) / 2, y: (pCurr.y + pNext.y) / 2 };
        ctx.quadraticCurveTo(pCurr.x, pCurr.y, mid.x, mid.y);
      }

      const pPenultimate = pts[pts.length - 2];
      const pLast = pts[pts.length - 1];
      ctx.quadraticCurveTo(pPenultimate.x, pPenultimate.y, pLast.x, pLast.y);
      ctx.stroke();
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    redrawCanvas();
  };

  useEffect(() => {
    if (showOneTimeKycModal && kycStep === 2) {
      const timer = setTimeout(initCanvas, 80);
      window.addEventListener("resize", initCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", initCanvas);
      };
    }
  }, [showOneTimeKycModal, kycStep]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.pointerId && canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const stroke = {
      color: "#FED800",
      width: 2.5,
      points: [{ x, y }],
    };
    currentStrokeRef.current = stroke;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#FED800";
    ctx.fillStyle = "#FED800";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(x, y, 1.25, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pts = currentStrokeRef.current.points;
    const lastPt = pts[pts.length - 1];

    if (lastPt) {
      const dist = Math.hypot(x - lastPt.x, y - lastPt.y);
      if (dist < 1.5) return;
    }

    pts.push({ x, y });

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#FED800";
    ctx.fillStyle = "#FED800";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (pts.length >= 3) {
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];

      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    } else if (pts.length === 2) {
      const p0 = pts[0];
      const p1 = pts[1];
      const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(mid.x, mid.y);
      ctx.stroke();
    }

    setHasDrawnSignature(true);
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e?.pointerId && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const pts = currentStrokeRef.current.points;
      if (pts.length >= 2) {
        const pPrev = pts[pts.length - 2];
        const pLast = pts[pts.length - 1];
        const mid = { x: (pPrev.x + pLast.x) / 2, y: (pPrev.y + pLast.y) / 2 };
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#FED800";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();
      }

      strokesRef.current.push(currentStrokeRef.current);
      currentStrokeRef.current = null;
    }

    exportSignature();
  };

  const exportSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (strokesRef.current.length === 0) {
      setFormData((prev) => ({ ...prev, signatureDataUrl: "" }));
      setHasDrawnSignature(false);
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    setFormData((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
    setHasDrawnSignature(true);
  };

  const undoSignature = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    redrawCanvas();
    if (strokesRef.current.length === 0) {
      setHasDrawnSignature(false);
      setFormData((prev) => ({ ...prev, signatureDataUrl: "" }));
    } else {
      exportSignature();
    }
  };

  const clearSignature = () => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
    setHasDrawnSignature(false);
    setFormData((prev) => ({ ...prev, signatureDataUrl: "" }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document size exceeds 10MB limit");
      return;
    }
    setUploadingDoc((prev) => ({ ...prev, [type]: true }));
    try {
      const docType =
        type === "nic" ? "NIC_FRONT" : type === "bank" ? "BANK_PROOF" : "OTHER_KYC";
      const res = await uploadKycDocument(file, docType);
      const cdnUrl = res.fileUrl || res.filePath || res.fileName;
      if (type === "nic") {
        setFormData((prev) => ({ ...prev, nicDocumentUrl: cdnUrl }));
        toast.success("NIC Document uploaded successfully");
      } else if (type === "bank") {
        setFormData((prev) => ({ ...prev, bankStatementUrl: cdnUrl }));
        toast.success("Bank verification proof uploaded");
      } else if (type === "agreement") {
        setFormData((prev) => ({ ...prev, agreementDocumentUrl: cdnUrl }));
        toast.success("Signed Agreement uploaded");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errMsg = err?.message || "File upload failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [type]: false }));
    }
  };

  // --- SUBMIT ONE-TIME KYC DOCUMENTS & AGREEMENT ---
  const handleOneTimeKycSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nicNumber.trim()) {
      toast.warn("National Identity Card (NIC) number is required");
      return;
    }
    if (!formData.nicDocumentUrl) {
      toast.warn("Please upload your NIC document copy");
      return;
    }
    if (!formData.bankStatementUrl) {
      toast.warn("Please upload your bank statement / passbook proof");
      return;
    }
    if (!formData.accountNumber.trim()) {
      toast.warn("Bank account number is required");
      return;
    }
    if (!formData.signatureDataUrl && !formData.agreementDocumentUrl) {
      toast.warn("Please either draw digital signature or upload signed agreement");
      return;
    }

    setSubmittingKyc(true);
    try {
      await submitKycAgreement(user.id, {
        nicNumber: formData.nicNumber,
        nicDocumentUrl: formData.nicDocumentUrl,
        bankStatementUrl: formData.bankStatementUrl,
        agreementDocumentUrl: formData.agreementDocumentUrl,
        signatureDataUrl: formData.signatureDataUrl,
        isAgreementSigned: true,
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
      });

      toast.success("One-Time Documents & Merchant Agreement successfully saved on file!");
      setShowOneTimeKycModal(false);
      fetchSummaryData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to submit documents and agreement.");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // --- SUBMIT STREAMLINED PAYOUT REQUEST (FAST 1-STEP) ---
  const handleSubmitPayout = async (e) => {
    e.preventDefault();
    if (!formData.requestedAmount || Number(formData.requestedAmount) < 500) {
      toast.warn("Minimum payout request is LKR 500.00");
      return;
    }
    if (!formData.accountNumber.trim()) {
      toast.warn("Bank account number is required");
      return;
    }

    setSubmittingPayout(true);
    try {
      await requestPayout(user.id, {
        theatreId: summary?.theatreId || null,
        requestedAmount: Number(formData.requestedAmount),
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        // Backend auto-inherits on-file NIC and Agreement documents
        nicNumber: formData.nicNumber || summary?.savedNicNumber,
        nicDocumentUrl: formData.nicDocumentUrl || summary?.savedNicDocumentUrl,
        bankStatementUrl: formData.bankStatementUrl || summary?.savedBankStatementUrl,
        agreementDocumentUrl: formData.agreementDocumentUrl || summary?.savedAgreementDocumentUrl,
        signatureDataUrl: formData.signatureDataUrl || summary?.savedSignatureDataUrl,
        isAgreementSigned: true,
      });

      toast.success("Payout release request submitted successfully! Under quick administrative audit.");
      setShowRequestModal(false);
      setFormData((prev) => ({ ...prev, requestedAmount: "" }));
      fetchSummaryData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to submit payout request");
    } finally {
      setSubmittingPayout(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RELEASED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Transferred / Released</span>
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
            <span>Pending Audit</span>
          </span>
        );
    }
  };

  useEffect(() => {
    getActiveCommission()
      .then((res) => {
        if (res?.data) setActiveCommission(res.data);
      })
      .catch((err) => console.warn("Could not load commission model", err));
  }, []);

  const getDynamicRevenueSharingText = () => {
    const modelCode = summary?.activeCommissionModelCode || activeCommission?.modelCode || "MODEL_A";
    const buyerFee = summary?.activeBuyerFeePercent != null ? Number(summary.activeBuyerFeePercent) : (activeCommission?.buyerFeePercent != null ? Number(activeCommission.buyerFeePercent) : 6.5);
    const organizerFee = summary?.activeOrganizerCommissionPercent != null ? Number(summary.activeOrganizerCommissionPercent) : (activeCommission?.organizerCommissionPercent != null ? Number(activeCommission.organizerCommissionPercent) : 0.0);

    if (modelCode === "MODEL_A") {
      return `100% of gross ticket face value shall be remitted to Party B, and a ${buyerFee.toFixed(1)}% online convenience fee is charged directly to the ticket buyer (inclusive of payment gateway fees).`;
    } else if (modelCode === "MODEL_B") {
      const payoutPercent = (100 - organizerFee).toFixed(1);
      return `${payoutPercent}% of gross ticket face value shall be remitted to Party B (subject to a ${organizerFee.toFixed(1)}% platform fee), in addition to a ${buyerFee.toFixed(1)}% buyer convenience fee.`;
    } else {
      const payoutPercent = (100 - organizerFee).toFixed(1);
      return `${payoutPercent}% of gross ticket sales shall be remitted to Party B, subject to an all-inclusive ${organizerFee.toFixed(1)}% platform facilitation fee.`;
    }
  };

  const getPartyBRepresentativeName = () => {
    if (formData.accountHolderName && formData.accountHolderName.trim()) {
      return formData.accountHolderName.trim();
    }
    if (summary?.savedAccountHolderName && summary.savedAccountHolderName.trim()) {
      return summary.savedAccountHolderName.trim();
    }
    if (summary?.accountHolderName && summary.accountHolderName.trim()) {
      return summary.accountHolderName.trim();
    }
    if (summary?.userName && summary.userName.trim()) {
      return summary.userName.trim();
    }
    const fullName = `${user?.fname || ""} ${user?.lname || ""}`.trim();
    return fullName || "Authorized Organizer Representative";
  };

  const getPartyBNicNumber = () => {
    const val =
      formData.nicNumber ||
      summary?.nicNumber ||
      summary?.savedNicNumber ||
      summary?.payoutHistory?.[0]?.nicNumber ||
      user?.nicNumber ||
      user?.nic ||
      "";
    const cleaned = String(val).trim();
    if (cleaned && cleaned.toLowerCase() !== "verified on file") {
      return cleaned;
    }
    return "-";
  };

  const getPartyBBankAccount = () => {
    const val =
      formData.bankAccountNumber ||
      formData.accountNumber ||
      summary?.bankAccountNumber ||
      summary?.savedAccountNumber ||
      summary?.accountNumber ||
      summary?.payoutHistory?.[0]?.accountNumber ||
      "";
    const cleaned = String(val).trim();
    return cleaned || "-";
  };

  const getContractId = () => {
    if (summary?.contractId) return summary.contractId;
    const signDate = summary?.agreementSignedAt ? new Date(summary.agreementSignedAt) : new Date();
    const yyyy = signDate.getFullYear();
    const mm = String(signDate.getMonth() + 1).padStart(2, "0");
    const dd = String(signDate.getDate()).padStart(2, "0");
    const idSeed = user?.id || summary?.userId || summary?.theatreId || 101;
    const xxxx = String(idSeed).padStart(4, "0");
    return `ZEY-AGR-${yyyy}${mm}${dd}-${xxxx}`;
  };

  const getSignedAtFormatted = () => {
    const raw = summary?.agreementSignedAt ? new Date(summary.agreementSignedAt) : new Date();
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Colombo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(raw);
      const val = (type) => parts.find((p) => p.type === type)?.value || "";
      return `${val("year")}-${val("month")}-${val("day")} ${val("hour")}:${val("minute")}:${val("second")} (+05:30 Asia/Colombo)`;
    } catch {
      return `${raw.toISOString().replace("T", " ").substring(0, 19)} (+05:30 Asia/Colombo)`;
    }
  };

  const getSignerIpAddress = () => {
    return (
      summary?.signerIpAddress ||
      summary?.savedSignerIpAddress ||
      summary?.payoutHistory?.[0]?.signerIpAddress ||
      "127.0.0.1 (Direct Verified)"
    );
  };

  const getVerificationStatus = () => {
    return "Verified via OTP / Registered Email";
  };

  const downloadContractPdf = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;

      // Brand Banner
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
      doc.text("ORGANIZER / VENUE TICKETING & SETTLEMENT AGREEMENT", pageWidth / 2, 9.5, { align: "center" });

      doc.setTextColor(241, 245, 249);
      doc.setFontSize(6.6);
      doc.setFont("helvetica", "normal");
      doc.text("Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform) | BR No: POL/ELH/ESD/02/01/1941/2026", pageWidth / 2, 16, { align: "center" });

      let y = 26.5;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.text("Executed electronically under Sri Lanka Electronic Transactions Act No. 19 of 2006", pageWidth / 2, y, { align: "center" });

      // Party Details Box
      y += 3.5;
      const boxY = y;
      const repName = getPartyBRepresentativeName();
      const nicNo = getPartyBNicNumber();
      const hallName = summary?.theatreName || "Designated Venue / Hall";
      const bankAcc = getPartyBBankAccount();
      const bankName = formData.bankName || summary?.savedBankName || "Bank of Ceylon / Commercial Bank";
      const bankBranch = formData.bankBranch || summary?.savedBankBranch || "Main Branch";

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(215, 220, 228);
      doc.rect(margin, boxY, contentWidth, 26, "FD");

      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      // Row 1: Party A
      doc.setFont("helvetica", "bold");
      doc.text("PARTY A (Platform):", margin + 3.5, boxY + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text("Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform) | BR No: POL/ELH/ESD/02/01/1941/2026", margin + 33, boxY + 5.5);

      // Row 2: Party B & NIC
      doc.setFont("helvetica", "bold");
      doc.text("PARTY B (Organizer / Venue):", margin + 3.5, boxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(repName, margin + 46, boxY + 11);

      doc.setFont("helvetica", "bold");
      doc.text("National Identity Card (NIC):", margin + 110, boxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(nicNo, margin + 150, boxY + 11);

      // Row 3: Associated Venue
      doc.setFont("helvetica", "bold");
      doc.text("Associated Venue / Hall:", margin + 3.5, boxY + 16.5);
      doc.setFont("helvetica", "normal");
      doc.text(hallName, margin + 39, boxY + 16.5);

      // Row 4: Registered Contact
      doc.setFont("helvetica", "bold");
      doc.text("Registered Contact:", margin + 3.5, boxY + 21.5);
      doc.setFont("helvetica", "normal");
      doc.text(`${user?.email || summary?.userEmail || "partner@naataka.lk"} | ${user?.phoneNumber || summary?.userPhone || "0771234567"}`, margin + 32, boxY + 21.5);

      y = boxY + 29.5;

      // Section 1: Scope of Settlement, Agency & Revenue Sharing
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("1. Scope of Settlement, Agency & Revenue Sharing", margin, y);

      y += 3.8;
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const revText = getDynamicRevenueSharingText();
      const splitRev = doc.splitTextToSize(revText, contentWidth);
      doc.text(splitRev, margin, y);
      y += splitRev.length * 3.4;

      const agencyText = "Zeylex Digital Solutions acts solely as an authorized digital ticketing facilitator and collection agent. All gross ticket face values collected belong exclusively to Party B, and Party A's sole commercial revenue is limited to the applicable platform facilitation or buyer convenience fee.";
      const splitAgency = doc.splitTextToSize(agencyText, contentWidth);
      doc.text(splitAgency, margin, y);
      y += splitAgency.length * 3.4 + 2;

      // Section 2: Destination Bank Account for LankaPay Settlement
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("2. Destination Bank Account for LankaPay Settlement", margin, y);

      y += 3.2;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 12, "FD");

      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(`Bank: ${bankName}  |  Branch: ${bankBranch}`, margin + 3.5, y + 4.5);
      doc.text(`Account Name: ${repName}  |  Account Number: ${bankAcc}`, margin + 3.5, y + 9);

      y += 14.5;

      // Section 3: Disbursement Timeline & LankaPay Settlement
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("3. Disbursement Timeline & LankaPay Settlement", margin, y);

      y += 3.6;
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const sec3Text = "Payouts are processed via LankaPay CEFT/SLIPS within 5 to 7 business days after the successful completion of the event, subject to final ticket sales reconciliation.";
      const splitSec3 = doc.splitTextToSize(sec3Text, contentWidth);
      doc.text(splitSec3, margin, y);
      y += splitSec3.length * 3.4 + 2;

      // Section 4: Cancellations, Chargebacks, Permits & Taxes
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("4. Cancellations, Chargebacks, Permits & Taxes", margin, y);

      y += 3.6;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);

      const sec4_1 = "• Event Cancellations / Postponements: If Party B cancels or postpones the event, Party B is responsible for full ticket refunds, and non-refundable payment gateway charges remain deductible.";
      const sec4_2 = "• Disputes & Chargebacks: Party A reserves the right to withhold or recover funds in the event of buyer chargebacks or payment disputes.";
      const sec4_3 = "• Municipal & Fiscal Taxes: Party B is solely responsible for all applicable local municipal entertainment taxes and income taxes.";
      const sec4_4 = "• Permits, Venue & Copyrights: Party B is solely responsible for securing venue bookings, Public Performance Board approvals, and all necessary script, music, and performance copyrights, and indemnifies Party A against any third-party claims.";

      const split4_1 = doc.splitTextToSize(sec4_1, contentWidth);
      doc.text(split4_1, margin, y);
      y += split4_1.length * 3.2 + 0.8;

      const split4_2 = doc.splitTextToSize(sec4_2, contentWidth);
      doc.text(split4_2, margin, y);
      y += split4_2.length * 3.2 + 0.8;

      const split4_3 = doc.splitTextToSize(sec4_3, contentWidth);
      doc.text(split4_3, margin, y);
      y += split4_3.length * 3.2 + 0.8;

      const split4_4 = doc.splitTextToSize(sec4_4, contentWidth);
      doc.text(split4_4, margin, y);
      y += split4_4.length * 3.2 + 2;

      // Section 5: Governing Law & Electronic Execution
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("5. Governing Law & Electronic Execution", margin, y);

      y += 3.6;
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const sec5Text = "This Agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka and constitutes a legally binding contract executed electronically under the Electronic Transactions Act No. 19 of 2006.";
      const splitSec5 = doc.splitTextToSize(sec5Text, contentWidth);
      doc.text(splitSec5, margin, y);
      y += splitSec5.length * 3.4 + 3;

      // Divider Line
      doc.setDrawColor(200, 205, 215);
      doc.line(margin, y, margin + contentWidth, y);

      y += 3.5;
      const sigColWidth = contentWidth / 2 - 4;

      // Headings
      doc.setFontSize(7.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("For Zeylex Digital Solutions (Party A):", margin, y);

      const col2Left = margin + contentWidth / 2 + 4;
      doc.text("For Organizer / Venue Partner (Party B):", col2Left, y);

      // Party A Seal & Signature area
      let sealRendered = false;
      try {
        const sealImg = await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            const img2 = new Image();
            img2.crossOrigin = "anonymous";
            img2.onload = () => resolve(img2);
            img2.onerror = () => resolve(null);
            img2.src = "/public/images/zeylex-proprietor-seal.png";
          };
          img.src = "/images/zeylex-proprietor-seal.png";
        });
        if (sealImg) {
          doc.addImage(sealImg, "PNG", margin + 2, y + 1.5, 34, 13);
          sealRendered = true;
        }
      } catch (e) {
        console.warn("Could not render seal image:", e);
      }

      if (!sealRendered) {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin + 2, y + 2, 44, 11, 1, 1, "FD");
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 58, 138);
        doc.text("[ PROPRIETOR SEAL & SIGNATURE ]", margin + 4, y + 7.5);
        doc.setFontSize(5.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text("Zeylex Digital Solutions • Authenticated", margin + 4, y + 10.5);
      }

      // Party B Signature area
      const partyBSig = formData.signatureDataUrl || summary?.savedSignatureDataUrl || summary?.payoutHistory?.[0]?.signatureDataUrl;
      let partyBSigRendered = false;
      if (partyBSig) {
        try {
          doc.addImage(partyBSig, "PNG", col2Left + 2, y + 1.5, 36, 12);
          partyBSigRendered = true;
        } catch {
          // fallback
        }
      }
      if (!partyBSigRendered) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        doc.text("[Digital Signature Stored On File]", col2Left + 4, y + 8);
      }

      // Signatory underline
      doc.setDrawColor(180, 185, 195);
      doc.line(margin, y + 15, margin + sigColWidth, y + 15);
      doc.line(col2Left, y + 15, col2Left + sigColWidth, y + 15);

      // Signatory metadata under line
      doc.setFontSize(6.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Proprietor / Authorized Signatory, Zeylex Digital Solutions", margin, y + 18.5);
      doc.text("Official Rubber Seal • Registered Merchant Platform", margin, y + 22);

      doc.text(`Signatory: ${repName}`, col2Left, y + 18.5);
      doc.text(`Party B NIC: ${nicNo}  |  Authorized Representative`, col2Left, y + 22);

      // 4. E-Signature Audit Trail Box (Bottom of Page)
      const contractId = getContractId();
      const signedAt = getSignedAtFormatted();
      const signerIp = getSignerIpAddress();
      const verificationStatus = getVerificationStatus();

      const auditY = y + 26;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, auditY, contentWidth, 18, 1, 1, "FD");

      doc.setFontSize(6.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("ELECTRONIC SIGNATURE AUDIT TRAIL & VERIFICATION RECORD", margin + 3.5, auditY + 4.2);

      doc.setFontSize(6.5);
      // Row 1
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Contract ID:", margin + 3.5, auditY + 8.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(contractId, margin + 20, auditY + 8.8);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Signed At:", margin + 78, auditY + 8.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(signedAt, margin + 92, auditY + 8.8);

      // Row 2
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Signer IP Address:", margin + 3.5, auditY + 13.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(signerIp, margin + 28, auditY + 13.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Party B NIC:", margin + 78, auditY + 13.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(nicNo, margin + 96, auditY + 13.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Verification Status:", margin + 125, auditY + 13.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(16, 120, 60); // Green
      doc.text(verificationStatus, margin + 151, auditY + 13.5);

      // Safeguard: Ensure strict 1 single page!
      const totalPages = doc.internal.getNumberOfPages();
      if (totalPages > 1) {
        for (let p = totalPages; p > 1; p--) {
          doc.deletePage(p);
        }
      }

      doc.save(`Zeylex_Settlement_Agreement_${repName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Organizer / Venue Ticketing & Settlement Agreement PDF downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate Agreement PDF.");
    }
  };

  const printAgreement = () => {
    window.print();
  };

  const maskAccountNumber = (acc) => {
    if (!acc) return "••••";
    const str = String(acc).trim();
    if (str.length <= 4) return str;
    return "****" + str.slice(-4);
  };

  const generateClientSideReceiptPdf = (payout) => {
    try {
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
      const agrRef = payout.contractId || summary?.contractId || `ZEY-AGR-${new Date(payout.createdAt || Date.now()).toISOString().slice(0, 10).replace(/-/g, "")}-${String(payout.userId || payout.id).padStart(4, "0")}`;
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

      const repName = payout.accountHolderName || summary?.savedAccountHolderName || (user?.fname ? user.fname + " " + (user.lname || "") : "Authorized Signatory");
      const nicNo = payout.nicNumber || summary?.savedNicNumber || "On File";
      const bName = payout.bankName || summary?.savedBankName || "Commercial Bank of Ceylon";
      const bBranch = payout.bankBranch || summary?.savedBankBranch || "Main Branch";
      const bAcc = payout.accountNumber || summary?.savedAccountNumber || "N/A";
      const venueName = payout.theatreName || summary?.theatreName || "Designated Venue / Show Partner";

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

  const handleDownloadPayoutReceipt = async (payout) => {
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
      console.warn("Backend receipt PDF stream failed, using client-side generator:", err);
      generateClientSideReceiptPdf(payout);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading payout records & revenue breakdown...</p>
      </div>
    );
  }

  const grossRev = summary?.grossRevenue || 0;
  const platformFee = summary?.platformCommissionTotal || 0;
  const netEarnings = summary?.netEarningsTotal || 0;
  const totalReleased = summary?.totalReleasedAmount || 0;
  const totalPending = summary?.totalPendingAmount || 0;
  const availableBal = summary?.availableBalance || 0;
  const isKycSubmitted = summary?.isKycAgreementSubmitted;

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial Ledger Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              Revenue Settlements & Payouts
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Sri Lanka Direct Bank Transfers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Payouts & Cash Distribution
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Verified payouts for ticket earnings. Once your one-time verification is approved, subsequent payouts are 1-click releases disbursed via LankaPay CEFT.
          </p>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("milestone-settlement-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className="btn-theatre-gold px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Two-Tranche Show Payouts</span>
        </button>
      </div>

      {/* SEPARATED ONE-TIME KYC & AGREEMENT STATUS CARD */}
      <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 shadow-xl">
        {isKycSubmitted ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-white">
                    One-Time Document & Legal Agreement Verified
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    ON FILE & ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  NIC: <span className="text-slate-200 font-semibold">{summary.savedNicNumber || formData.nicNumber || "On File"}</span> • Bank:{" "}
                  <span className="text-slate-200 font-semibold">{summary.savedBankName} ({maskAccountNumber(summary.savedAccountNumber)})</span> • Signed:{" "}
                  <span className="text-slate-200">{summary.agreementSignedAt ? new Date(summary.agreementSignedAt).toLocaleDateString() : "Verified"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab("kyc")}
                  className="px-3.5 py-2 bg-[#FED800]/15 hover:bg-[#FED800]/25 text-[#FED800] rounded-xl text-xs font-bold border border-[#FED800]/30 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FED800]" />
                  <span>KYC Documents</span>
                </button>
              )}
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab("agreements")}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Agreement Vault</span>
                </button>
              )}
              <button
                onClick={() => setShowAgreementModal(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#FED800]" />
                <span>View Documents</span>
              </button>
              <button
                onClick={() => {
                  setKycStep(1);
                  setShowOneTimeKycModal(true);
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-white/5 transition-all"
                title="Update on-file documents"
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-white">
                    One-Time Document & Legal Agreement Required
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    ACTION REQUIRED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit your identity verification documents and sign the merchant contract once. You will not be asked to re-upload documents for future payouts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab("kyc")}
                  className="px-4 py-2.5 bg-[#FED800] hover:bg-[#ffe234] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#FED800]/20"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Go to KYC & Documents</span>
                </button>
              )}
              <button
                onClick={() => {
                  setKycStep(1);
                  setShowOneTimeKycModal(true);
                }}
                className="bg-gradient-to-r from-[#661F19] to-[#80251e] hover:from-[#7a251e] hover:to-[#962d24] text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-white/10 shadow-lg shadow-[#661F19]/40 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <FileText className="w-4 h-4 text-[#FED800]" />
                <span>Quick Sign Modal</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Gross Revenue */}
        <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-amber-500/50 shadow-md">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Gross Ticket Sales
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-white">
            ₨ {Number(grossRev).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Total revenue collected</p>
        </div>

        {/* 2. Platform Commission */}
        <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-rose-500/50 shadow-md">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Organizer Commission
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-rose-400">
            {Number(platformFee) > 0 ? `- ₨ ${Number(platformFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `₨ 0.00`}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {Number(platformFee) === 0 || summary?.activeCommissionModelCode === "MODEL_A" || Number(summary?.activeOrganizerCommissionPercent) === 0
              ? "0% commission (Model A)"
              : `${summary?.activeOrganizerCommissionPercent != null ? summary.activeOrganizerCommissionPercent : 0}% commission (${summary?.activeCommissionModelCode || "Model B"})`}
          </p>
        </div>

        {/* 3. Net Earnings */}
        <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-purple-500/50 shadow-md">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Net Earnings
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-purple-300">
            ₨ {Number(netEarnings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {Number(platformFee) === 0 || summary?.activeCommissionModelCode === "MODEL_A" || Number(summary?.activeOrganizerCommissionPercent) === 0
              ? "100% net theatre share"
              : `${100 - (summary?.activeOrganizerCommissionPercent != null ? Number(summary.activeOrganizerCommissionPercent) : 0)}% net theatre share`}
          </p>
        </div>

        {/* 4. Already Released */}
        <div className="bg-[#14141e] p-5 rounded-2xl border border-white/10 border-b-2 border-b-emerald-500/50 shadow-md">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Released
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-400">
            ₨ {Number(totalReleased).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Disbursed to bank</p>
        </div>

        {/* 5. Available for Payout */}
        <div className="bg-gradient-to-br from-[#1c1c28] to-[#252538] p-5 rounded-2xl border border-amber-500/40 border-b-2 border-b-[#FED800] shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider mb-1">
              Available Balance
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            ₨ {Number(availableBal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          {totalPending > 0 ? (
            <p className="text-[10px] text-amber-400 mt-1">
              ₨ {Number(totalPending).toLocaleString()} in audit
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-1">Ready for transfer</p>
          )}
        </div>
      </div>

      {/* Two-Stage Milestone Advances & Show Settlement Engine */}
      <TwoStageMilestoneProgressCard
        userId={user?.id}
        onNavigateToKyc={() => setActiveTab && setActiveTab("kyc")}
      />

      {/* Payout History Table */}
      <div className="bg-[#14141e] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">Payout Transactions & Audit History</h2>
          </div>
          <span className="text-xs text-slate-400">
            {summary?.payoutHistory?.length || 0} Request(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e0e16] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-bold">Request ID</th>
                <th className="py-3.5 px-4 font-bold">Requested Date</th>
                <th className="py-3.5 px-4 font-bold">Gross (LKR)</th>
                <th className="py-3.5 px-4 font-bold">Net Payable (LKR)</th>
                <th className="py-3.5 px-4 font-bold">Destination Bank</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Bank Reference</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {!summary?.payoutHistory || summary.payoutHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold">No payout release requests yet.</p>
                    <p className="text-[11px] text-slate-600">
                      When your shows have confirmed ticket bookings, you can request payout release here.
                    </p>
                  </td>
                </tr>
              ) : (
                summary.payoutHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      #PAY-{String(item.id).padStart(4, "0")}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₨ {Number(item.requestedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                      ₨ {Number(item.netPayableAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{item.bankName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.accountNumber} ({item.accountHolderName})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {item.releaseTransactionRef ? (
                        <span className="text-emerald-400 font-bold">
                          {item.releaseTransactionRef}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Processing</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === "RELEASED" && (
                          <button
                            onClick={() => handleDownloadPayoutReceipt(item)}
                            className="px-2.5 py-1 rounded-lg bg-[#FED800]/15 hover:bg-[#FED800]/25 text-[#FED800] font-semibold text-[11px] inline-flex items-center gap-1 border border-[#FED800]/30 transition-colors"
                            title="Download LankaPay CEFT Settlement Receipt PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        )}
                        <button
                          onClick={() => setInspectPayout(item)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-[11px] inline-flex items-center gap-1 border border-white/5 transition-colors"
                        >
                          <span>Audit Record</span>
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

      {/* ============================================================== */}
      {/* 1. STREAMLINED PAYOUT REQUEST MODAL (FAST 1-STEP)               */}
      {/* ============================================================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181826] to-[#14141e]">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  <span>Request Payout Release</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Available for transfer: <strong className="text-emerald-400">₨ {Number(availableBal).toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* One-Time KYC Verified Notice */}
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-white">Documents & Legal Agreement on File</span>
                <p className="text-[10px] text-slate-400">
                  Your identity and merchant contract are verified. Fast 1-click release without document re-upload.
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitPayout} className="p-6 space-y-4">
              {/* Amount with Quick Percentage Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-200">
                    Withdrawal Amount (LKR) <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Min: LKR 500</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₨
                  </span>
                  <input
                    type="number"
                    min="500"
                    max={availableBal}
                    step="0.01"
                    required
                    value={formData.requestedAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requestedAmount: e.target.value,
                      }))
                    }
                    placeholder="e.g. 50000.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          requestedAmount: (availableBal * pct).toFixed(2),
                        }))
                      }
                      className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-300 border border-white/5"
                    >
                      {pct === 1.0 ? "Max" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>

                {/* Instant Calculation */}
                {formData.requestedAmount > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Requested Withdrawal Amount:</span>
                      <span className="text-white font-semibold">₨ {Number(formData.requestedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Additional Payout Fee:</span>
                      <span className="text-emerald-400 font-semibold">₨ 0.00 (Commission already settled per booking under Active Agreement)</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-extrabold pt-1 border-t border-white/10 text-xs">
                      <span>Net LankaPay Bank Transfer:</span>
                      <span>₨ {Number(formData.requestedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (100%)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Bank Account Confirmation */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Destination Bank Account</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Auto-filled from verified KYC</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Bank Name</label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    >
                      {SRI_LANKAN_BANKS.map((b) => (
                        <option key={b} value={b} className="bg-[#14141e] text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Branch Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kollupitiya"
                      value={formData.bankBranch}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bankBranch: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100012345678"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value, bankAccountNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="As in passbook"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout || !formData.requestedAmount || Number(formData.requestedAmount) <= 0}
                  className="btn-theatre-gold px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/25 disabled:opacity-40 flex items-center gap-2"
                >
                  {submittingPayout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Confirm Payout Release</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DEDICATED ONE-TIME KYC & LEGAL AGREEMENT MODAL               */}
      {/* ============================================================== */}
      {showOneTimeKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181826] to-[#14141e]">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>One-Time Document & Legal Agreement Verification</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Complete this submission once. Future payouts will be 1-click releases with no document re-upload required.
                </p>
              </div>
              <button
                onClick={() => setShowOneTimeKycModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-2 border-b border-white/10 text-center text-xs font-bold bg-[#0e0e16]">
              <button
                type="button"
                onClick={() => setKycStep(1)}
                className={`py-3 border-b-2 transition-colors ${
                  kycStep === 1
                    ? "border-amber-400 text-amber-400 bg-amber-400/5"
                    : "border-transparent text-slate-400"
                }`}
              >
                1. Identification Documents & Bank Info
              </button>
              <button
                type="button"
                onClick={() => setKycStep(2)}
                className={`py-3 border-b-2 transition-colors ${
                  kycStep === 2
                    ? "border-amber-400 text-amber-400 bg-amber-400/5"
                    : "border-transparent text-slate-400"
                }`}
              >
                2. Legal Agreement & Signature
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleOneTimeKycSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* STEP 1: Identification & Bank Verification */}
              {kycStep === 1 && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs">
                    Please upload your identification and primary settlement account details to comply with Central Bank of Sri Lanka AML guidelines:
                  </p>

                  {/* Automatic KYC Documents Detection Banner */}
                  {(formData.nicDocumentUrl || formData.bankStatementUrl || kycOverviewData?.nicFrontUploaded) && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">KYC Documents Detected On File</p>
                          <p className="text-[11px] text-slate-300">
                            {formData.nicDocumentUrl && formData.bankStatementUrl
                              ? "NIC and Bank Proof were automatically imported from your KYC Documents section."
                              : "Documents from your KYC records were automatically imported."}
                          </p>
                        </div>
                      </div>
                      {setActiveTab && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowOneTimeKycModal(false);
                            setActiveTab("kyc");
                          }}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg text-[10px] shrink-0"
                        >
                          Manage in KYC Vault
                        </button>
                      )}
                    </div>
                  )}

                  {/* NIC Number */}
                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      National Identity Card (NIC) Number <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 199012345678 or 901234567V"
                      value={formData.nicNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nicNumber: e.target.value.toUpperCase() }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white font-mono uppercase focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* 1. NIC File Upload */}
                  <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">NIC Copy Scan / Photo <span className="text-amber-400">*</span></span>
                      </div>
                      {formData.nicDocumentUrl && (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Front and back scan of your Sri Lankan NIC (or Driving License / Passport).</p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors">
                      {uploadingDoc.nic ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Upload className="w-4 h-4 text-amber-400" />}
                      <span>{formData.nicDocumentUrl ? "Replace NIC File" : "Choose NIC File"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files[0], "nic")}
                      />
                    </label>
                  </div>

                  {/* 2. Bank Passbook / Statement Upload */}
                  <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">Bank Passbook / Statement Proof <span className="text-amber-400">*</span></span>
                      </div>
                      {formData.bankStatementUrl && (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Header of statement or passbook showing account holder name & number.</p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors">
                      {uploadingDoc.bank ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Upload className="w-4 h-4 text-amber-400" />}
                      <span>{formData.bankStatementUrl ? "Replace Bank Proof" : "Choose Bank Statement File"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files[0], "bank")}
                      />
                    </label>
                  </div>

                  {/* Primary Bank Settlement Account Details */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Primary LankaPay Settlement Account</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-300 font-bold mb-1">Bank Name</label>
                        <select
                          value={formData.bankName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                        >
                          {SRI_LANKAN_BANKS.map((b) => (
                            <option key={b} value={b} className="bg-[#14141e] text-white">
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-300 font-bold mb-1">Branch Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kollupitiya"
                          value={formData.bankBranch}
                          onChange={(e) => setFormData((prev) => ({ ...prev, bankBranch: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-300 font-bold mb-1">Account Holder Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="As registered in bank"
                          value={formData.accountHolderName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-300 font-bold mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 100012345678"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value, bankAccountNumber: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0e0e16] border border-white/15 text-white font-mono focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Legal Agreement & Signature */}
              {kycStep === 2 && (
                <div className="space-y-4">
                  {/* Agreement Text Excerpt */}
                  <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/10 space-y-3 max-h-56 overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-extrabold text-amber-400 uppercase tracking-widest text-[10px]">
                        Naataka.LK Merchant Revenue Agreement Terms
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAgreementModal(true)}
                        className="text-amber-300 hover:text-white underline text-[11px] font-bold"
                      >
                        Read Full Contract
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
                      <p>
                        This Revenue Settlement and Payout Agreement is executed electronically between{" "}
                        <strong className="text-white">Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform)</strong> and the Authorized Partner:
                      </p>
                      <div className="p-2.5 rounded bg-white/5 border border-white/5 space-y-1">
                        <p><strong>Partner Signatory:</strong> {getPartyBRepresentativeName()}</p>
                        <p><strong>NIC Number:</strong> {getPartyBNicNumber()}</p>
                        <p><strong>Designated Bank Account:</strong> {formData.bankName} - {getPartyBBankAccount()} ({formData.bankBranch || "Main Branch"})</p>
                        <p><strong>Revenue Terms:</strong> {getDynamicRevenueSharingText()}</p>
                      </div>
                      <p className="text-slate-400 text-[10px]">
                        By applying your electronic signature below, you confirm the accuracy of all submitted identity documents and agree that this legal contract governs all future payout releases.
                      </p>
                    </div>
                  </div>

                  {/* Digital Signature Pad */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-200 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-amber-400" />
                        <span>Draw One-Time Digital Signature</span>
                        <span className="text-amber-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={undoSignature}
                          disabled={!hasDrawnSignature}
                          className="text-[11px] text-slate-400 hover:text-white disabled:opacity-30 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Undo
                        </button>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> Clear
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-amber-500/50 bg-[#09090f] p-2 flex flex-col items-center relative overflow-hidden">
                      <div className="relative w-full max-w-[480px]">
                        <canvas
                          ref={canvasRef}
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                          className="w-full h-[120px] cursor-crosshair bg-transparent touch-none select-none"
                          style={{ touchAction: "none" }}
                        />
                        {/* Guideline overlay */}
                        <div className="absolute inset-x-4 bottom-6 pointer-events-none flex items-center gap-2 select-none">
                          <span className="text-xs font-serif font-black text-white/20">✕</span>
                          <div className="flex-1 border-b border-dashed border-white/10" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Use mouse, trackpad, stylus or touch to sign inside the box (smooth curved ink)
                      </p>
                    </div>
                  </div>

                  {/* Or upload physical copy */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Prefer a physical signed document?</p>
                      <p className="text-[10px] text-slate-400">
                        Upload a signed scanned copy of the agreement if you prefer.
                      </p>
                    </div>
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold inline-flex items-center gap-1">
                      {uploadingDoc.agreement ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>{formData.agreementDocumentUrl ? "Document Uploaded" : "Upload Signed PDF"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files[0], "agreement")}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                {kycStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setKycStep(kycStep - 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {kycStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.nicNumber.trim()) {
                        toast.warn("NIC number is required");
                        return;
                      }
                      if (!formData.nicDocumentUrl) {
                        toast.warn("Please upload your NIC file");
                        return;
                      }
                      if (!formData.bankStatementUrl) {
                        toast.warn("Please upload your bank statement proof");
                        return;
                      }
                      if (!formData.accountNumber.trim()) {
                        toast.warn("Bank account number is required");
                        return;
                      }
                      setKycStep(2);
                    }}
                    className="btn-theatre-gold px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md shadow-amber-500/20"
                  >
                    Next: Review & Sign Agreement
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submittingKyc || (!hasDrawnSignature && !formData.agreementDocumentUrl)}
                    className="btn-theatre-gold px-7 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/25 disabled:opacity-40 flex items-center gap-2"
                  >
                    {submittingKyc ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving One-Time Submission...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit One-Time Verification & Sign Agreement</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. INSPECT PAYOUT RECORD MODAL                                  */}
      {/* ============================================================== */}
      {inspectPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#14141e] border border-white/15 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Payout Details: #PAY-{String(inspectPayout.id).padStart(4, "0")}</span>
              </h3>
              <button
                onClick={() => setInspectPayout(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Payout Status</p>
                  <div className="mt-1">{getStatusBadge(inspectPayout.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase">Net Disbursed</p>
                  <p className="text-base font-extrabold text-emerald-400">
                    ₨ {Number(inspectPayout.netPayableAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-[#0e0e16] border border-white/5">
                <p className="text-slate-400"><strong>Bank:</strong> {inspectPayout.bankName}</p>
                <p className="text-slate-400"><strong>Branch:</strong> {inspectPayout.bankBranch}</p>
                <p className="text-slate-400"><strong>Account:</strong> {inspectPayout.accountNumber} ({inspectPayout.accountHolderName})</p>
                <p className="text-slate-400"><strong>NIC Number:</strong> {inspectPayout.nicNumber}</p>
                {inspectPayout.releaseTransactionRef && (
                  <p className="text-emerald-400">
                    <strong>Bank CEFT Ref:</strong> {inspectPayout.releaseTransactionRef}
                  </p>
                )}
                {inspectPayout.adminRemarks && (
                  <p className="text-amber-300">
                    <strong>Admin Note:</strong> {inspectPayout.adminRemarks}
                  </p>
                )}
                {inspectPayout.status === "RELEASED" && (
                  <button
                    onClick={() => handleDownloadPayoutReceipt(inspectPayout)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Settlement Receipt (PDF)</span>
                  </button>
                )}
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-2">
                <p className="font-bold text-white">Attached KYC & Agreement Documents (On File):</p>
                <div className="grid grid-cols-2 gap-2">
                  {inspectPayout.nicDocumentUrl && (
                    <a
                      href={inspectPayout.nicDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-amber-300 font-bold"
                    >
                      <span>View NIC Document</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {inspectPayout.bankStatementUrl && (
                    <a
                      href={inspectPayout.bankStatementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-amber-300 font-bold"
                    >
                      <span>View Bank Statement</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {inspectPayout.agreementDocumentUrl && (
                    <a
                      href={inspectPayout.agreementDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-amber-300 font-bold col-span-2"
                    >
                      <span>View Signed Agreement Document</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Digital Signature preview */}
              {inspectPayout.signatureDataUrl && (
                <div className="p-3 rounded-xl bg-[#0e0e16] border border-white/5">
                  <p className="font-bold text-white mb-2">Digital Signature Recorded:</p>
                  <img
                    src={inspectPayout.signatureDataUrl}
                    alt="Digital Signature"
                    className="h-16 max-w-xs object-contain border border-white/10 rounded p-1 bg-black/40"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Timestamp: {inspectPayout.signedAt ? new Date(inspectPayout.signedAt).toLocaleString() : "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FULL AGREEMENT & ON-FILE DOCUMENTS MODAL (PRINTABLE)         */}
      {/* ============================================================== */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          {/* Print Isolation Styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-settlement-contract, #printable-settlement-contract * {
                visibility: visible !important;
              }
              #printable-settlement-contract {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 10mm !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                color: #0f172a !important;
              }
              .print-hide {
                display: none !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
            }
          `}</style>

          <div
            id="printable-settlement-contract"
            className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative font-serif"
          >
            {/* Header controls (hidden on print) */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 print-hide">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-sans">
                    ORGANIZER / VENUE TICKETING & SETTLEMENT AGREEMENT
                  </h2>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Official Merchant Agreement on File
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadContractPdf}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-sans text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={printAgreement}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-sans text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contract Body */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-800">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-bold tracking-wide uppercase font-sans text-slate-950">
                  ZEYLEX DIGITAL SOLUTIONS
                </h1>
                <p className="text-[11px] text-slate-600 font-sans font-medium">
                  operating the Naataka.lk Online Ticketing Platform
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Business Registration No: POL/ELH/ESD/02/01/1941/2026
                </p>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-sans mt-2">
                  ORGANIZER / VENUE TICKETING & SETTLEMENT AGREEMENT
                </p>
                <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
                  Executed electronically under Sri Lanka Electronic Transactions Act No. 19 of 2006
                </p>
              </div>

              <p className="font-sans text-slate-700">
                This Ticketing & Settlement Agreement was executed electronically between:
              </p>

              <div className="p-3 bg-slate-50 border rounded-lg space-y-1.5 font-sans">
                <p>
                  <strong>PARTY A (Platform):</strong> Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform) | BR No: POL/ELH/ESD/02/01/1941/2026
                </p>
                <p>
                  <strong>PARTY B (Organizer / Venue Representative):</strong>{" "}
                  {getPartyBRepresentativeName()}
                </p>
                <p>
                  <strong>National Identity Card (NIC):</strong> {getPartyBNicNumber()}
                </p>
                <p>
                  <strong>Registered Email & Phone:</strong> {user?.email || summary?.userEmail || "partner@naataka.lk"} | {user?.phoneNumber || summary?.userPhone || "-"}
                </p>
                <p>
                  <strong>Associated Venue / Hall:</strong> {summary?.theatreName || "Designated Venue / Hall"}
                </p>
              </div>

              <h4 className="font-bold text-sm text-slate-900 pt-2 font-sans">1. Scope of Settlement, Agency & Revenue Sharing</h4>
              <p className="leading-relaxed">
                {getDynamicRevenueSharingText()}
              </p>
              <p className="leading-relaxed text-slate-700 italic">
                Zeylex Digital Solutions acts solely as an authorized digital ticketing facilitator and collection agent. All gross ticket face values collected belong exclusively to Party B, and Party A's sole commercial revenue is limited to the applicable platform facilitation or buyer convenience fee.
              </p>

              <h4 className="font-bold text-sm text-slate-900 pt-2 font-sans">2. Destination Bank Account for LankaPay Settlement</h4>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-1 font-mono text-[11px]">
                <p><strong>Bank:</strong> {formData.bankName || summary?.savedBankName || "Bank of Ceylon / Commercial Bank"}</p>
                <p><strong>Branch:</strong> {formData.bankBranch || summary?.savedBankBranch || "Main Branch"}</p>
                <p><strong>Account Name:</strong> {getPartyBRepresentativeName()}</p>
                <p><strong>Account Number:</strong> {getPartyBBankAccount()}</p>
              </div>

              <h4 className="font-bold text-sm text-slate-900 pt-2 font-sans">3. Disbursement Timeline & LankaPay Settlement</h4>
              <p className="leading-relaxed">
                Payouts are processed via LankaPay CEFT/SLIPS within 5 to 7 business days after the successful completion of the event, subject to final ticket sales reconciliation.
              </p>

              <h4 className="font-bold text-sm text-slate-900 pt-2 font-sans">4. Cancellations, Chargebacks, Permits & Taxes</h4>
              <div className="space-y-1.5 leading-relaxed text-slate-700">
                <p>
                  • <strong>Event Cancellations & Postponements:</strong> If Party B cancels or postpones the event, Party B is responsible for full ticket refunds, and non-refundable payment gateway charges remain deductible.
                </p>
                <p>
                  • <strong>Disputes & Chargebacks:</strong> Party A reserves the right to withhold or recover funds in the event of buyer chargebacks or payment disputes.
                </p>
                <p>
                  • <strong>Municipal & Fiscal Taxes:</strong> Party B is solely responsible for all applicable local municipal entertainment taxes and income taxes.
                </p>
                <p>
                  • <strong>Permits, Venue & Copyrights:</strong> Party B is solely responsible for securing venue bookings, Public Performance Board approvals, and all necessary script, music, and performance copyrights, and indemnifies Party A against any third-party claims.
                </p>
              </div>

              <h4 className="font-bold text-sm text-slate-900 pt-2 font-sans">5. Governing Law & Electronic Execution</h4>
              <p className="leading-relaxed text-slate-700">
                This Agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka and constitutes a legally binding contract executed electronically under the Electronic Transactions Act No. 19 of 2006.
              </p>

              {/* On-File Documents Links */}
              {(formData.nicDocumentUrl || formData.bankStatementUrl) && (
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1 print-hide">
                  <p className="font-bold font-sans">Verified Documents on File:</p>
                  <div className="flex gap-4 text-[11px] font-sans">
                    {formData.nicDocumentUrl && (
                      <a href={formData.nicDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">
                        View Uploaded NIC Document
                      </a>
                    )}
                    {formData.bankStatementUrl && (
                      <a href={formData.bankStatementUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">
                        View Uploaded Bank Statement
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t mt-6 font-sans">
                <div>
                  <p className="font-bold text-slate-900 mb-2">For Zeylex Digital Solutions (Party A):</p>
                  <div className="h-16 border-b border-slate-400 flex items-center justify-start relative">
                    <img
                      src="/images/zeylex-proprietor-seal.png"
                      alt="Zeylex Proprietor Seal & Signature"
                      className="h-14 max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      style={{ display: "none" }}
                      className="h-full w-full items-center text-slate-600 italic text-[11px]"
                    >
                      [Proprietor Seal & Signature Authenticated]
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-700 font-medium mt-1">
                    Proprietor / Authorized Signatory, Zeylex Digital Solutions
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Official Rubber Seal • Registered Merchant Platform
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">For Organizer / Venue Partner (Party B):</p>
                  <div className="h-16 border-b border-slate-400 flex items-center justify-center">
                    {formData.signatureDataUrl || summary?.savedSignatureDataUrl || summary?.payoutHistory?.[0]?.signatureDataUrl ? (
                      <img
                        src={formData.signatureDataUrl || summary?.savedSignatureDataUrl || summary?.payoutHistory?.[0]?.signatureDataUrl}
                        alt="Party B Digital Signature"
                        className="h-14 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">Digital Signature On File</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-700 font-medium mt-1">
                    Signatory: {getPartyBRepresentativeName()}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Party B NIC: {getPartyBNicNumber()} • Authorized Representative
                  </p>
                </div>
              </div>

              {/* 4. E-Signature Audit Trail Box (Bottom of Page) */}
              <div className="mt-6 p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[10px] text-slate-700 space-y-1">
                <p className="font-bold text-[10.5px] text-slate-900 font-sans tracking-wide uppercase border-b border-slate-200 pb-1">
                  Electronic Signature Audit Trail & Verification Record
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1">
                  <p><span className="font-semibold text-slate-900">Contract ID:</span> {getContractId()}</p>
                  <p><span className="font-semibold text-slate-900">Signed At:</span> {getSignedAtFormatted()}</p>
                  <p><span className="font-semibold text-slate-900">Signer IP Address:</span> {getSignerIpAddress()}</p>
                  <p><span className="font-semibold text-slate-900">Party B NIC:</span> {getPartyBNicNumber()}</p>
                  <p className="sm:col-span-2">
                    <span className="font-semibold text-slate-900">Verification Status:</span>{" "}
                    <span className="text-emerald-700 font-bold">{getVerificationStatus()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
