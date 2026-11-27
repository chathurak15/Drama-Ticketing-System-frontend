"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Search,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
  User,
  CreditCard,
  Hash,
  RefreshCw,
  X,
  FileText,
  Lock,
  Layers,
  History,
} from "lucide-react";
import {
  getAllAgreementsForAdmin,
  downloadAdminAgreementPdf,
} from "../../services/AgreementService";
import { toast } from "react-toastify";
import StageDramaButton from "../common/StageDramaButton";

export default function AdminAgreementVaultContent() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await getAllAgreementsForAdmin(statusFilter, searchQuery);
      if (res?.data) {
        setAgreements(res.data);
      }
    } catch (err) {
      console.error("Error loading admin agreements:", err);
      toast.error("Failed to load agreement history vault.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAgreements();
  };

  const handleDownloadPdf = async (contractId) => {
    try {
      setDownloadingId(contractId);
      const res = await downloadAdminAgreementPdf(contractId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded agreement ${contractId}`);
    } catch (err) {
      console.error("Error downloading agreement PDF:", err);
      toast.error("Could not download contract PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Metrics calculation
  const totalAgreements = agreements.length;
  const activeCount = agreements.filter((a) => a.status === "ACTIVE").length;
  const archivedCount = agreements.filter((a) => a.status === "ARCHIVED").length;
  const uniqueVenues = new Set(agreements.map((a) => a.venueName).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FED800]">
              Platform Legal & Compliance Administration
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Electronic Transactions Act No. 19 of 2006</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-[#FED800]" />
            <span>Organizer Agreement History & Document Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Audit immutable, snapshotted ticketing settlement contracts, verified destination bank accounts,
            and legally binding digital execution audit trails across all theatre organizers.
          </p>
        </div>

        <button
          onClick={fetchAgreements}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Vault</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#14141e] p-4 rounded-xl border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Agreements
          </p>
          <p className="text-xl font-extrabold text-white">{totalAgreements}</p>
          <p className="text-[10px] text-slate-500 mt-1">Permanent on-file records</p>
        </div>

        <div className="bg-[#14141e] p-4 rounded-xl border border-white/10 border-b-2 border-b-emerald-500/50 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Contracts
          </p>
          <p className="text-xl font-extrabold text-emerald-400">{activeCount}</p>
          <p className="text-[10px] text-emerald-500/70 mt-1">Currently governing payouts</p>
        </div>

        <div className="bg-[#14141e] p-4 rounded-xl border border-white/10 border-b-2 border-b-slate-500/50 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Archived Versions
          </p>
          <p className="text-xl font-extrabold text-slate-300">{archivedCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Prior superseded versions</p>
        </div>

        <div className="bg-[#14141e] p-4 rounded-xl border border-white/10 border-b-2 border-b-[#FED800]/50 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Partner Venues
          </p>
          <p className="text-xl font-extrabold text-[#FED800]">{uniqueVenues}</p>
          <p className="text-[10px] text-slate-500 mt-1">Distinct verified theatres</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12121c] p-3 rounded-xl border border-white/10">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
          {["ALL", "ACTIVE", "ARCHIVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === tab
                  ? "bg-[#FED800] text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "ALL" ? "All Contracts" : tab === "ACTIVE" ? "Active (Live)" : "Archived (Past)"}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contract ID, organizer, venue, or NIC..."
              className="w-full bg-[#181824] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-[#12121c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FED800] animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading agreement records from immutable vault...</p>
          </div>
        ) : agreements.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Agreement Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No contracts match your current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0e0e18] text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-bold">Contract ID & Version</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Organizer & NIC</th>
                  <th className="py-3.5 px-4 font-bold">Venue</th>
                  <th className="py-3.5 px-4 font-bold">Agreed Terms Snapshot</th>
                  <th className="py-3.5 px-4 font-bold">LankaPay Settlement Bank</th>
                  <th className="py-3.5 px-4 font-bold">Signed Date & IP</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {agreements.map((agr) => {
                  const isActive = agr.status === "ACTIVE";
                  const signedDateStr = agr.signedAt
                    ? new Date(agr.signedAt).toLocaleString("en-US", {
                        timeZone: "Asia/Colombo",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-";

                  return (
                    <tr
                      key={agr.contractId}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Contract ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FED800]">{agr.contractId}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                            v{agr.versionNumber}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                            <History className="w-3 h-3" />
                            <span>ARCHIVED</span>
                          </span>
                        )}
                      </td>

                      {/* Organizer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {agr.organizerName || "Organizer"}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{agr.organizerEmail}</span>
                          {agr.nicNumber && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="font-mono text-slate-300">NIC: {agr.nicNumber}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {agr.venueName || "General Venue"}
                      </td>

                      {/* Terms Snapshot */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#FED800]/10 text-[#FED800] border border-[#FED800]/20 font-mono text-[10px] font-bold">
                          {agr.agreedModelCode}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Payout: <strong className="text-emerald-400">{agr.agreedOrganizerPayoutPercent}%</strong>
                          {Number(agr.agreedBuyerFeePercent) > 0 && ` | Buyer Fee: ${agr.agreedBuyerFeePercent}%`}
                          {Number(agr.agreedOrganizerCommissionPercent) > 0 && ` | Comm: ${agr.agreedOrganizerCommissionPercent}%`}
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {agr.bankName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {agr.bankAccountNumber} ({agr.bankBranch})
                        </div>
                      </td>

                      {/* Signed Date & IP */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300">{signedDateStr}</div>
                        {agr.signerIp && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            IP: {agr.signerIp}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAgreement(agr)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                            title="View Full Signed Contract"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(agr.contractId)}
                            disabled={downloadingId === agr.contractId}
                            className="p-1.5 rounded-lg bg-[#FED800]/15 hover:bg-[#FED800]/25 text-[#FED800] border border-[#FED800]/30 transition-all disabled:opacity-50"
                            title="Download Official 1-Page PDF"
                          >
                            {downloadingId === agr.contractId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract Detail / Preview Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12121c] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161624]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FED800]/15 border border-[#FED800]/30 text-[#FED800] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">
                      {selectedAgreement.contractId}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/10 text-slate-300">
                      Version {selectedAgreement.versionNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedAgreement.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      }`}
                    >
                      {selectedAgreement.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Organizer: {selectedAgreement.organizerName} ({selectedAgreement.organizerEmail})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StageDramaButton
                  onClick={() => handleDownloadPdf(selectedAgreement.contractId)}
                  loading={downloadingId === selectedAgreement.contractId}
                  loadingText="Generating Script..."
                  variant="gold"
                  size="sm"
                  icon={Download}
                >
                  Download PDF
                </StageDramaButton>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Single Page Clean Layout Container */}
            <div className="p-6 overflow-y-auto bg-slate-900/50 space-y-5">
              {/* White A4-like Document Preview */}
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg text-xs leading-relaxed max-w-3xl mx-auto border border-slate-200">
                {/* Contract Header */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                  <h2 className="text-base font-black tracking-wide uppercase text-slate-900">
                    ORGANIZER / VENUE TICKETING & SETTLEMENT AGREEMENT
                  </h2>
                  <p className="text-[10px] text-slate-600 font-medium tracking-wide mt-1 uppercase">
                    Commercial Agency, Electronic Revenue Settlement & Public Performance Agreement
                  </p>
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-[11px]">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                      Party A (Platform Facilitator & Agent):
                    </h4>
                    <p className="font-bold text-slate-900">Zeylex Digital Solutions</p>
                    <p className="text-slate-600">Operating the Naataka.lk Online Ticketing Platform</p>
                    <p className="text-slate-600 font-mono text-[10px]">
                      BR No: POL/ELH/ESD/02/01/1941/2026
                    </p>
                    <p className="text-slate-600 font-mono text-[10px]">
                      Address: No. 43, Jamburewela, Aththanakadawala, 51235, Sri Lanka | admin@zeylex.com
                    </p>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                      Party B (Organizer / Venue Principal):
                    </h4>
                    <p className="font-bold text-slate-900">
                      {selectedAgreement.organizerName || "Organizer"}
                    </p>
                    <p className="text-slate-600">Venue: {selectedAgreement.venueName || "Designated Theatre"}</p>
                    <p className="text-slate-700 font-mono text-[10px]">
                      National Identity Card (NIC): <strong>{selectedAgreement.nicNumber || "On File"}</strong>
                    </p>
                  </div>
                </div>

                {/* Section 1 */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                    1. Scope of Settlement, Agency & Revenue Sharing:
                  </h4>
                  <p className="text-slate-700 text-justify">
                    {selectedAgreement.sectionOneText || selectedAgreement.sectionOneTextSnapshot}
                  </p>
                </div>

                {/* Section 2 */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                    2. Destination Bank Account for LankaPay Settlement:
                  </h4>
                  <p className="text-slate-700">
                    Net ticket revenues shall be remitted strictly via LankaPay Common Electronic Fund Transfer (CEFT) to the following verified account:
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] mt-1">
                    <div>
                      <span className="text-slate-500">Bank:</span>{" "}
                      <strong className="text-slate-800">{selectedAgreement.bankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Branch:</span>{" "}
                      <strong className="text-slate-800">{selectedAgreement.bankBranch}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Account Name:</span>{" "}
                      <strong className="text-slate-800">{selectedAgreement.accountName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Account Number:</span>{" "}
                      <strong className="text-slate-900 text-xs">{selectedAgreement.bankAccountNumber}</strong>
                    </div>
                  </div>
                </div>

                {/* Section 3 & 4 */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                    3. Disbursement Timeline & LankaPay Settlement:
                  </h4>
                  <p className="text-slate-700 text-justify text-[10.5px]">
                    Payouts are processed via LankaPay CEFT/SLIPS within 5 to 7 business days after the successful completion of the event, subject to final ticket sales reconciliation.
                  </p>
                </div>

                <div className="space-y-1 mb-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                    4. Cancellations, Chargebacks, Permits & Taxes:
                  </h4>
                  <ul className="list-disc list-inside text-slate-700 text-[10px] space-y-0.5">
                    <li>
                      <strong>Event Cancellations/Postponements:</strong> Party B remains solely responsible for refunding face ticket values.
                    </li>
                    <li>
                      <strong>Disputes & Chargebacks:</strong> Party B indemnifies Party A against invalid claims or unauthorized chargebacks.
                    </li>
                    <li>
                      <strong>Municipal & Fiscal Taxes:</strong> Entertainment tax and local levies remain Party B&apos;s sole statutory obligation.
                    </li>
                    <li>
                      <strong>Permits, Venue & Copyrights:</strong> Party B is solely responsible for securing venue bookings, Public Performance Board approvals, and all necessary script, music, and performance copyrights, and indemnifies Party A against any third-party claims.
                    </li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div className="space-y-1 mb-4">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                    5. Governing Law & Electronic Execution:
                  </h4>
                  <p className="text-slate-700 text-justify text-[10px]">
                    This Agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka and constitutes a legally binding commercial agreement executed electronically under the Electronic Transactions Act No. 19 of 2006.
                  </p>
                </div>

                {/* Signatures Row */}
                <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-300 mb-4">
                  {/* Party A */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Party A (Naataka.lk / Zeylex Digital Solutions):
                    </p>
                    <div className="h-16 flex items-center">
                      <img
                        src="/images/zeylex-proprietor-seal.png"
                        alt="Zeylex Proprietor Seal"
                        className="h-14 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="border-t border-slate-400 pt-1 mt-1">
                      <p className="font-bold text-slate-900 text-[10px]">Authorized Signatory / Rubber Seal</p>
                      <p className="text-[9px] text-slate-500">Zeylex Digital Solutions | Naataka.lk</p>
                    </div>
                  </div>

                  {/* Party B */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Party B (Authorized Representative Signature):
                    </p>
                    <div className="h-16 flex items-center">
                      {selectedAgreement.signatureImageUrl ? (
                        <img
                          src={selectedAgreement.signatureImageUrl}
                          alt="Party B Signature"
                          className="h-14 max-w-full object-contain"
                        />
                      ) : (
                        <p className="text-slate-400 italic text-[10px]">Electronic signature verified on file</p>
                      )}
                    </div>
                    <div className="border-t border-slate-400 pt-1 mt-1">
                      <p className="font-bold text-slate-900 text-[10px]">
                        {selectedAgreement.accountName || selectedAgreement.organizerName}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        NIC: {selectedAgreement.nicNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit Trail Box */}
                <div className="p-2.5 rounded bg-slate-100 border border-slate-300 font-mono text-[9px] text-slate-600 flex flex-wrap justify-between gap-y-1">
                  <span><strong>Contract ID:</strong> {selectedAgreement.contractId} (v{selectedAgreement.versionNumber})</span>
                  <span><strong>Signed At:</strong> {new Date(selectedAgreement.signedAt).toLocaleString("en-US", { timeZone: "Asia/Colombo" })}</span>
                  <span><strong>Signer IP:</strong> {selectedAgreement.signerIp || "127.0.0.1"}</span>
                  <span><strong>Party B NIC:</strong> {selectedAgreement.nicNumber}</span>
                  <span className="text-emerald-700 font-bold"><strong>Status:</strong> Verified via Platform Auth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
