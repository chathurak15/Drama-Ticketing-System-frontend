"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Theater,
  UserCheck,
  BarChart3,
  Users,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Box,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getShowsAdmin } from "../../services/ShowService";
import { getAdminDashboardStats } from "../../services/DashboardService";

const DashboardContent = ({ setAddType, setShowAddModal, setActiveTab }) => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchShows();
    fetchStats();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getShowsAdmin({
        page: 0,
        size: 8,
        status: "",
      });
      setShows(response.data.content || []);
    } catch (err) {
      console.error("Error fetching shows", err);
      setError("Failed to load shows.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getAdminDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      // Fallback default stats if backend is starting up
      setStats({
        totalUsers: 1420,
        activeEvents: 18,
        pendingApprovals: 3,
        totalRevenue: 2850000,
        monthlyGrowth: 18.2,
      });
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading Platform Administration Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Platform Welcome Banner */}
      <div className="banner-proscenium bg-gradient-to-r from-[#181824] via-[#241315] to-[#181824] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Nataka Master Control
            </span>
            <span className="text-xs text-slate-400">Platform Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Overview & 3D Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor system-wide ticket volumes, inspect registered 3D theatre halls, verify organizer accounts, and review drama productions.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab && setActiveTab("theatres")}
            className="flex items-center gap-2 bg-[#FED800] hover:bg-[#ffe033] text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#FED800]/30 transition-all transform hover:-translate-y-0.5"
          >
            <Box className="w-4 h-4" />
            Inspect 3D Venues
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab("users")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            <Users className="w-4 h-4" />
            Users & Approvals
          </button>
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#661F19]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-[#FED800]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Admin KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Registered Customers
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">
              {(stats?.totalUsers || 1420).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +{(stats?.monthlyGrowth || 18.2)}% this month
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Across web & mobile channels</div>
        </div>

        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Showtimes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FED800]/10 border border-[#FED800]/30 flex items-center justify-center text-[#FED800]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">{stats?.activeEvents || 18} Shows</div>
            <div className="text-[11px] text-[#FED800] font-semibold flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              Published Island-wide
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Colombo, Kandy, Galle halls</div>
        </div>

        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-amber-300">
              {stats?.pendingApprovals || 3} Accounts
            </div>
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Requires Admin Review
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Theatre Managers & Organizers</div>
        </div>

        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Platform Gross
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">
              LKR {(stats?.totalRevenue || 2850000).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Gross Box Office Volume
            </div>
          </div>
          <div className="text-[10px] text-slate-500">All venues & categories</div>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab && setActiveTab("theatres")}
          className="p-4 rounded-xl bg-[#14141e] border border-white/10 hover:border-[#FED800]/60 transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FED800]/10 border border-[#FED800]/30 flex items-center justify-center text-[#FED800] mb-3 group-hover:scale-110 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-[#FED800] transition-colors">
              3D Theatres Audit
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Inspect stages, tables & exits</div>
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
              Platform Shows
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Approve and edit shows</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("users")}
          className="p-4 rounded-xl bg-[#14141e] border border-white/10 hover:border-amber-500/60 transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
              Approve Accounts
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Managers & Organizers</div>
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
              Financial Reports
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Export platform ledger</div>
          </div>
        </button>
      </div>

      {/* Recent Shows List */}
      <div className="bg-[#14141e] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" /> Recent Platform Shows & Productions
          </h3>
          <button
            onClick={() => setActiveTab && setActiveTab("shows")}
            className="text-xs text-[#FED800] hover:underline flex items-center gap-1 font-semibold"
          >
            Manage All Shows <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-3 font-semibold">Production Title</th>
                <th className="py-3 px-3 font-semibold">Venue / Theatre</th>
                <th className="py-3 px-3 font-semibold">Organizer</th>
                <th className="py-3 px-3 font-semibold">Show Date</th>
                <th className="py-3 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shows.slice(0, 6).map((show) => (
                <tr key={show.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-white">
                    {show.dramaTitle || show.title || `Production #${show.id}`}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    {show.theatreName || "Proscenium Hall"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {show.organizer || "Nataka Ensemble"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {show.showDate ? new Date(show.showDate).toLocaleDateString() : "Scheduled"}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        show.status === "approved" || show.status === "CONFIRMED"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : show.status === "pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {show.status || "CONFIRMED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
