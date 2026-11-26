"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Box,
  LayoutGrid,
  List,
  Users,
  Calendar,
  Layers,
  Sparkles,
  DoorOpen,
  Coffee,
  CheckCircle2,
  Theater,
} from "lucide-react";
import AddTheatre from "./AddTheatre";
import Theatre3DModal from "./Theatre3DModal";
import { getTheatresByUserId, deleteTheatre } from "../../services/TheatreService";
import { useAuth } from "../../utils/AuthContext";

const TheatresContent = ({ onNavigateToBuilder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const userId = useAuth().user?.id;
  const [showAddTheatre, setShowAddTheatre] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [preview3dTheatre, setPreview3dTheatre] = useState(null);

  useEffect(() => {
    fetchTheaters();
  }, [statusFilter]);

  const fetchTheaters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTheatresByUserId(userId);
      setTheaters(response.data || []);
    } catch (err) {
      console.error("Error fetching theaters", err);
      setError("Failed to load theatres. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (theaterId) => {
    if (window.confirm("Are you sure you want to delete this theatre? This cannot be undone.")) {
      try {
        const response = await deleteTheatre(theaterId, userId);
        toast.success(response.data || "Theatre deleted successfully.");
        fetchTheaters();
      } catch (err) {
        console.error("Error deleting theater", err);
        toast.error("Failed to delete theater.");
      }
    }
  };

  const handleEdit = (theater) => {
    setEditingTheatre(theater);
    setShowAddTheatre(true);
  };

  const handleTheatreSuccess = () => {
    setShowAddTheatre(false);
    setEditingTheatre(null);
    fetchTheaters();
  };

  const calculateTotalCapacity = (seatTypes) => {
    return seatTypes?.reduce((total, s) => total + (s.totalSeats || 0), 0) || 0;
  };

  const filteredTheaters = theaters.filter(
    (theater) =>
      theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If in Add/Edit mode, show the full 3D customizer studio
  if (showAddTheatre) {
    return (
      <AddTheatre
        theatreToEdit={editingTheatre}
        onSuccess={handleTheatreSuccess}
        onCancel={() => {
          setShowAddTheatre(false);
          setEditingTheatre(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Venues & Halls
            </span>
            <span className="text-xs text-slate-400">Total: {theaters.length} Halls</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Theatre Hall Architecture</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Design, customize seats, dining tables, emergency doors, and preview in real-time 3D.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingTheatre(null);
              setShowAddTheatre(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FED800] to-[#e6c400] hover:from-[#ffe033] hover:to-[#ffd000] text-black px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#FED800]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Setup New 3D Hall
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#14141e]/60 p-4 rounded-xl border border-white/5">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search theatres by hall name or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1b28] border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
          >
            <option value="">All Statuses</option>
            <option value="PERMANENT">Permanent Halls</option>
            <option value="TEMPORARY">Temporary / Outdoor</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#1b1b28] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading theatre halls...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchTheaters}
            className="px-4 py-2 bg-[#661F19] hover:bg-[#80251e] text-white text-xs font-semibold rounded-lg shadow"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Content Rendering */}
      {!loading && !error && filteredTheaters.length === 0 && (
        <div className="py-16 text-center bg-[#14141e]/50 border border-white/5 rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FED800]/10 border border-[#FED800]/30 flex items-center justify-center mx-auto text-[#FED800]">
            <Theater className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Theatre Halls Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have not configured any theatre halls yet. Launch the 3D Layout Studio to setup your first hall with seats, dining tables, and emergency doors!
          </p>
          <button
            onClick={() => {
              setEditingTheatre(null);
              setShowAddTheatre(true);
            }}
            className="px-5 py-2.5 bg-[#FED800] text-black rounded-xl text-xs font-bold shadow-lg shadow-[#FED800]/20"
          >
            Launch 3D Studio Now
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* GRID VIEW                                                */}
      {/* ======================================================== */}
      {!loading && !error && viewMode === "grid" && filteredTheaters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheaters.map((theater) => {
            const cap = theater.totalCapacity || calculateTotalCapacity(theater.seatTypes);
            return (
              <div
                key={theater.id}
                className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all group flex flex-col justify-between"
              >
                {/* Card Banner with 3D Visualizer Aesthetic */}
                <div className="h-40 bg-gradient-to-br from-[#1a131b] via-[#241315] to-[#12121c] p-5 relative border-b border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        theater.status === "PERMANENT"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {theater.status}
                    </span>

                    <button
                      onClick={() => setPreview3dTheatre(theater)}
                      className="flex items-center gap-1.5 bg-[#FED800] hover:bg-[#ffe033] text-black px-3 py-1 rounded-lg text-xs font-bold shadow-lg shadow-[#FED800]/30 transition-all transform group-hover:scale-105"
                    >
                      <Box className="w-3.5 h-3.5" />
                      View in 3D
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#FED800] transition-colors">
                      {theater.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>ID: #{theater.id}</span>
                      <span>•</span>
                      <span>{theater.areaType || "THEATRE"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body & Specs */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#FED800]" /> Total Capacity
                      </div>
                      <div className="text-base font-bold text-white mt-1">
                        {cap.toLocaleString()} <span className="text-[10px] text-slate-400">seats</span>
                      </div>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" /> Seating Tiers
                      </div>
                      <div className="text-base font-bold text-white mt-1">
                        {theater.seatTypes?.length || 1} <span className="text-[10px] text-slate-400">tiers</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Types Pills */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                      Configured Categories:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {theater.seatTypes && theater.seatTypes.length > 0 ? (
                        theater.seatTypes.map((st, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                          >
                            {st.typeName} ({st.totalSeats || st.seatsPerRow * 2})
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500">Standard Tiering</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleEdit(theater)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FED800]" />
                    Customize & Edit
                  </button>

                  <button
                    onClick={() => handleDelete(theater.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors"
                    title="Delete Theatre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TABLE VIEW                                               */}
      {/* ======================================================== */}
      {!loading && !error && viewMode === "table" && filteredTheaters.length > 0 && (
        <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Hall Name</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Area Type</th>
                  <th className="py-3.5 px-4 font-semibold">Capacity</th>
                  <th className="py-3.5 px-4 font-semibold">Tier Breakdown</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTheaters.map((theater) => {
                  const cap = theater.totalCapacity || calculateTotalCapacity(theater.seatTypes);
                  return (
                    <tr key={theater.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#661F19]/40 border border-[#661F19] flex items-center justify-center text-[#FED800]">
                          <Theater className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{theater.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">ID #{theater.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            theater.status === "PERMANENT"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {theater.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{theater.areaType || "THEATRE"}</td>
                      <td className="py-4 px-4 font-bold text-white">{cap.toLocaleString()} seats</td>
                      <td className="py-4 px-4 text-slate-400">
                        {theater.seatTypes?.map((s) => s.typeName).join(", ") || "Standard"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreview3dTheatre(theater)}
                            className="flex items-center gap-1 bg-[#FED800] hover:bg-[#ffe033] text-black px-2.5 py-1 rounded-lg font-bold text-[11px]"
                          >
                            <Box className="w-3.5 h-3.5" /> 3D View
                          </button>
                          <button
                            onClick={() => handleEdit(theater)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(theater.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3D Preview Modal */}
      {preview3dTheatre && (
        <Theatre3DModal
          theatre={preview3dTheatre}
          isOpen={!!preview3dTheatre}
          onClose={() => setPreview3dTheatre(null)}
        />
      )}
    </div>
  );
};

export default TheatresContent;
