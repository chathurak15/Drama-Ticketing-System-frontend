"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Box,
  TrendingUp,
  Theater,
  Ticket,
  ChevronRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { getShowsByUser } from "../../services/ShowService";
import { getTheatresByUserId } from "../../services/TheatreService";
import { useAuth } from "../../utils/AuthContext";
import Theatre3DModal from "./Theatre3DModal";

const DashboardContent = ({ setActiveTab, setAddType, setShowAddModal }) => {
  const [shows, setShows] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview3dTheatre, setPreview3dTheatre] = useState(null);
  const user = useAuth().user;

  // Real-time calculated / simulated stats
  const stats = {
    totalBookings: 1240,
    activeShowsCount: shows.length || 4,
    totalRevenueLKR: 875000,
    hallOccupancy: 86.4,
    monthlyGrowth: 14.8,
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [showsRes, theatresRes] = await Promise.allSettled([
        getShowsByUser({ page: 0, size: 8, userId: user?.id }),
        getTheatresByUserId(user?.id),
      ]);

      if (showsRes.status === "fulfilled") {
        setShows(showsRes.value?.data?.content || []);
      }
      if (theatresRes.status === "fulfilled") {
        setTheatres(theatresRes.value?.data || []);
      }
    } catch (err) {
      console.error("Dashboard error", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Initializing Theatre Operations Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#181824] via-[#241315] to-[#181824] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Theatre Operations
            </span>
            <span className="text-xs text-slate-400">Welcome, {user?.username || "Manager"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Theatre Operations & 3D Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Manage your permanent halls, design customized seat & dining table layouts, inspect emergency exits in 3D, and track live show ticket sales.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab && setActiveTab("theatre-builder")}
            className="flex items-center gap-2 bg-[#FED800] hover:bg-[#ffe033] text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#FED800]/30 transition-all transform hover:-translate-y-0.5"
          >
            <Box className="w-4 h-4" />
            Launch 3D Hall Studio
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab("shows")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Manage Shows
          </button>
        </div>

        {/* Background glow decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#661F19]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-[#FED800]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Bookings */}
        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Ticket Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">{stats.totalBookings.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +{stats.monthlyGrowth}% from last month
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Includes VIP, Standard & Table bookings</div>
        </div>

        {/* Active Theatres & Halls */}
        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Theatres & Halls
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FED800]/10 border border-[#FED800]/30 flex items-center justify-center text-[#FED800]">
              <Theater className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">{theatres.length || 3} Halls</div>
            <div className="text-[11px] text-[#FED800] font-semibold flex items-center gap-1 mt-1">
              <Box className="w-3.5 h-3.5" />
              All Halls Configured in 3D
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Click to view any hall in real-time 3D</div>
        </div>

        {/* Hall Occupancy Rate */}
        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Hall Occupancy
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">{stats.hallOccupancy}%</div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-[#FED800] h-full rounded-full"
                style={{ width: `${stats.hallOccupancy}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">High efficiency theatrical utilization</div>
        </div>

        {/* Revenue */}
        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Box Office
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">
              LKR {stats.totalRevenueLKR.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Confirmed Gate & Pre-sale Receipts
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Processed via Naataka Payments</div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab && setActiveTab("theatre-builder")}
          className="p-4 rounded-xl bg-[#14141e] border border-white/10 hover:border-[#FED800]/60 transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FED800]/10 border border-[#FED800]/30 flex items-center justify-center text-[#FED800] mb-3 group-hover:scale-110 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-[#FED800] transition-colors">
              3D Hall Studio
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Customize seats, tables & doors</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("shows")}
          className="p-4 rounded-xl bg-[#14141e] border border-white/10 hover:border-blue-500/60 transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
              Schedule Shows
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Assign hall & showtimes</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("bookings")}
          className="p-4 rounded-xl bg-[#14141e] border border-white/10 hover:border-emerald-500/60 transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
              Door QR Scanner
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Check-in guests at door</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("analytics")}
          className="p-4 rounded-xl bg-[#14141e] border border-white/10 hover:border-purple-500/60 transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
              Sales Analytics
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tier revenue & reports</div>
          </div>
        </button>
      </div>

      {/* Theatres 3D Snapshot & Upcoming Shows Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Theatres 3D Quick-Preview Cards */}
        <div className="lg:col-span-1 bg-[#14141e] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Theater className="w-4 h-4 text-[#FED800]" /> Registered Halls
              </h3>
              <button
                onClick={() => setActiveTab && setActiveTab("theatres")}
                className="text-xs text-[#FED800] hover:underline flex items-center gap-1 font-semibold"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {theatres.length > 0 ? (
                theatres.slice(0, 3).map((theatre) => (
                  <div
                    key={theatre.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{theatre.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Capacity: {theatre.totalCapacity || 240} Seats • {theatre.status}
                      </div>
                    </div>

                    <button
                      onClick={() => setPreview3dTheatre(theatre)}
                      className="flex items-center gap-1 bg-[#FED800] hover:bg-[#ffe033] text-black px-2.5 py-1 rounded-lg text-[11px] font-bold shadow"
                    >
                      <Box className="w-3 h-3" /> 3D View
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No halls added yet. Use the 3D Studio to build your first hall.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab("theatre-builder")}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 py-2.5 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FED800]" />
            Setup New 3D Hall
          </button>
        </div>

        {/* Right Column: Upcoming Shows in This Theatre */}
        <div className="lg:col-span-2 bg-[#14141e] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Upcoming Scheduled Shows
            </h3>
            <button
              onClick={() => setActiveTab && setActiveTab("shows")}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              All Shows <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Drama & Show</th>
                  <th className="py-2.5 px-3 font-semibold">Hall / Venue</th>
                  <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shows.length > 0 ? (
                  shows.slice(0, 5).map((show) => (
                    <tr key={show.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {show.dramaTitle || show.title || `Show #${show.id}`}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {show.theatreName || "Main Auditorium"}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {show.showDate ? new Date(show.showDate).toLocaleDateString() : "Upcoming"}
                        {show.showTime && ` at ${show.showTime}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {show.status || "CONFIRMED"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500">
                      No upcoming shows found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

export default DashboardContent;
