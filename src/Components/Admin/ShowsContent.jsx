"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Theater,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  Armchair,
  Ticket,
  Lock,
  RotateCcw,
  AlertTriangle,
  X,
  Edit3,
} from "lucide-react";
import { getShowsAdmin, updateShowStatus, updateShowStatusAdmin } from "../../services/ShowService.js";
import { getCdnUrl } from "../../utils/cdn";

const ShowsContent = ({ setAddType, setShowAddModal, setEditData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;
  const BACKEND_IMAGE_URL = `${import.meta.env.VITE_CDN_URL}/shows/`;

  // Cancel / Postpone Modal State
  const [statusModalShow, setStatusModalShow] = useState(null);
  const [newStatusChoice, setNewStatusChoice] = useState("CANCELLED");
  const [statusReason, setStatusReason] = useState("");
  const [postponedDate, setPostponedDate] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusReason.trim()) {
      toast.warn("Please enter a reason for cancelling or postponing the show.");
      return;
    }
    if (newStatusChoice === "POSTPONED" && !postponedDate) {
      toast.warn("Please select the tentative rescheduled date for the postponed show.");
      return;
    }
    setSubmittingStatus(true);
    try {
      await updateShowStatusAdmin(statusModalShow.showId, {
        status: newStatusChoice,
        reason: statusReason.trim(),
        newDate: newStatusChoice === "POSTPONED" ? postponedDate : null,
      });
      toast.success(`Show successfully marked as ${newStatusChoice}. Buyer notifications sent and organizer payout balance frozen.`);
      setShows((prev) =>
        prev.map((s) => (s.showId === statusModalShow.showId ? { ...s, status: newStatusChoice.toLowerCase(), cancellationReason: statusReason } : s))
      );
      setStatusModalShow(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to update show status.";
      toast.error(typeof msg === "string" ? msg : "Failed to update show status.");
    } finally {
      setSubmittingStatus(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [currentPage, statusFilter]);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getShowsAdmin({
        page: currentPage,
        size: pageSize,
        status: statusFilter,
      });

      setShows(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching shows", err);
      setError("Failed to load shows. Please try again later.");
      toast.error("Failed to load shows.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAction = async (showId, action) => {
    try {
      await updateShowStatus({ id: showId, status: action });

      // Optimistic UI update
      setShows(
        shows.map((show) =>
          show.showId === showId ? { ...show, status: action } : show
        )
      );

      toast.success(`Show ${action} successfully!`);
    } catch (err) {
      console.error("Error updating show status", err);
      setError("Failed to update show status");
      toast.error("Failed to update status");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleView = (show) => {
    const slugOrId = typeof show === "object" ? (show.slug || show.showId) : show;
    window.open(`/show/${slugOrId}`, "_blank");
  };

  const handleCopyShowUrl = (show) => {
    const slugOrId = show.slug || show.showId;
    const url = `${window.location.origin}/show/${slugOrId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Show URL copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy URL.");
    });
  };

  if (loading && shows.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading all production records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 font-medium mb-3">{error}</p>
          <button
            onClick={fetchShows}
            className="px-4 py-2 bg-[#661F19] text-white rounded-xl hover:bg-[#541612] text-sm font-semibold transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredShows = shows.filter(
    (show) =>
      show.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (show.user?.fname + " " + show.user?.lname)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      show.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.city?.cityName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSlot = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1].slice(0, 2);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const getParsedTimeSlots = (show) => {
    if (show.showTimes && typeof show.showTimes === "string") {
      const slots = show.showTimes.split(",").map((t) => t.trim()).filter(Boolean);
      if (slots.length > 0) return slots;
    }
    return show.showTime ? [show.showTime] : [];
  };

  const approvedCount = shows.filter((s) => s.status === "approved").length;
  const pendingCount = shows.filter((s) => s.status === "pending").length;
  const rejectedCount = shows.filter((s) => s.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Admin Moderation
            </span>
            <span className="text-xs text-slate-400">Total: {shows.length} Listed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Show Management & Approvals
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Review submitted theatre show listings, inspect schedules, and approve or reject submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchShows}
            className="p-2.5 bg-[#1b1b28] hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Shows */}
        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-slate-500 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
            <Theater className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Shows</p>
            <p className="text-xl font-black text-white">{shows.length}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-amber-400 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Pending Review</p>
            <p className="text-xl font-black text-amber-300">{pendingCount}</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-emerald-400 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Approved</p>
            <p className="text-xl font-black text-emerald-400">{approvedCount}</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-rose-400 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Rejected</p>
            <p className="text-xl font-black text-rose-400">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1b1b28] p-4 rounded-xl border border-white/10">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shows by title, organizer, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#14141e] border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto bg-[#14141e] border border-white/10 text-xs font-medium text-slate-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-[#FED800] appearance-none"
            >
              <option value="all">All Moderation Status</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shows Table */}
      <div className="bg-[#14141e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b1b28] text-slate-400 font-semibold uppercase tracking-wider border-b-2 border-b-[#FED800]/30">
              <tr>
                <th className="py-4 px-4 w-20">Banner</th>
                <th className="py-4 px-4">Show & Title</th>
                <th className="py-4 px-4">Organizer</th>
                <th className="py-4 px-4">Date & Time</th>
                <th className="py-4 px-4">Venue</th>
                <th className="py-4 px-4">Drama</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShows.length > 0 ? (
                filteredShows.map((show) => (
                  <tr
                    key={show.showId}
                    className="hover:bg-white/[0.03] transition-all duration-150 group hover:shadow-[inset_3px_0_0_#FED800]"
                  >
                    {/* Banner */}
                    <td className="py-3 px-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/10 bg-[#1b1b28] shadow-sm flex items-center justify-center flex-shrink-0">
                        {show.image ? (
                          <img
                            src={getCdnUrl(show.image, "shows")}
                            alt={show.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Theater className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                    </td>

                    {/* Show Title & Slug */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white group-hover:text-[#FED800] transition-colors">
                          {show.title}
                        </div>
                        {show.slug && (
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[130px] inline-block text-[11px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              /{show.slug}
                            </span>
                            <button
                              onClick={() => handleCopyShowUrl(show)}
                              className="p-1 rounded bg-white/5 hover:bg-[#FED800]/10 border border-white/10 hover:border-[#FED800]/30 text-slate-500 hover:text-[#FED800] transition-all hover:-translate-y-0.5"
                              title="Copy show URL"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Organizer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center text-slate-300 font-medium">
                        <User className="w-3.5 h-3.5 text-[#FED800] mr-1.5 flex-shrink-0" />
                        <span>
                          {show.user ? `${show.user.fname} ${show.user.lname}` : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-slate-200 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#FED800] mr-1.5 flex-shrink-0" />
                          <span>
                            {new Date(show.showDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getParsedTimeSlots(show).map((slot, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-300"
                            >
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{formatSlot(slot)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Venue & City */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-white font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#FED800] mr-1.5 flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{show.location}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {show.city?.cityName && (
                            <span className="inline-block text-[10px] font-semibold text-[#FED800] bg-[#FED800]/10 border border-[#FED800]/20 px-2 py-0.5 rounded">
                              {show.city.cityName}
                            </span>
                          )}
                          {show.theatre ? (
                            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              Reserved Map
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded">
                              General Admission
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Drama */}
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs">
                        {show.drama?.title || "N/A"}
                      </span>
                    </td>

                    {/* Status */}
                    <td
                      className={`py-3 px-4 ${
                        show.status === "approved"
                          ? "border-l-2 border-l-emerald-400"
                          : show.status === "pending"
                          ? "border-l-2 border-l-amber-400"
                          : "border-l-2 border-l-rose-400"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          show.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : show.status === "pending"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            show.status === "approved"
                              ? "bg-emerald-400 animate-pulse"
                              : show.status === "pending"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-rose-400"
                          }`}
                        />
                        {show.status?.charAt(0).toUpperCase() + show.status?.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(show)}
                          className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all hover:scale-105 hover:-translate-y-0.5"
                          title="Preview public show page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {setEditData && (
                          <button
                            onClick={() => {
                              setEditData(show);
                              setAddType("show");
                              setShowAddModal(true);
                            }}
                            className="p-2 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-all hover:scale-105 hover:-translate-y-0.5"
                            title="Edit show details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {show.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleShowAction(show.showId, "approved")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(52,211,153,0.15)]"
                              title="Approve show"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleShowAction(show.showId, "rejected")}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(251,113,133,0.15)]"
                              title="Reject show"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {(show.status?.toLowerCase() === "approved" || show.status?.toLowerCase() === "active") && (
                          <button
                            onClick={() => {
                              setStatusModalShow(show);
                              setNewStatusChoice("CANCELLED");
                              setStatusReason("");
                              setPostponedDate("");
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-bold text-xs flex items-center gap-1 transition-all hover:scale-105"
                            title="Cancel or Postpone Show (Freezes Payouts & Notifies Buyers)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cancel/Postpone</span>
                          </button>
                        )}

                        {(show.status?.toLowerCase() === "cancelled" || show.status?.toLowerCase() === "canceled") && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border bg-rose-500/15 text-rose-400 border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>CANCELLED</span>
                          </span>
                        )}

                        {show.status?.toLowerCase() === "postponed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border bg-amber-500/15 text-amber-300 border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            <span>POSTPONED</span>
                          </span>
                        )}

                        {show.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold border bg-rose-500/10 text-rose-500 border-rose-500/20">
                            <Lock className="w-3 h-3" />
                            <span>Closed</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <Theater className="w-14 h-14 text-slate-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-300">No shows found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No shows match the selected moderation status or search criteria.
                    </p>
                    <p className="text-xs text-[#FED800]/60 mt-2 font-medium">
                      Pending shows awaiting your review will appear here - check the approval queue.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#1b1b28]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Showing page <span className="font-bold text-white">{currentPage + 1}</span> of{" "}
              <span className="font-bold text-white">{totalPages}</span> • {shows.length} shows listed
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all ${
                  currentPage === 0
                    ? "bg-white/5 text-slate-600 cursor-not-allowed"
                    : "bg-[#1b1b28] text-slate-300 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={`px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all ${
                  currentPage === totalPages - 1
                    ? "bg-white/5 text-slate-600 cursor-not-allowed"
                    : "bg-[#1b1b28] text-slate-300 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Cancel / Postpone Show Modal */}
      {statusModalShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/15 bg-[#14141e] text-white shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span>Cancel / Postpone Show</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Updates public status, freezes organizer payouts & notifies buyers
                </p>
              </div>
              <button
                onClick={() => setStatusModalShow(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Show Info */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Show Title:</span>
                <span className="font-bold text-white">{statusModalShow.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Drama:</span>
                <span className="text-slate-300">{statusModalShow.drama?.title || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Venue:</span>
                <span className="text-slate-300">
                  {new Date(statusModalShow.showDate).toLocaleDateString()} • {statusModalShow.location}
                </span>
              </div>
            </div>

            {/* Payout Freeze Warning */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Automated Payout Freeze & Buyer Notification</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Marking this show as Cancelled or Postponed will immediately exclude all associated bookings from the organizer's available payout balance, dispatch email alerts to all confirmed ticket holders, and enable buyer refund requests.
              </p>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Status *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStatusChoice("CANCELLED")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      newStatusChoice === "CANCELLED"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>CANCELLED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatusChoice("POSTPONED")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      newStatusChoice === "POSTPONED"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>POSTPONED</span>
                  </button>
                </div>
              </div>

              {newStatusChoice === "POSTPONED" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tentative Rescheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={postponedDate}
                    onChange={(e) => setPostponedDate(e.target.value)}
                    className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Cancellation / Postponement *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Inclement weather conditions / Actor illness / Venue maintenance"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full bg-[#1b1b28] border border-white/10 text-xs text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalShow(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {submittingStatus ? "Processing..." : `Confirm ${newStatusChoice}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowsContent;
