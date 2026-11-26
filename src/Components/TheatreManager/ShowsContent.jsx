"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Calendar,
  Trash2,
  Clock,
  MapPin,
  Theater,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  DoorOpen,
  Armchair,
  Ticket,
  Link as LinkIcon,
} from "lucide-react";
import { getShowsByUser, deleteShow } from "../../services/ShowService.js";
import { getCdnUrl } from "../../utils/cdn.js";
import { useAuth } from "../../utils/AuthContext.jsx";

const ShowsContent = ({ setAddType, setShowAddModal, setEditData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const userId = useAuth().user?.id;
  const pageSize = 10;
  const BACKEND_IMAGE_URL = `${import.meta.env.VITE_CDN_URL}/shows/`;

  useEffect(() => {
    fetchShows();
  }, [currentPage, statusFilter]);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (statusFilter === "") {
        response = await getShowsByUser({
          page: currentPage,
          size: pageSize,
          userId: userId,
        });
      } else {
        response = await getShowsByUser({
          page: currentPage,
          size: pageSize,
          status: statusFilter,
          userId: userId,
        });
      }

      setShows(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError("Invalid email or session credentials");
        } else if (status === 404) {
          setShows([]);
          setTotalPages(1);
        } else if (status === 500) {
          setError("Server error. Please try again later");
        } else {
          setError("Failed to fetch shows");
        }
      } else {
        setError("An unexpected network error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (showId) => {
    if (deleteConfirm === showId) {
      try {
        const response = await deleteShow(showId, userId);
        toast.success(response.data || "Show deleted successfully");
        setDeleteConfirm(null);
        fetchShows();
      } catch (err) {
        toast.error("Failed to delete show.");
        setDeleteConfirm(null);
      }
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

  const handleCopyShowUrl = (show, e) => {
    e.stopPropagation();
    const slugOrId = show.slug || show.showId;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nataka.lk";
    const fullUrl = `${origin}/show/${slugOrId}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      toast.success("Show public URL copied to clipboard!");
    }
  };

  // Format 24h string to 12h AM/PM
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

  // Parse multi-slot showtimes
  const getParsedTimeSlots = (show) => {
    if (show.showTimes && typeof show.showTimes === "string") {
      const slots = show.showTimes.split(",").map((t) => t.trim()).filter(Boolean);
      if (slots.length > 0) return slots;
    }
    return show.showTime ? [show.showTime] : [];
  };

  if (loading && shows.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading show schedules &amp; productions...</p>
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
      show.city?.cityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.drama?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approvedCount = shows.filter((s) => s.status?.toLowerCase() === "approved").length;
  const pendingCount = shows.filter((s) => s.status?.toLowerCase() === "pending").length;
  const rejectedCount = shows.filter((s) => s.status?.toLowerCase() === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Production Management
            </span>
            <span className="text-xs text-slate-400">Total: {shows.length} Listed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Show Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Schedule stage performances, monitor review approvals, configure multi-slot showtimes, and manage venue doors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditData(null);
              setAddType("show");
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#661F19] to-[#8B1E1E] hover:from-[#7e251e] hover:to-[#a12323] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#661F19]/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Show</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-white/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
            <Theater className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Shows</p>
            <p className="text-xl font-black text-white">{shows.length}</p>
          </div>
        </div>

        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-emerald-400/60 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Approved</p>
            <p className="text-xl font-black text-emerald-400">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-amber-400/60 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Pending</p>
            <p className="text-xl font-black text-amber-300">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-[#14141e] border border-white/10 border-b-2 border-b-rose-400/60 rounded-xl p-4 flex items-center gap-3">
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
            placeholder="Search shows by title, drama, venue, city, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1b28] border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto bg-[#1b1b28] border border-white/10 text-xs font-medium text-slate-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-[#FED800] appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={fetchShows}
            className="p-2.5 bg-[#1b1b28] hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shows Table Container */}
      <div className="bg-[#14141e] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b1b28] text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 w-20">Poster</th>
                <th className="py-3.5 px-4">Show, Drama &amp; Slug</th>
                <th className="py-3.5 px-4">Date &amp; Timeslots</th>
                <th className="py-3.5 px-4">Venue &amp; Seating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShows.length > 0 ? (
                filteredShows.map((show) => {
                  const timeSlots = getParsedTimeSlots(show);
                  const isReserved = Boolean(show.theatre || show.theatreId);

                  return (
                    <tr
                      key={show.showId}
                      className="hover:bg-white/[0.02] transition-colors group hover:shadow-[inset_3px_0_0_#FED800]"
                    >
                      {/* Poster Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-14 h-16 rounded-xl overflow-hidden border border-white/10 bg-[#1b1b28] shadow-sm flex items-center justify-center flex-shrink-0">
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

                      {/* Show, Drama & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white group-hover:text-[#FED800] transition-colors">
                            {show.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {show.drama?.title && (
                              <span className="text-[11px] font-semibold text-amber-300 bg-[#661F19]/30 border border-[#661F19]/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Theater className="w-3 h-3 text-amber-400" />
                                {show.drama.title}
                              </span>
                            )}
                          </div>
                          {/* SEO Slug & Share Pill */}
                          {show.slug && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <span className="truncate max-w-[170px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                /{show.slug}
                              </span>
                              <button
                                onClick={(e) => handleCopyShowUrl(show, e)}
                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                                title="Copy public show link"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Date & Showtime Slots */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center text-slate-200 font-semibold">
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

                          {/* Time Slots Chips */}
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {timeSlots.map((slot, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-300"
                              >
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>{formatSlot(slot)}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Venue & Seating Model */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center text-white font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#FED800] mr-1.5 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{show.location}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {show.city?.cityName && (
                              <span className="text-[10px] font-semibold text-[#FED800] bg-[#FED800]/10 border border-[#FED800]/30 px-2 py-0.5 rounded">
                                {show.city.cityName}
                              </span>
                            )}

                            {isReserved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                                <Armchair className="w-3 h-3" />
                                <span>Reserved (Hall Map)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded">
                                <Ticket className="w-3 h-3" />
                                <span>General Admission</span>
                              </span>
                            )}
                          </div>

                          {show.theatre?.doorDetails && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <DoorOpen className="w-3 h-3 text-amber-400" />
                              <span className="truncate max-w-[180px]">{show.theatre.doorDetails}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {deleteConfirm === show.showId ? (
                            <>
                              <button
                                onClick={() => handleDelete(show.showId)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 border border-rose-500 transition-all text-[11px] font-bold"
                                title="Confirm delete"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10 transition-all text-[11px] font-semibold"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleView(show)}
                                className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all hover:scale-105"
                                title="View public show page"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleCopyShowUrl(show, e)}
                                className="p-2 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-all hover:scale-105"
                                title="Copy public show link"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditData(show);
                                  setAddType("show");
                                  setShowAddModal(true);
                                }}
                                className="p-2 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-all hover:scale-105"
                                title="Edit show details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(show.showId)}
                                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all hover:scale-105"
                                title="Delete show"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Theater className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-300">No shows found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? "Try clearing your search query or changing status filters."
                        : "Click 'Add Show' to schedule your first drama performance."}
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
                    : "bg-[#1b1b28] text-slate-300 hover:text-white hover:bg-white/10"
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
                    : "bg-[#1b1b28] text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowsContent;
