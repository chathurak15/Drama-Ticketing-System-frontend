"use client";

import React, { useState, useEffect } from "react";
import {
  Theater,
  Box,
  Search,
  Users,
  Layers,
  Sparkles,
  DoorOpen,
  Coffee,
  CheckCircle,
  Eye,
  Shield,
  LayoutGrid,
  List,
} from "lucide-react";
import { getTheatresByUserId } from "../../services/TheatreService";
import { useAuth } from "../../utils/AuthContext";
import Theatre3DModal from "../TheatreManager/Theatre3DModal";

const AdminTheatresContent = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected3dTheatre, setSelected3dTheatre] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const auth = useAuth();

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    setLoading(true);
    setError(null);
    try {
      // In the backend, getTheatresByManager accepts the user id. For Admin, passing auth.user?.id returns the list.
      const res = await getTheatresByUserId(auth.user?.id || 1);
      setTheatres(res.data || []);
    } catch (err) {
      console.error("Failed to load theatres for admin", err);
      setError("Failed to load theatres.");
    } finally {
      setLoading(false);
    }
  };

  const calculateCapacity = (seatTypes) => {
    return seatTypes?.reduce((acc, s) => acc + (s.totalSeats || 0), 0) || 0;
  };

  const filteredTheatres = theatres.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              3D Architecture Inspector
            </span>
            <span className="text-xs text-slate-400">Total: {theatres.length} Registered Halls</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Platform Venues & 3D Audit</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect hall stage configurations, seating capacities, cabaret tables, and emergency exit compliance in real-time 3D.
          </p>
        </div>
      </div>

      {/* Search and View Controls */}
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
            <option value="TEMPORARY">Temporary / Open Area</option>
          </select>

          <div className="flex items-center bg-[#1b1b28] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading platform halls...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Grid Rendering */}
      {!loading && !error && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map((theater) => {
            const cap = theater.totalCapacity || calculateCapacity(theater.seatTypes);
            return (
              <div
                key={theater.id}
                className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all group flex flex-col justify-between"
              >
                <div className="h-40 bg-gradient-to-br from-[#1c141d] via-[#241315] to-[#12121c] p-5 relative border-b border-white/5 flex flex-col justify-between">
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
                      onClick={() => setSelected3dTheatre(theater)}
                      className="flex items-center gap-1.5 bg-[#FED800] hover:bg-[#ffe033] text-black px-3 py-1 rounded-lg text-xs font-bold shadow-lg shadow-[#FED800]/30 transition-all transform group-hover:scale-105"
                    >
                      <Box className="w-3.5 h-3.5" />
                      3D Inspector
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#FED800] transition-colors">
                      {theater.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Venue ID: #{theater.id}</span>
                      <span>•</span>
                      <span>{theater.areaType || "THEATRE"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#FED800]" /> Hall Capacity
                      </div>
                      <div className="text-base font-bold text-white mt-1">
                        {cap.toLocaleString()} <span className="text-[10px] text-slate-400">seats</span>
                      </div>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" /> Tiers Defined
                      </div>
                      <div className="text-base font-bold text-white mt-1">
                        {theater.seatTypes?.length || 1} <span className="text-[10px] text-slate-400">tiers</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                      Configured Categories:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {theater.seatTypes?.map((st, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                        >
                          {st.typeName} ({st.totalSeats || st.seatsPerRow * 2})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5">
                  <button
                    onClick={() => setSelected3dTheatre(theater)}
                    className="w-full flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                  >
                    <Box className="w-3.5 h-3.5 text-[#FED800]" />
                    Inspect 3D Stage & Safety Exits
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Rendering */}
      {!loading && !error && viewMode === "table" && (
        <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Hall Name</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Area Type</th>
                <th className="py-3.5 px-4 font-semibold">Capacity</th>
                <th className="py-3.5 px-4 font-semibold text-right">3D Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTheatres.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-white">{t.name}</td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{t.areaType || "THEATRE"}</td>
                  <td className="py-4 px-4 font-bold text-white">
                    {(t.totalCapacity || calculateCapacity(t.seatTypes)).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelected3dTheatre(t)}
                      className="bg-[#FED800] hover:bg-[#ffe033] text-black px-3 py-1 rounded-lg text-[11px] font-bold"
                    >
                      Inspect in 3D
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3D Modal */}
      {selected3dTheatre && (
        <Theatre3DModal
          theatre={selected3dTheatre}
          isOpen={!!selected3dTheatre}
          onClose={() => setSelected3dTheatre(null)}
        />
      )}
    </div>
  );
};

export default AdminTheatresContent;
