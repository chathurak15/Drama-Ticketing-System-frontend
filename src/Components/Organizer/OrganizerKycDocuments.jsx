"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Clock,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  ExternalLink,
  Lock,
  Building2,
  CreditCard,
  UserCheck,
  HelpCircle,
  Info,
  Loader2,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from "lucide-react";
import notify from "../../utils/notify";
import { getApiBaseUrl } from "../../utils/cdn";
import {
  getMyKycOverview,
  uploadKycDocument,
  deleteKycDocument,
  updateKycDetails,
} from "../../services/KycService";

const OrganizerKycDocuments = ({ onNavigateToAgreements }) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [nicNumberInput, setNicNumberInput] = useState("");
  const [brNumberInput, setBrNumberInput] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Uploading state tracking by documentType
  const [uploadingTypes, setUploadingTypes] = useState({});

  // Custom supporting document upload state
  const [customLabel, setCustomLabel] = useState("");
  const [customFile, setCustomFile] = useState(null);
  const [isUploadingCustom, setIsUploadingCustom] = useState(false);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Confirmation modal for delete
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await getMyKycOverview();
      setOverview(data);
      if (data?.nicNumber) setNicNumberInput(data.nicNumber);
      if (data?.brNumber) setBrNumberInput(data.brNumber);
    } catch (err) {
      console.error("Failed to load KYC overview:", err);
      notify.apiError(err, "Failed to load KYC verification status");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e?.preventDefault();
    setSavingDetails(true);
    try {
      const updated = await updateKycDetails({
        nicNumber: nicNumberInput.trim().toUpperCase(),
        brNumber: brNumberInput.trim().toUpperCase(),
      });
      setOverview(updated);
      notify.success("Identity numbers successfully updated!");
    } catch (err) {
      notify.apiError(err, "Failed to update identity numbers");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleFileUpload = async (file, documentType, label = "") => {
    if (!file) return;

    // 10MB check
    if (file.size > 10 * 1024 * 1024) {
      notify.error("File exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    const key = documentType;
    setUploadingTypes((prev) => ({ ...prev, [key]: true }));

    try {
      await uploadKycDocument(file, documentType, label);
      notify.success(`${getDocTypeTitle(documentType)} uploaded successfully!`);
      await fetchOverview();
    } catch (err) {
      console.error("KYC Upload error:", err);
      notify.apiError(err, "File upload failed. Please try again.");
    } finally {
      setUploadingTypes((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCustomUploadSubmit = async (e) => {
    e.preventDefault();
    if (!customFile) {
      notify.warn("Please select a file to upload");
      return;
    }
    if (!customLabel.trim()) {
      notify.warn("Please enter a descriptive label (e.g. Venue Booking Approval)");
      return;
    }

    setIsUploadingCustom(true);
    try {
      await uploadKycDocument(customFile, "OTHER_KYC", customLabel.trim());
      notify.success(`"${customLabel}" uploaded successfully!`);
      setCustomLabel("");
      setCustomFile(null);
      await fetchOverview();
    } catch (err) {
      notify.apiError(err, "Failed to upload supporting document");
    } finally {
      setIsUploadingCustom(false);
    }
  };

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    try {
      await deleteKycDocument(docId);
      notify.success("Document removed successfully");
      setDeleteConfirmDoc(null);
      await fetchOverview();
    } catch (err) {
      notify.apiError(err, "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to extract singleton docs
  const getDocumentByType = (type) => {
    if (!overview?.documents) return null;
    return overview.documents.find((d) => d.documentType?.toUpperCase() === type.toUpperCase());
  };

  const getOtherKycDocuments = () => {
    if (!overview?.documents) return [];
    return overview.documents.filter((d) => d.documentType?.toUpperCase() === "OTHER_KYC");
  };

  const getDocTypeTitle = (type) => {
    switch (type) {
      case "NIC_FRONT":
        return "NIC Front";
      case "NIC_BACK":
        return "NIC Back";
      case "BUSINESS_REGISTRATION":
        return "Business Registration";
      case "BANK_PROOF":
        return "Bank Passbook / Statement Proof";
      case "OTHER_KYC":
        return "Supporting Document";
      default:
        return type;
    }
  };

  const getDocumentUrl = (doc) => {
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

  const isPdf = (url, fileName = "") => {
    return (
      (fileName && fileName.toLowerCase().endsWith(".pdf")) ||
      (url && url.toLowerCase().split("?")[0].endsWith(".pdf")) ||
      (url && url.toLowerCase().includes(".pdf"))
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <Clock className="w-3.5 h-3.5" />
        Pending Review
      </span>
    );
  };

  // Upload Slot Component
  const UploadSlot = ({
    documentType,
    title,
    subtitle,
    required = false,
    existingDoc,
    accept = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf",
  }) => {
    const fileInputRef = useRef(null);
    const isUploading = !!uploadingTypes[documentType];

    return (
      <div className="bg-[#12121c] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{title}</span>
                {required ? (
                  <span className="text-rose-400 text-xs font-semibold" title="Required Document">*</span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-normal px-1.5 py-0.5 rounded bg-white/5">Optional</span>
                )}
              </h4>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            {existingDoc && renderStatusBadge(existingDoc.status)}
          </div>

          {/* Rejection notice if rejected */}
          {existingDoc?.status === "REJECTED" && (
            <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-bold">Rejection Reason: </span>
                <span>{existingDoc.rejectionReason || "Document is blurry or illegible. Please replace with a clear copy."}</span>
              </div>
            </div>
          )}

          {/* If document exists */}
          {existingDoc ? (
            <div className="mt-3 p-3 rounded-xl bg-[#181826] border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {isPdf(getDocumentUrl(existingDoc), existingDoc.fileName) ? (
                    <FileText className="w-6 h-6 text-rose-400" />
                  ) : (
                    <img
                      src={getDocumentUrl(existingDoc)}
                      alt={existingDoc.fileName}
                      className="w-full h-full object-cover"
                      crossOrigin="use-credentials"
                      onError={(e) => {
                        const fallback = `${getApiBaseUrl().replace(/\/+$/, "")}/organizer/kyc/documents/${existingDoc.id}/file`;
                        if (e.target.src !== fallback) {
                          e.target.src = fallback;
                        }
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate" title={existingDoc.fileName}>
                    {existingDoc.fileName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatFileSize(existingDoc.fileSize)} • Uploaded {new Date(existingDoc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(existingDoc)}
                  className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Preview Document"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={getDocumentUrl(existingDoc)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Open / Download"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
                  title="Replace Document"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmDoc(existingDoc)}
                  disabled={isUploading}
                  className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Upload Drop Area */
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`mt-3 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center group ${
                isUploading
                  ? "bg-amber-500/5 border-amber-500/40"
                  : "bg-white/[0.02] border-white/15 hover:border-amber-400/50 hover:bg-white/[0.04]"
              }`}
            >
              {isUploading ? (
                <div className="py-2 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-[#FED800] animate-spin mb-2" />
                  <p className="text-xs font-bold text-amber-300">Uploading securely to Naataka Vault...</p>
                  <p className="text-[10px] text-slate-400 mt-1">Please wait a moment</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-[#FED800] group-hover:border-[#FED800]/40 transition-all mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-[#FED800] transition-colors">
                    Click or drag file to upload
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    JPG, PNG, WEBP, or PDF • Max 10MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file, documentType);
            }
            e.target.value = "";
          }}
        />
      </div>
    );
  };

  // OVERALL STATUS BANNER CONFIGURATION
  const getBannerDetails = () => {
    const status = overview?.overallStatus || "Incomplete";
    switch (status) {
      case "Verified":
        return {
          title: "KYC Identity & Bank Verification Complete",
          desc: "All required identity and banking documents have been verified by Naataka LK Compliance. Your organizer account is fully approved for instant automated payout releases.",
          badge: "Verified",
          icon: ShieldCheck,
          bg: "bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-[#12121c] border-emerald-500/40 text-emerald-300",
          iconBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
          progressColor: "bg-emerald-400",
        };
      case "Pending Review":
        return {
          title: "KYC Documents Under Review",
          desc: "Your documents have been successfully submitted and are currently being audited by our legal compliance team. Turnaround time is usually within 1-2 business days.",
          badge: "Pending Review",
          icon: Clock,
          bg: "bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-[#12121c] border-blue-500/40 text-blue-300",
          iconBg: "bg-blue-500/20 border-blue-500/40 text-blue-400",
          progressColor: "bg-blue-400",
        };
      case "Action Required":
        return {
          title: "Action Required: Re-upload Rejected Document",
          desc: "One or more of your submitted documents did not meet our verification standards (e.g. blurry, expired, or missing account details). Please review the feedback tags below and re-upload.",
          badge: "Action Required",
          icon: AlertTriangle,
          bg: "bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-[#12121c] border-rose-500/40 text-rose-300",
          iconBg: "bg-rose-500/20 border-rose-500/40 text-rose-400",
          progressColor: "bg-rose-400",
        };
      case "Incomplete":
      default:
        return {
          title: "KYC Verification Incomplete",
          desc: "To comply with Sri Lanka Central Bank (CBSL) AML guidelines and LankaPay banking protocols, please upload your National Identity Card (NIC Front & Back) and Bank Statement Proof.",
          badge: "Incomplete",
          icon: AlertCircle,
          bg: "bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-[#12121c] border-amber-500/40 text-amber-300",
          iconBg: "bg-amber-500/20 border-amber-500/40 text-amber-400",
          progressColor: "bg-[#FED800]",
        };
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#FED800] mx-auto mb-3" />
        <p className="text-slate-300 font-bold text-sm">Loading KYC & Verification Documents Vault...</p>
        <p className="text-slate-500 text-xs mt-1">Checking encryption & regulatory status</p>
      </div>
    );
  }

  const banner = getBannerDetails();
  const BannerIcon = banner.icon;

  const nicFrontDoc = getDocumentByType("NIC_FRONT");
  const nicBackDoc = getDocumentByType("NIC_BACK");
  const brDoc = getDocumentByType("BUSINESS_REGISTRATION");
  const bankProofDoc = getDocumentByType("BANK_PROOF");
  const otherDocs = getOtherKycDocuments();

  const requiredCount = overview?.requiredUploadedCount || 0;
  const totalRequired = overview?.totalRequiredCount || 3;
  const progressPercent = Math.min(100, Math.round((requiredCount / totalRequired) * 100));

  return (
    <div className="space-y-6">
      {/* 1. OVERALL STATUS BANNER */}
      <div className={`p-6 rounded-2xl border ${banner.bg} shadow-2xl relative overflow-hidden backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${banner.iconBg}`}>
              <BannerIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                  KYC Audit Status
                </span>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-black/40 border border-white/20">
                  {banner.badge}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1.5">{banner.title}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">{banner.desc}</p>
            </div>
          </div>

          {/* Progress Box */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/10 shrink-0 min-w-[200px]">
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Mandatory KYC Proofs:</span>
              <span className="text-white font-mono">{requiredCount} of {totalRequired}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${banner.progressColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              {progressPercent === 100
                ? "All mandatory documents on file"
                : `${totalRequired - requiredCount} required document${totalRequired - requiredCount !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </div>

        {/* Quick link to agreement vault if user is verified */}
        {onNavigateToAgreements && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-400">
              Need to review or execute your Legal Settlement Agreement?
            </span>
            <button
              onClick={onNavigateToAgreements}
              className="text-[#FED800] hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>Settlement Agreement & Vault</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. THE 4 UPLOAD CARDS */}
      <div className="space-y-6">

        {/* CARD 1: National Identity Card (NIC) - Required */}
        <div className="bg-[#12121c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FED800] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">1. National Identity Card (NIC)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                    Required
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sri Lankan National Identity Card, Passport photo page, or Driving License. Both front and back are required.
                </p>
              </div>
            </div>

            {/* NIC Number Input */}
            <form onSubmit={handleSaveDetails} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="NIC (e.g. 198812345678 or 881234567V)"
                  value={nicNumberInput}
                  onChange={(e) => setNicNumberInput(e.target.value.toUpperCase())}
                  className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:border-[#FED800] focus:outline-none w-56 sm:w-64"
                />
              </div>
              <button
                type="submit"
                disabled={savingDetails}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
              >
                {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save NIC"}
              </button>
            </form>
          </div>

          {/* 2 Sub-slots: Front and Back */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UploadSlot
              documentType="NIC_FRONT"
              title="NIC Front Copy"
              subtitle="Clear color photo of NIC front or Passport bio page"
              required={true}
              existingDoc={nicFrontDoc}
            />

            <UploadSlot
              documentType="NIC_BACK"
              title="NIC Back Copy"
              subtitle="Clear color photo of NIC back with address and barcode"
              required={true}
              existingDoc={nicBackDoc}
            />
          </div>
        </div>

        {/* CARD 2: Business Registration (BR) Certificate - Optional */}
        <div className="bg-[#12121c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">2. Business Registration (BR) Certificate</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 font-semibold">
                    Optional / For Registered Entities
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  If organizing under a registered business entity, theatre company, or production studio, upload the certified BR.
                </p>
              </div>
            </div>

            {/* BR Number Input */}
            <form onSubmit={handleSaveDetails} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="BR Number (e.g. PV-00213456)"
                value={brNumberInput}
                onChange={(e) => setBrNumberInput(e.target.value.toUpperCase())}
                className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:border-purple-400 focus:outline-none w-56 sm:w-64"
              />
              <button
                type="submit"
                disabled={savingDetails}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
              >
                {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save BR"}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <UploadSlot
              documentType="BUSINESS_REGISTRATION"
              title="Business Registration (BR) Document"
              subtitle="Department of Registrar of Companies (ROC) certificate (PDF or Image)"
              required={false}
              existingDoc={brDoc}
            />
          </div>
        </div>

        {/* CARD 3: Bank Passbook / Statement Proof - Required */}
        <div className="bg-[#12121c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">3. Bank Passbook / Statement Proof</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                  Required
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Passbook front page, cancelled cheque leaf, or e-statement header showing Account Holder Name, Bank & Branch, and Account Number.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <UploadSlot
              documentType="BANK_PROOF"
              title="Bank Account Proof Document"
              subtitle="Scanned copy or photo of the account holder details (PDF or Image)"
              required={true}
              existingDoc={bankProofDoc}
            />
          </div>
        </div>

        {/* CARD 4: Other Supporting KYC Documents - Optional (Multi-file) */}
        <div className="bg-[#12121c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">4. Other Supporting KYC Documents</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 font-semibold">
                    Optional / Multi-file
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload additional permits, Public Performance Board (PPB) approvals, Venue Booking Letters, or billing utility proofs.
                </p>
              </div>
            </div>
          </div>

          {/* Form to add a new supporting document */}
          <form
            onSubmit={handleCustomUploadSubmit}
            className="p-4 rounded-xl bg-[#161624] border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Document Label / Description <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Venue Booking Confirmation Letter"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Select File (PDF or Image, max 10MB) <span className="text-rose-400">*</span>
              </label>
              <input
                type="file"
                required
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isUploadingCustom || !customFile || !customLabel.trim()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                {isUploadingCustom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* List of Other Supporting KYC files */}
          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Uploaded Supporting Documents ({otherDocs.length})
            </h4>

            {otherDocs.length === 0 ? (
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-500">
                No extra supporting documents uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-[#181826] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                        {isPdf(getDocumentUrl(doc), doc.fileName) ? (
                          <FileText className="w-5 h-5 text-rose-400" />
                        ) : (
                          <img
                            src={getDocumentUrl(doc)}
                            alt={doc.fileName}
                            className="w-full h-full object-cover rounded-lg"
                            crossOrigin="use-credentials"
                            onError={(e) => {
                              const fallback = `${getApiBaseUrl().replace(/\/+$/, "")}/organizer/kyc/documents/${doc.id}/file`;
                              if (e.target.src !== fallback) {
                                e.target.src = fallback;
                              }
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">
                            {doc.customLabel || doc.fileName}
                          </p>
                          {renderStatusBadge(doc.status)}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5" title={doc.fileName}>
                          {doc.fileName} • {formatFileSize(doc.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <a
                        href={getDocumentUrl(doc)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmDoc(doc)}
                        className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121c] border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161622]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{previewDoc.customLabel || getDocTypeTitle(previewDoc.documentType)}</span>
                  {renderStatusBadge(previewDoc.status)}
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-md">{previewDoc.fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getDocumentUrl(previewDoc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-black/50">
              {isPdf(getDocumentUrl(previewDoc), previewDoc.fileName) ? (
                <iframe
                  src={getDocumentUrl(previewDoc)}
                  title={previewDoc.fileName}
                  className="w-full h-[65vh] rounded-xl border border-white/10 bg-white"
                />
              ) : (
                <img
                  src={getDocumentUrl(previewDoc)}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                  crossOrigin="use-credentials"
                  onError={(e) => {
                    const fallback = `${getApiBaseUrl().replace(/\/+$/, "")}/organizer/kyc/documents/${previewDoc.id}/file`;
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Remove KYC Document?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmDoc.fileName}</span>?
                If this is a required verification document, your KYC status will return to Incomplete.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deletingId === deleteConfirmDoc.id}
                onClick={() => setDeleteConfirmDoc(null)}
                className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmDoc.id}
                onClick={() => handleDelete(deleteConfirmDoc.id)}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
              >
                {deletingId === deleteConfirmDoc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Delete Document</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerKycDocuments;
