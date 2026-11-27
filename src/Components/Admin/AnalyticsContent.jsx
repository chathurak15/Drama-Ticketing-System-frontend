"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Star,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Armchair,
  DollarSign,
  BarChart3,
  Percent,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../utils/AuthContext";
import { getAnalyticsSummary } from "../../services/AnalyticsService";

const AnalyticsContent = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("6m");
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsSummary(user?.id, timeRange);
      setSummaryData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics summary", err);
      toast.error("Unable to load real-time analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const revenueMonthly = summaryData?.monthlyRevenue || [];
  const maxRevenue = summaryData?.maxMonthlyRevenue || Math.max(...(revenueMonthly.map((m) => m.revenue) || [0]), 1);
  const popularDramas = summaryData?.topPerformingDramas || [];

  const handleExportCSV = () => {
    let csv = "Month,Revenue (LKR),Bookings\n";
    revenueMonthly.forEach((r) => {
      csv += `${r.month},${r.revenue},${r.bookings}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nataka_sales_analytics_${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sales Analytics exported to CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Financial Intelligence
            </span>
            <span className="text-xs text-slate-400">Live Box Office Ledger</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Platform Revenue & Ticket Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown of theatrical ticket sales, venue tier seating, and show performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
          >
            <option value="1m">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Year to Date</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4 text-[#FED800]" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#FED800] animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs">Aggregating real-time box office ledger & seating metrics...</p>
        </div>
      ) : (
        <>
          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Gross Revenue */}
            <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>{summaryData?.revenuePeriodLabel || "Gross Revenue"}</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {summaryData?.grossRevenueFormatted || "LKR 0.00"}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {summaryData?.revenueGrowthPercentage != null && summaryData.revenueGrowthPercentage >= 0 ? "+" : ""}
                  {summaryData?.revenueGrowthPercentage != null ? summaryData.revenueGrowthPercentage.toFixed(1) : "0.0"}% vs previous period
                </span>
              </div>
            </div>

            {/* Tier Seating Ratio */}
            <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Tier Seating Ratio</span>
                <Armchair className="w-4 h-4 text-[#FED800]" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#FED800] mt-2">
                {summaryData?.tierSeatingRatio || "100% General Admission"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {summaryData?.tierSubtitle || "Tier breakdown across confirmed admissions"}
              </div>
            </div>

            {/* Average Attendance */}
            <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Average Show Attendance</span>
                <Percent className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 mt-2">
                {summaryData?.averageAttendanceFormatted || "0.0% Full"}
              </div>
              <div className="text-[11px] text-purple-300 mt-1">
                {summaryData?.attendanceSubtitle || "Active admissions across theatre shows"}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Bar Chart */}
            <div className="bg-[#14141e] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FED800]" /> Monthly Revenue Growth
                  </h3>
                  <p className="text-[11px] text-slate-400">Total box office ticket collections</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {summaryData?.revenueGrowthPercentage != null && summaryData.revenueGrowthPercentage >= 0 ? "+" : ""}
                  {summaryData?.revenueGrowthPercentage != null ? summaryData.revenueGrowthPercentage.toFixed(0) : "0"}% Trend
                </span>
              </div>

              {/* Fixed-height flex container for chart */}
              <div className="h-64 flex items-end justify-between gap-3 px-2 pb-2 border-b border-white/10">
                {revenueMonthly.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    No monthly revenue data available in this timeframe.
                  </div>
                ) : (
                  revenueMonthly.map((item, idx) => {
                    const heightPct = maxRevenue > 0 ? Math.round((item.revenue / maxRevenue) * 100) : 0;
                    return (
                      <div key={idx} className="h-full flex-1 flex flex-col items-center justify-end gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 bg-black/95 border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                          LKR {Number(item.revenue || 0).toLocaleString()} ({item.bookings || 0} tix)
                        </div>

                        {/* Bar column */}
                        <div className="w-full flex-1 flex items-end justify-center">
                          {item.revenue > 0 ? (
                            <div
                              style={{ height: `${Math.max(heightPct, 6)}%` }}
                              className="w-full max-w-[42px] bg-gradient-to-t from-[#661F19] to-[#FED800] rounded-t-lg group-hover:brightness-125 transition-all shadow-lg"
                            />
                          ) : (
                            <div
                              style={{ height: "3px" }}
                              className="w-full max-w-[42px] bg-white/10 rounded-full group-hover:bg-white/20 transition-all"
                              title="0 sales this month"
                            />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">{item.month}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-3 text-center">
                Hover over any bar to view exact revenue and ticket count
              </div>
            </div>

            {/* Top Grossing Dramas */}
            <div className="bg-[#14141e] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FED800]" /> Top Performing Dramas
                  </h3>
                  <p className="text-[11px] text-slate-400">Ranked by tickets sold & audience ratings</p>
                </div>
              </div>

              {popularDramas.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No drama performance records found for the selected organizer.
                </div>
              ) : (
                <div className="space-y-3">
                  {popularDramas.map((drama, idx) => (
                    <div
                      key={drama.id}
                      className="p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#661F19] text-[#FED800] font-black text-xs flex items-center justify-center border border-[#FED800]/30 shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{drama.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {drama.genre} • {drama.ticketsSold} tickets sold
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-[#FED800]">{drama.revenue}</div>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-amber-400 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{drama.rating}</span>
                          <span className="text-slate-500 font-normal">({drama.occupancy} cap)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsContent;
