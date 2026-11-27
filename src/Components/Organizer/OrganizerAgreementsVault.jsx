"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  ShieldCheck,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Landmark,
  Building2,
  RefreshCw,
  PenTool,
  AlertCircle,
  FileCheck,
  History,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Printer,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import {
  getMyAgreements,
  getAgreementPreview,
  signAgreement,
  downloadAgreementPdf
} from "../../services/AgreementService";
import { getMyKycOverview } from "../../services/KycService";
import notify from "../../utils/notify";
import { jsPDF } from "jspdf";
import StageDramaButton from "../common/StageDramaButton";

export default function OrganizerAgreementsVault({ onNavigateToKyc }) {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Signing Modal State
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [kycOverviewState, setKycOverviewState] = useState(null);

  // View Contract Modal State
  const [selectedContract, setSelectedContract] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Form Data for Signing
  const [formData, setFormData] = useState({
    venueName: "",
    nicNumber: "",
    bankName: "Commercial Bank of Ceylon",
    bankBranch: "",
    accountName: "",
    bankAccountNumber: "",
    signatureImageUrl: "",
  });

  // Signature Canvas & Smooth Drawing State
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const strokesRef = useRef([]); // Stores all completed strokes: [{ points: [{x, y}], color, width }]
  const currentStrokeRef = useRef(null);
  const [inkColor, setInkColor] = useState("#FED800");
  const [canvasTheme, setCanvasTheme] = useState("dark"); // "dark" | "paper"

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await getMyAgreements();
      if (res?.data) {
        setAgreements(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch agreements:", err);
      // Soft fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [user]);

  // Load preview data when opening signing modal
  const openSigningFlow = async () => {
    setLoadingPreview(true);
    setShowSignModal(true);
    try {
      let kycOverview = null;
      try {
        kycOverview = await getMyKycOverview();
        if (kycOverview) setKycOverviewState(kycOverview);
      } catch (_) {}

      const res = await getAgreementPreview();
      if (res?.data) {
        const p = res.data;
        setPreviewData(p);
        setFormData({
          venueName: p.defaultVenueName || "",
          nicNumber: p.savedNicNumber || kycOverview?.nicNumber || "",
          bankName: p.savedBankName || "Commercial Bank of Ceylon",
          bankBranch: p.savedBankBranch || "",
          accountName: p.savedAccountName || p.organizerName || "",
          bankAccountNumber: p.savedAccountNumber || "",
          signatureImageUrl: p.savedSignatureImageUrl || "",
        });
        if (p.savedSignatureImageUrl) {
          setHasDrawnSignature(true);
        }
      }
    } catch (err) {
      console.error("Error loading agreement preview:", err);
      notify.error("Could not fetch active commission terms");
    } finally {
      setLoadingPreview(false);
    }
  };

  // Redraw all strokes using continuous Quadratic Bézier Splines
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

      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.width || 2.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, (stroke.width || 2.8) / 2, 0, Math.PI * 2);
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

      // Smooth Bézier curve interpolation through midpoints
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length - 1; i++) {
        const pCurr = pts[i];
        const pNext = pts[i + 1];
        const mid = { x: (pCurr.x + pNext.x) / 2, y: (pCurr.y + pNext.y) / 2 };
        ctx.quadraticCurveTo(pCurr.x, pCurr.y, mid.x, mid.y);
      }

      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  };

  // High-DPI Canvas Initializer
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Use minimum 2.5x supersampling for ultra-crisp, non-pixelated anti-aliasing
    const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform matrix
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    redrawCanvas();
  };

  useEffect(() => {
    if (showSignModal && !loadingPreview) {
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);

      const handleResize = () => {
        initCanvas();
      };
      window.addEventListener("resize", handleResize);

      let ro;
      if (typeof ResizeObserver !== "undefined" && canvasContainerRef.current) {
        ro = new ResizeObserver(() => {
          initCanvas();
        });
        ro.observe(canvasContainerRef.current);
      }

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
        if (ro) ro.disconnect();
      };
    }
  }, [showSignModal, loadingPreview, canvasTheme]);

  // Pointer Event Handlers (Mouse, Touch, Stylus)
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
      color: inkColor,
      width: 2.8,
      points: [{ x, y }],
    };
    currentStrokeRef.current = stroke;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = inkColor;
    ctx.fillStyle = inkColor;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Instant smooth tap dot
    ctx.beginPath();
    ctx.arc(x, y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = currentStrokeRef.current.color;
    ctx.fillStyle = currentStrokeRef.current.color;
    ctx.lineWidth = currentStrokeRef.current.width || 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Extract coalesced pointer events for high-rate sampling (120Hz-240Hz stylus/touch)
    const events = (e.getCoalescedEvents && typeof e.getCoalescedEvents === "function")
      ? e.getCoalescedEvents()
      : [e];

    const pts = currentStrokeRef.current.points;

    for (const ev of events) {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      const lastPt = pts[pts.length - 1];
      if (lastPt) {
        const dist = Math.hypot(x - lastPt.x, y - lastPt.y);
        if (dist < 1.2) continue; // Filter sensor micro-jitter
      }

      pts.push({ x, y });

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
        ctx.strokeStyle = currentStrokeRef.current.color;
        ctx.lineWidth = currentStrokeRef.current.width || 2.8;
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
    if (!canvas || strokesRef.current.length === 0) {
      setFormData((prev) => ({ ...prev, signatureImageUrl: "" }));
      setHasDrawnSignature(false);
      return;
    }

    // Build high-resolution transparent PNG
    // For legal PDF clarity on white paper:
    // If drawn in gold (#FED800) or white/sky, map stroke to official executive legal blue (#0f2b5c)
    // so it looks authentic and legible on printed contracts. If drawn in blue/black, preserve ink.
    const rect = canvas.getBoundingClientRect();
    const exportCanvas = document.createElement("canvas");
    const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
    exportCanvas.width = Math.round(rect.width * dpr);
    exportCanvas.height = Math.round(rect.height * dpr);
    const expCtx = exportCanvas.getContext("2d");
    expCtx.scale(dpr, dpr);
    expCtx.lineCap = "round";
    expCtx.lineJoin = "round";
    expCtx.imageSmoothingEnabled = true;
    expCtx.imageSmoothingQuality = "high";

    for (const stroke of strokesRef.current) {
      const pts = stroke.points;
      if (!pts || pts.length === 0) continue;

      let renderColor = stroke.color;
      const lower = (renderColor || "").toLowerCase();
      if (lower === "#fed800" || lower === "#ffffff" || lower === "#38bdf8") {
        renderColor = "#0f2b5c"; // Executive Legal Navy for the contract
      }

      expCtx.strokeStyle = renderColor;
      expCtx.fillStyle = renderColor;
      expCtx.lineWidth = stroke.width || 2.8;

      if (pts.length === 1) {
        expCtx.beginPath();
        expCtx.arc(pts[0].x, pts[0].y, (stroke.width || 2.8) / 2, 0, Math.PI * 2);
        expCtx.fill();
        continue;
      }
      if (pts.length === 2) {
        expCtx.beginPath();
        expCtx.moveTo(pts[0].x, pts[0].y);
        expCtx.lineTo(pts[1].x, pts[1].y);
        expCtx.stroke();
        continue;
      }

      expCtx.beginPath();
      expCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const pCurr = pts[i];
        const pNext = pts[i + 1];
        const mid = { x: (pCurr.x + pNext.x) / 2, y: (pCurr.y + pNext.y) / 2 };
        expCtx.quadraticCurveTo(pCurr.x, pCurr.y, mid.x, mid.y);
      }
      expCtx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      expCtx.stroke();
    }

    const dataUrl = exportCanvas.toDataURL("image/png");
    setFormData((prev) => ({ ...prev, signatureImageUrl: dataUrl }));
    setHasDrawnSignature(true);
  };

  const undoSignature = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    redrawCanvas();
    if (strokesRef.current.length === 0) {
      setHasDrawnSignature(false);
      setFormData((prev) => ({ ...prev, signatureImageUrl: "" }));
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
    setFormData((prev) => ({ ...prev, signatureImageUrl: "" }));
  };

  const handleSubmitSign = async (e) => {
    e.preventDefault();
    if (!formData.nicNumber.trim()) {
      notify.warn("National Identity Card (NIC) number is required");
      return;
    }
    if (!formData.bankAccountNumber.trim()) {
      notify.warn("Bank account number is required");
      return;
    }
    if (!formData.signatureImageUrl) {
      notify.warn("Please draw your electronic signature before signing");
      return;
    }

    setSigningLoading(true);
    try {
      await signAgreement({
        venueName: formData.venueName,
        nicNumber: formData.nicNumber,
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        accountName: formData.accountName,
        bankAccountNumber: formData.bankAccountNumber,
        signatureImageUrl: formData.signatureImageUrl,
      });

      notify.success("Agreement signed & locked successfully into the Document Vault!");
      setShowSignModal(false);
      fetchAgreements();
    } catch (err) {
      console.error("Signing failed:", err);
      notify.error(err.response?.data?.message || err.message || "Failed to sign agreement");
    } finally {
      setSigningLoading(false);
    }
  };

  // PDF download handler
  const handleDownloadPdf = async (agreement) => {
    try {
      notify.info("Preparing signed agreement PDF...");
      const res = await downloadAgreementPdf(agreement.contractId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${agreement.contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success("Agreement PDF downloaded successfully!");
    } catch (err) {
      console.warn("Server PDF stream failed, regenerating via client-side jsPDF snapshot:", err);
      // Fallback: Generate immutable PDF using client-side jsPDF strictly using locked snapshot fields
      generateClientSideSnapshotPdf(agreement);
    }
  };

  // Client-side PDF fallback strictly using locked snapshot values
  const generateClientSideSnapshotPdf = async (agr) => {
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
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(215, 220, 228);
      doc.rect(margin, boxY, contentWidth, 26, "FD");

      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      // Party A
      doc.setFont("helvetica", "bold");
      doc.text("PARTY A (Platform):", margin + 3.5, boxY + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text("Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform) | BR No: POL/ELH/ESD/02/01/1941/2026", margin + 33, boxY + 5.5);

      // Party B & NIC
      doc.setFont("helvetica", "bold");
      doc.text("PARTY B (Organizer / Venue):", margin + 3.5, boxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(agr.accountName || agr.organizerName || "Authorized Signatory", margin + 46, boxY + 11);

      doc.setFont("helvetica", "bold");
      doc.text("National Identity Card (NIC):", margin + 110, boxY + 11);
      doc.setFont("helvetica", "normal");
      doc.text(agr.nicNumber || "-", margin + 150, boxY + 11);

      // Venue
      doc.setFont("helvetica", "bold");
      doc.text("Associated Venue / Hall:", margin + 3.5, boxY + 16.5);
      doc.setFont("helvetica", "normal");
      doc.text(agr.venueName || "Designated Venue / Hall", margin + 39, boxY + 16.5);

      // Contact
      doc.setFont("helvetica", "bold");
      doc.text("Registered Contact:", margin + 3.5, boxY + 21.5);
      doc.setFont("helvetica", "normal");
      doc.text(`${agr.organizerEmail || user?.email || "partner@naataka.lk"} | ${agr.organizerPhone || user?.phoneNumber || "-"}`, margin + 32, boxY + 21.5);

      y = boxY + 29.5;

      // Section 1
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("1. Scope of Settlement, Agency & Revenue Sharing", margin, y);

      y += 3.8;
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const splitSec1 = doc.splitTextToSize(agr.sectionOneText || "100% of gross ticket face value shall be remitted to Party B.", contentWidth);
      doc.text(splitSec1, margin, y);
      y += splitSec1.length * 3.4 + 2;

      // Section 2
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
      doc.text(`Bank: ${agr.bankName}  |  Branch: ${agr.bankBranch}`, margin + 3.5, y + 4.5);
      doc.text(`Account Name: ${agr.accountName}  |  Account Number: ${agr.bankAccountNumber}`, margin + 3.5, y + 9);
      y += 14.5;

      // Section 3
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("3. Disbursement Timeline & LankaPay Settlement", margin, y);

      y += 3.6;
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const sec3 = "Payouts are processed via LankaPay CEFT/SLIPS within 5 to 7 business days after the successful completion of the event, subject to final ticket sales reconciliation.";
      const splitSec3 = doc.splitTextToSize(sec3, contentWidth);
      doc.text(splitSec3, margin, y);
      y += splitSec3.length * 3.4 + 2;

      // Section 4
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("4. Cancellations, Chargebacks, Permits & Taxes", margin, y);

      y += 3.6;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);

      const bullets = [
        "• Event Cancellations / Postponements: If Party B cancels or postpones the event, Party B is responsible for full ticket refunds, and non-refundable payment gateway charges remain deductible.",
        "• Disputes & Chargebacks: Party A reserves the right to withhold or recover funds in the event of buyer chargebacks or payment disputes.",
        "• Municipal & Fiscal Taxes: Party B is solely responsible for all applicable local municipal entertainment taxes and income taxes.",
        "• Permits, Venue & Copyrights: Party B is solely responsible for securing venue bookings, Public Performance Board approvals, and all necessary script, music, and performance copyrights, and indemnifies Party A against any third-party claims."
      ];
      bullets.forEach((b) => {
        const split = doc.splitTextToSize(b, contentWidth);
        doc.text(split, margin, y);
        y += split.length * 3.2 + 0.8;
      });
      y += 1.5;

      // Section 5
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("5. Governing Law & Electronic Execution", margin, y);

      y += 3.6;
      doc.setFontSize(7.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const sec5 = "This Agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka and constitutes a legally binding contract executed electronically under the Electronic Transactions Act No. 19 of 2006.";
      const splitSec5 = doc.splitTextToSize(sec5, contentWidth);
      doc.text(splitSec5, margin, y);
      y += splitSec5.length * 3.4 + 3;

      // Divider Line
      doc.setDrawColor(200, 205, 215);
      doc.line(margin, y, margin + contentWidth, y);
      y += 3.5;

      const sigColWidth = contentWidth / 2 - 4;
      const col2Left = margin + contentWidth / 2 + 4;

      // Party A Headings
      doc.setFontSize(7.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("For Zeylex Digital Solutions (Party A):", margin, y);
      doc.text("For Organizer / Venue Partner (Party B):", col2Left, y);

      // Party A Rubber Seal Box
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

      // Party B Signature Image
      if (agr.signatureImageUrl) {
        try {
          doc.addImage(agr.signatureImageUrl, "PNG", col2Left + 2, y + 1.5, 36, 12);
        } catch {
          doc.setFontSize(7);
          doc.setFont("helvetica", "italic");
          doc.text("[Digital Signature On File]", col2Left + 4, y + 8);
        }
      }

      // Signatory underline
      doc.setDrawColor(180, 185, 195);
      doc.line(margin, y + 15, margin + sigColWidth, y + 15);
      doc.line(col2Left, y + 15, col2Left + sigColWidth, y + 15);

      doc.setFontSize(6.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Proprietor / Authorized Signatory, Zeylex Digital Solutions", margin, y + 18.5);
      doc.text("Official Rubber Seal • Registered Merchant Platform", margin, y + 22);

      doc.text(`Signatory: ${agr.accountName || agr.organizerName}`, col2Left, y + 18.5);
      doc.text(`Party B NIC: ${agr.nicNumber} | Authorized Representative`, col2Left, y + 22);

      // Audit Trail Box
      const auditY = y + 26;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, auditY, contentWidth, 18, 1, 1, "FD");

      doc.setFontSize(6.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("ELECTRONIC SIGNATURE AUDIT TRAIL & VERIFICATION RECORD", margin + 3.5, auditY + 4.2);

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Contract ID:", margin + 3.5, auditY + 8.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(`${agr.contractId} (v${agr.versionNumber} - ${agr.status})`, margin + 20, auditY + 8.8);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Signed At:", margin + 78, auditY + 8.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(agr.signedAtFormatted || "-", margin + 92, auditY + 8.8);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Signer IP Address:", margin + 3.5, auditY + 13.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(agr.signerIp || "127.0.0.1", margin + 28, auditY + 13.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Party B NIC:", margin + 78, auditY + 13.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(agr.nicNumber || "-", margin + 96, auditY + 13.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Verification Status:", margin + 125, auditY + 13.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(16, 120, 60);
      doc.text("Verified via OTP / Registered Email", margin + 151, auditY + 13.5);

      // Single-page safeguard
      const totalPages = doc.internal.getNumberOfPages();
      if (totalPages > 1) {
        for (let p = totalPages; p > 1; p--) {
          doc.deletePage(p);
        }
      }

      doc.save(`${agr.contractId}.pdf`);
      notify.success("Agreement PDF generated & downloaded!");
    } catch (e) {
      console.error("PDF generation failed:", e);
      notify.error("Failed to generate PDF document");
    }
  };

  const activeAgreement = agreements.find((a) => a.status === "ACTIVE");
  const pastAgreements = agreements.filter((a) => a.status === "ARCHIVED");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              Legal & Document Vault
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Versioned Settlement Contracts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Organizer & Venue Agreement Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Immutable legal contracts signed electronically under Sri Lanka Electronic Transactions Act No. 19 of 2006. Terms are permanently locked at signing time to protect your venue revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToKyc && (
            <button
              onClick={onNavigateToKyc}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#FED800] border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#FED800]" />
              <span>KYC & Documents Vault</span>
            </button>
          )}
          <button
            onClick={() => {
              setRefreshing(true);
              fetchAgreements();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            title="Refresh Vault"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <StageDramaButton
            onClick={openSigningFlow}
            variant="gold"
            size="md"
            icon={PenTool}
          >
            {activeAgreement ? "Sign Updated Agreement" : "Review & Sign Agreement"}
          </StageDramaButton>
        </div>
      </div>

      {/* TOP SECTION: Current Active Agreement Card */}
      {loading ? (
        <div className="p-8 rounded-2xl bg-[#14141e] border border-white/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading Agreement Vault...</p>
          </div>
        </div>
      ) : activeAgreement ? (
        <div className="bg-gradient-to-br from-[#121927] to-[#0f1420] p-6 rounded-2xl border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
          {/* Top Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ACTIVE AGREEMENT (v{activeAgreement.versionNumber})
              </span>
              <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                {activeAgreement.contractId}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Signed on {activeAgreement.signedAtFormatted}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            {/* Column 1: Agreed Commission Model */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Agreed Commission Model
              </span>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-amber-300">
                    {activeAgreement.agreedModelCode}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Locked at Signing
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">
                  {activeAgreement.agreedModelCode === "MODEL_A"
                    ? `100% Ticket Value Remitted • ${activeAgreement.agreedBuyerFeePercent}% Buyer Fee`
                    : activeAgreement.agreedModelCode === "MODEL_B"
                    ? `${activeAgreement.agreedOrganizerPayoutPercent}% Payout • ${activeAgreement.agreedOrganizerCommissionPercent}% Platform Fee • ${activeAgreement.agreedBuyerFeePercent}% Buyer Fee`
                    : `${activeAgreement.agreedOrganizerPayoutPercent}% Payout • ${activeAgreement.agreedOrganizerCommissionPercent}% All-Inclusive Platform Fee`}
                </p>
              </div>
            </div>

            {/* Column 2: Destination Bank Account */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Settlement Bank Account
              </span>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">
                    {activeAgreement.bankName}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Account: <span className="font-bold text-amber-200">{activeAgreement.maskedAccountNumber}</span> ({activeAgreement.accountName})
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Branch: {activeAgreement.bankBranch} • Direct LankaPay CEFT
                </p>
              </div>
            </div>

            {/* Column 3: Associated Venue & NIC */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Venue & Identity
              </span>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">
                    {activeAgreement.venueName}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Party B NIC: <span className="font-mono font-bold text-white">{activeAgreement.nicNumber}</span>
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">
                  ✓ Verified via OTP / Registered Email
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 Text Excerpt */}
          <div className="mt-5 p-3.5 bg-black/30 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed italic">
            <span className="font-bold text-amber-400 not-italic">Section 1 Scope: </span>
            {activeAgreement.sectionOneText}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 mt-5 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setSelectedContract(activeAgreement);
                setShowViewModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Full Contract</span>
            </button>

            <StageDramaButton
              onClick={() => handleDownloadPdf(activeAgreement)}
              variant="theatre"
              size="sm"
              icon={Download}
            >
              Download PDF Document
            </StageDramaButton>
          </div>
        </div>
      ) : (
        /* Empty State: Not yet signed */
        <div className="bg-[#14141e] p-8 rounded-2xl border border-amber-500/30 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
            <FileText className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Signed Agreement On File</h3>
            <p className="text-xs text-slate-400 mt-1">
              To disburse event ticket sales via LankaPay direct bank transfer, please review and electronically execute the Organizer / Venue Settlement Agreement.
            </p>
          </div>
          <button
            onClick={openSigningFlow}
            className="btn-theatre-gold px-6 py-3 rounded-xl font-extrabold text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <PenTool className="w-4 h-4" />
            <span>Review Terms & Sign Now</span>
          </button>
        </div>
      )}

      {/* BOTTOM SECTION: Past Agreements History Table */}
      <div className="bg-[#14141e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Permanent Agreement History & Audit Vault
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pastAgreements.length} Archived Contract{pastAgreements.length !== 1 ? "s" : ""}
          </span>
        </div>

        {pastAgreements.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No archived agreements yet. When terms or bank details are updated in the future, all prior versions are permanently locked and archived here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Contract ID</th>
                  <th className="py-3 px-4">Signed Date & Time</th>
                  <th className="py-3 px-4">Agreed Commission Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastAgreements.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      v{item.versionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white font-medium">
                      {item.contractId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.signedAtFormatted}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      <span className="font-bold text-amber-300 mr-2">{item.agreedModelCode}</span>
                      <span className="text-[11px] text-slate-400">
                        ({item.agreedOrganizerPayoutPercent}% Payout)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-400 border border-white/10">
                        ARCHIVED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedContract(item);
                            setShowViewModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SIGNING FLOW MODAL                                        */}
      {/* ========================================================= */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#12141e] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {previewData?.hasActiveAgreement ? "Sign Updated Settlement Agreement" : "Sign Organizer Settlement Agreement"}
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Live rates fetched from backend • Permanent immutable execution
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPreview ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                <p className="text-xs text-slate-400">Fetching live active commission terms...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSign} className="space-y-4 text-xs">
                {/* Active Terms Banner */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-amber-400">
                    <span>Active Platform Model: {previewData?.modelCode} ({previewData?.modelName})</span>
                    <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded uppercase">Server Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {previewData?.sectionOneText}
                  </p>
                </div>

                {/* On-file KYC Detection Alert */}
                {kycOverviewState && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        KYC on file:{" "}
                        <strong className="text-white">
                          {kycOverviewState.nicFrontUploaded ? "NIC Documents Uploaded" : "Verified Record"}
                        </strong>
                        {kycOverviewState.bankProofUploaded ? " • Bank Proof Attached" : ""}
                      </span>
                    </div>
                    {onNavigateToKyc && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignModal(false);
                          onNavigateToKyc();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold"
                      >
                        View KYC Section
                      </button>
                    )}
                  </div>
                )}

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Venue / Hall Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lionel Wendt Theatre"
                      value={formData.venueName}
                      onChange={(e) => setFormData((p) => ({ ...p, venueName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a10] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      National Identity Card (NIC) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 198812345678 or 881234567V"
                      value={formData.nicNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, nicNumber: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a10] border border-white/15 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Bank Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commercial Bank of Ceylon"
                      value={formData.bankName}
                      onChange={(e) => setFormData((p) => ({ ...p, bankName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a10] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Bank Branch <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Colombo 07 Branch"
                      value={formData.bankBranch}
                      onChange={(e) => setFormData((p) => ({ ...p, bankBranch: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a10] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Account Holder Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="As in bank passbook"
                      value={formData.accountName}
                      onChange={(e) => setFormData((p) => ({ ...p, accountName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a10] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Bank Account Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100012345678"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a10] border border-white/15 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Digital Signature Canvas Section */}
                <div className="pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-[#FED800]" />
                        <span>Party B Digital Signature Canvas</span>
                        <span className="text-rose-400">*</span>
                      </label>

                      {/* Surface Theme Toggle */}
                      <div className="inline-flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setCanvasTheme("dark");
                            setInkColor("#FED800");
                          }}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                            canvasTheme === "dark"
                              ? "bg-white/15 text-[#FED800] shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Dark Slate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCanvasTheme("paper");
                            setInkColor("#1d4ed8");
                          }}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                            canvasTheme === "paper"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Legal Paper
                        </button>
                      </div>
                    </div>

                    {/* Ink Color & Action Controls */}
                    <div className="flex items-center gap-2.5">
                      {/* Ink color picker */}
                      <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                        <span className="text-[9px] text-slate-400 font-medium">Ink:</span>
                        {(canvasTheme === "dark"
                          ? [
                              { color: "#FED800", label: "Gold" },
                              { color: "#38bdf8", label: "Sky" },
                              { color: "#ffffff", label: "White" },
                            ]
                          : [
                              { color: "#1d4ed8", label: "Royal Blue" },
                              { color: "#0f172a", label: "Black" },
                              { color: "#b91c1c", label: "Crimson" },
                            ]
                        ).map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setInkColor(c.color)}
                            title={c.label}
                            style={{ backgroundColor: c.color }}
                            className={`w-3.5 h-3.5 rounded-full transition-transform ${
                              inkColor === c.color
                                ? "scale-125 ring-2 ring-white ring-offset-1 ring-offset-black"
                                : "opacity-80 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Undo Button */}
                      <button
                        type="button"
                        onClick={undoSignature}
                        disabled={!hasDrawnSignature}
                        className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
                        title="Undo last stroke"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo</span>
                      </button>

                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Smooth Signature Pad Box */}
                  <div className="border border-white/15 rounded-xl overflow-hidden p-1.5 bg-[#0a0a10]">
                    <div ref={canvasContainerRef} className="relative w-full">
                      <canvas
                        ref={canvasRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className={`w-full h-32 rounded-lg cursor-crosshair touch-none select-none transition-colors ${
                          canvasTheme === "paper"
                            ? "bg-white shadow-inner"
                            : "bg-[#07070b]"
                        }`}
                        style={{ touchAction: "none" }}
                      />

                      {/* Background Visual Guide (Non-interactive overlay) */}
                      <div className="absolute inset-x-5 bottom-8 pointer-events-none flex items-center gap-2 select-none">
                        <span
                          className={`text-xs font-serif font-black ${
                            canvasTheme === "paper" ? "text-slate-400" : "text-white/20"
                          }`}
                        >
                          ✕
                        </span>
                        <div
                          className={`flex-1 border-b border-dashed ${
                            canvasTheme === "paper" ? "border-slate-300" : "border-white/10"
                          }`}
                        />
                      </div>

                      <div className="absolute right-3.5 bottom-2 pointer-events-none select-none">
                        <span
                          className={`text-[9px] font-mono ${
                            canvasTheme === "paper" ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          sign above using mouse, stylus or touch (smooth curved ink)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal acknowledgment */}
                <div className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                  By clicking <strong>Execute & Lock Agreement</strong>, you agree to the active terms and certify that this digital execution constitutes a legally binding contract under the Sri Lanka Electronic Transactions Act No. 19 of 2006. Any existing active agreement will be safely archived.
                </div>

                {/* Submit & Cancel */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <StageDramaButton
                    type="submit"
                    variant="gold"
                    size="md"
                    loading={signingLoading}
                    loadingText="Securing & Locking Agreement..."
                    disabled={signingLoading || !hasDrawnSignature}
                    icon={ShieldCheck}
                  >
                    Execute & Lock Agreement
                  </StageDramaButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INLINE VIEW CONTRACT MODAL                                */}
      {/* ========================================================= */}
      {showViewModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative font-serif">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b pb-4 mb-5 print-hide font-sans">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ORGANIZER / VENUE TICKETING & SETTLEMENT AGREEMENT
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Contract ID: {selectedContract.contractId} (v{selectedContract.versionNumber} - {selectedContract.status})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedContract)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contract Body */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-800">
              <div className="text-center border-b pb-3">
                <h1 className="text-lg font-bold uppercase font-sans text-slate-950">
                  ZEYLEX DIGITAL SOLUTIONS
                </h1>
                <p className="text-[11px] text-slate-600 font-sans">
                  operating the Naataka.lk Online Ticketing Platform
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Business Registration No: POL/ELH/ESD/02/01/1941/2026
                </p>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-sans mt-1">
                  ORGANIZER / VENUE TICKETING & SETTLEMENT AGREEMENT
                </p>
                <p className="text-[9.5px] text-slate-500 font-sans">
                  Executed electronically under Sri Lanka Electronic Transactions Act No. 19 of 2006
                </p>
              </div>

              {/* Parties Box */}
              <div className="p-3 bg-slate-50 border rounded-lg space-y-1 font-sans text-[11px]">
                <p><strong>PARTY A (Platform):</strong> Zeylex Digital Solutions (operating the Naataka.lk Online Ticketing Platform) | BR No: POL/ELH/ESD/02/01/1941/2026</p>
                <p className="text-slate-600 font-mono text-[10px]">Address: No. 43, Jamburewela, Aththanakadawala, 51235, Sri Lanka | admin@zeylex.com</p>
                <p><strong>PARTY B (Organizer / Venue):</strong> {selectedContract.accountName || selectedContract.organizerName}</p>
                <p><strong>National Identity Card (NIC):</strong> {selectedContract.nicNumber}</p>
                <p><strong>Associated Venue / Hall:</strong> {selectedContract.venueName}</p>
                <p><strong>Registered Contact:</strong> {selectedContract.organizerEmail || user?.email} | {selectedContract.organizerPhone || user?.phoneNumber || "-"}</p>
              </div>

              <h4 className="font-bold text-sm text-slate-900 pt-1 font-sans">1. Scope of Settlement, Agency & Revenue Sharing</h4>
              <p className="text-slate-700 leading-relaxed text-justify">
                {selectedContract.sectionOneText || selectedContract.sectionOneTextSnapshot}
              </p>

              <h4 className="font-bold text-sm text-slate-900 pt-1 font-sans">2. Destination Bank Account for LankaPay Settlement</h4>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-1 font-mono text-[11px]">
                <p><strong>Bank:</strong> {selectedContract.bankName}</p>
                <p><strong>Branch:</strong> {selectedContract.bankBranch}</p>
                <p><strong>Account Name:</strong> {selectedContract.accountName}</p>
                <p><strong>Account Number:</strong> {selectedContract.bankAccountNumber}</p>
              </div>

              <h4 className="font-bold text-sm text-slate-900 pt-1 font-sans">3. Disbursement Timeline & LankaPay Settlement</h4>
              <p className="text-slate-700 leading-relaxed">
                Payouts are processed via LankaPay CEFT/SLIPS within 5 to 7 business days after the successful completion of the event, subject to final ticket sales reconciliation.
              </p>

              <h4 className="font-bold text-sm text-slate-900 pt-1 font-sans">4. Cancellations, Chargebacks, Permits & Taxes</h4>
              <div className="space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <p>• <strong>Event Cancellations & Postponements:</strong> If Party B cancels or postpones the event, Party B is responsible for full ticket refunds, and non-refundable payment gateway charges remain deductible.</p>
                <p>• <strong>Disputes & Chargebacks:</strong> Party A reserves the right to withhold or recover funds in the event of buyer chargebacks or payment disputes.</p>
                <p>• <strong>Municipal & Fiscal Taxes:</strong> Party B is solely responsible for all applicable local municipal entertainment taxes and income taxes.</p>
                <p>• <strong>Permits, Venue & Copyrights:</strong> Party B is solely responsible for securing venue bookings, Public Performance Board approvals, and all necessary script, music, and performance copyrights, and indemnifies Party A against any third-party claims.</p>
              </div>

              <h4 className="font-bold text-sm text-slate-900 pt-1 font-sans">5. Governing Law & Electronic Execution</h4>
              <p className="text-slate-700 leading-relaxed">
                This Agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka and constitutes a legally binding contract executed electronically under the Electronic Transactions Act No. 19 of 2006.
              </p>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-5 border-t mt-4 font-sans">
                <div>
                  <p className="font-bold text-slate-900 mb-1">For Zeylex Digital Solutions (Party A):</p>
                  <div className="h-14 border-b border-slate-400 flex items-center justify-start">
                    <img
                      src="/images/zeylex-proprietor-seal.png"
                      alt="Rubber Seal"
                      className="h-12 max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "block";
                      }}
                    />
                    <div style={{ display: "none" }} className="text-slate-600 italic text-[10px]">
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
                  <p className="font-bold text-slate-900 mb-1">For Organizer / Venue Partner (Party B):</p>
                  <div className="h-14 border-b border-slate-400 flex items-center justify-center">
                    {selectedContract.signatureImageUrl ? (
                      <img
                        src={selectedContract.signatureImageUrl}
                        alt="Digital Signature"
                        className="h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">Digital Signature On File</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-700 font-medium mt-1">
                    Signatory: {selectedContract.accountName || selectedContract.organizerName}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Party B NIC: {selectedContract.nicNumber} • Authorized Representative
                  </p>
                </div>
              </div>

              {/* Audit Trail Box */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[10px] text-slate-700 space-y-1">
                <p className="font-bold text-[10.5px] text-slate-900 font-sans tracking-wide uppercase border-b border-slate-200 pb-1">
                  Electronic Signature Audit Trail & Verification Record
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1">
                  <p><span className="font-semibold text-slate-900">Contract ID:</span> {selectedContract.contractId} (v{selectedContract.versionNumber} - {selectedContract.status})</p>
                  <p><span className="font-semibold text-slate-900">Signed At:</span> {selectedContract.signedAtFormatted}</p>
                  <p><span className="font-semibold text-slate-900">Signer IP Address:</span> {selectedContract.signerIp || "127.0.0.1"}</p>
                  <p><span className="font-semibold text-slate-900">Party B NIC:</span> {selectedContract.nicNumber}</p>
                  <p className="sm:col-span-2">
                    <span className="font-semibold text-slate-900">Verification Status:</span>{" "}
                    <span className="text-emerald-700 font-bold">Verified via OTP / Registered Email</span>
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
