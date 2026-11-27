"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Search, Edit, Trash2, Clock, Star, Sparkles, Play, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { getDramas, deleteDrama } from "../../services/dramaService";
import { getCdnUrl } from "../../utils/cdn";
import ConfirmModal from "../common/ConfirmModal";

const DramasContent = ({ setAddType, setShowAddModal, setEditData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    dramaId: null,
    dramaTitle: "",
    loading: false,
  });
  const pageSize = 15;

  const BACKEND_IMAGE_URL = `${process.env.NEXT_PUBLIC_CDN_URL || "/uploads"}/dramas/`;

  useEffect(() => {
    fetchDramas();
  }, [currentPage]);

  const fetchDramas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDramas({
        page: currentPage,
        size: pageSize,
        title: "",
        sortByRating: "desc",
      });

      setDramas(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalElements || (response.data.content || []).length);
    } catch (err) {
      console.error("Error fetching dramas", err);
      setError("Failed to load dramas. Please try again later.");
      toast.error("Failed to load dramas.");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (dramaId, dramaTitle) => {
    setDeleteModal({
      isOpen: true,
      dramaId,
      dramaTitle: dramaTitle || `Drama #${dramaId}`,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.dramaId) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const response = await deleteDrama(deleteModal.dramaId);
      toast.success(response?.data || `Drama "${deleteModal.dramaTitle}" deleted successfully.`);
      setDeleteModal({ isOpen: false, dramaId: null, dramaTitle: "", loading: false });
      await fetchDramas();
    } catch (err) {
      console.error("Error deleting drama", err);
      toast.error(err?.response?.data?.message || "Failed to delete drama. Check if active shows exist.");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredDramas = dramas.filter(
    (drama) =>
      (drama.title && drama.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (drama.description && drama.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Stage Repertoire
            </span>
            <span className="text-xs text-slate-400">Total: {totalItems} Master Productions</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Drama Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curate theatrical productions, synopsis details, running durations, and multimedia trailers.
          </p>
        </div>

        <button
          onClick={() => {
            if (setEditData) setEditData(null);
            setAddType("drama");
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-[#661F19] to-[#80251e] hover:from-[#7a251e] hover:to-[#962d24] text-white px-5 py-2.5 rounded-xl border border-white/10 shadow-lg shadow-[#661F19]/40 flex items-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FED800]" />
          <span>Add New Drama</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#14141e]/60 p-4 rounded-xl border border-white/5">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dramas by title or keywords in synopsis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1b28] border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
          />
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading drama catalog...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center text-red-400 text-sm">
          <p>{error}</p>
          <button
            onClick={fetchDramas}
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
                  <th className="py-3.5 px-4 font-semibold">Drama Production</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Rating</th>
                  <th className="py-3.5 px-4 font-semibold">Media Trailer</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDramas.length > 0 ? (
                  filteredDramas.map((drama) => (
                    <tr key={drama.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              drama.image
                                ? getCdnUrl(drama.image, "dramas")
                                : "/images/default.png"
                            }
                            alt={drama.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/default.png";
                            }}
                            className="w-16 h-12 rounded-lg object-cover border border-white/10 shadow"
                          />
                          <div className="max-w-md">
                            <div className="font-bold text-white text-sm">
                              {drama.title}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {drama.description}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">ID #{drama.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-[#FED800]" />
                          <span className="font-semibold text-xs">
                            {drama.duration ? `${Math.floor(drama.duration / 60)}h ${drama.duration % 60}m` : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 bg-[#FED800]/10 border border-[#FED800]/20 px-2.5 py-1 rounded-full w-fit">
                          <Star className="w-3.5 h-3.5 fill-[#FED800] text-[#FED800]" />
                          <span className="font-bold text-xs text-[#FED800]">
                            {typeof drama.rating === "number" ? drama.rating.toFixed(1) : "5.0"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {drama.videoUrl ? (
                          <a
                            href={drama.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Watch Trailer</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">No trailer</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              if (setEditData) setEditData(drama);
                              setAddType("drama");
                              setShowAddModal(true);
                            }}
                            className="p-1.5 bg-[#FED800]/10 hover:bg-[#FED800]/20 text-[#FED800] rounded-lg border border-[#FED800]/20 transition-all"
                            title="Edit Drama"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestDelete(drama.id, drama.title)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all cursor-pointer"
                            title="Delete Drama"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      No dramas found matching your criteria.
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
        title="Delete Drama Production"
        message={`Are you sure you want to delete "${deleteModal.dramaTitle}"? This will remove the production details and related metadata.`}
        confirmText="Delete Drama"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          !deleteModal.loading &&
          setDeleteModal({ isOpen: false, dramaId: null, dramaTitle: "", loading: false })
        }
      />
    </div>
  );
};

export default DramasContent;
