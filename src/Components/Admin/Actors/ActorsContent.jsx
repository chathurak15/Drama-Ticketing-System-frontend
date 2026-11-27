"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Edit, Trash2, Calendar, Search, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteActor, getActors } from "../../../services/ActorService";
import { getCdnUrl } from "../../../utils/cdn";
import { toast } from "react-toastify";
import ConfirmModal from "../../common/ConfirmModal";

const ActorsContent = ({ setAddType, setShowAddModal, setEditData }) => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    actorId: null,
    actorName: "",
    loading: false,
  });
  const pageSize = 15;
  const BACKEND_IMAGE_URL = `${process.env.NEXT_PUBLIC_CDN_URL || "/uploads"}/actors/`;

  useEffect(() => {
    fetchActors();
  }, [currentPage]);

  const fetchActors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getActors({
        page: currentPage,
        size: pageSize,
        name: searchTerm,
      });

      setActors(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalElements || (response.data.content || []).length);
    } catch (err) {
      console.error("Error fetching actors", err);
      setError("Failed to load actors. Please try again later.");
      toast.error("Failed to load actors.");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (actorId, actorName) => {
    setDeleteModal({
      isOpen: true,
      actorId,
      actorName: actorName || "this actor",
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.actorId) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const response = await deleteActor(deleteModal.actorId);
      toast.success(response?.data || `Actor "${deleteModal.actorName}" deleted successfully.`);
      setDeleteModal({ isOpen: false, actorId: null, actorName: "", loading: false });
      await fetchActors();
    } catch (err) {
      console.error("Error deleting actor:", err);
      toast.error(err?.response?.data?.message || "Failed to delete actor. Check if linked to dramas.");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredActors = actors.filter((actor) => {
    const name = actor.name?.toLowerCase() || "";
    const genderMatch = genderFilter === "All" || actor.gender === genderFilter;
    const searchMatch = name.includes(searchTerm.toLowerCase());
    return searchMatch && genderMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Talent Directory
            </span>
            <span className="text-xs text-slate-400">Total: {totalItems} Cast Members</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Actor Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain the roster of performing artists, cast members, and dramatic biographical details.
          </p>
        </div>

        <button
          onClick={() => {
            if (setEditData) setEditData(null);
            setAddType("actor");
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-[#661F19] to-[#80251e] hover:from-[#7a251e] hover:to-[#962d24] text-white px-5 py-2.5 rounded-xl border border-white/10 shadow-lg shadow-[#661F19]/40 flex items-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FED800]" />
          <span>Add New Actor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#14141e]/60 p-4 rounded-xl border border-white/5">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchActors();
            }}
            className="w-full bg-[#1b1b28] border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading actors roster...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center text-red-400 text-sm">
          <p>{error}</p>
          <button
            onClick={fetchActors}
            className="mt-3 px-4 py-1.5 bg-[#661F19] hover:bg-[#80251e] text-white text-xs rounded-xl transition-all"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Actor Details</th>
                  <th className="py-3.5 px-4 font-semibold">Gender</th>
                  <th className="py-3.5 px-4 font-semibold">Birthday</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActors.length > 0 ? (
                  filteredActors.map((actor) => (
                    <tr key={actor.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              actor.photo
                                ? getCdnUrl(actor.photo, "actors")
                                : "/images/default.png"
                            }
                            alt={actor.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/default.png";
                            }}
                            className="w-10 h-10 rounded-full object-cover border border-[#FED800]/30 shadow"
                          />
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {actor.name}
                            </div>
                            <div className="text-[10px] text-slate-500">ID #{actor.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            actor.gender === "Male"
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              : actor.gender === "Female"
                              ? "bg-pink-500/15 text-pink-300 border-pink-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {actor.gender || "Not Specified"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center text-slate-300 gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FED800]" />
                          <span>
                            {actor.birthday
                              ? new Date(actor.birthday).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              if (setEditData) setEditData(actor);
                              setAddType("actor");
                              setShowAddModal(true);
                            }}
                            className="p-1.5 bg-[#FED800]/10 hover:bg-[#FED800]/20 text-[#FED800] rounded-lg border border-[#FED800]/20 transition-all"
                            title="Edit Actor"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestDelete(actor.id, actor.name)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all cursor-pointer"
                            title="Delete Actor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500">
                      No actors found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 bg-[#171722] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Showing page <span className="text-white font-semibold">{currentPage + 1}</span> of{" "}
                <span className="text-white font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1 border border-white/10 ${
                    currentPage === 0
                      ? "bg-white/5 text-slate-600 cursor-not-allowed"
                      : "bg-[#1b1b28] text-slate-300 hover:text-white hover:border-[#FED800]/40"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1 border border-white/10 ${
                    currentPage === totalPages - 1
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

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Remove Actor"
        message={`Are you sure you want to remove "${deleteModal.actorName}" from the system? This action cannot be undone.`}
        confirmText="Remove Actor"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          !deleteModal.loading &&
          setDeleteModal({ isOpen: false, actorId: null, actorName: "", loading: false })
        }
      />
    </div>
  );
};

export default ActorsContent;
