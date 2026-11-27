"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  ChevronLeft,
  ChevronRight,
  Database,
  Lock,
} from "lucide-react";
import { getAuditLogs, getAuditStats } from "../../services/AuditService";
import { toast } from "react-toastify";

const AuditLogsContent = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        size: pageSize,
        action: actionFilter === "ALL" ? "" : actionFilter,
        entityType: entityFilter === "ALL" ? "" : entityFilter,
        search: searchQuery,
      });

      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalLogs(res.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching audit logs", err);
      toast.error("Failed to fetch system audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("ADD")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
    if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("CANCEL")) {
      return "bg-red-500/20 text-red-300 border-red-500/30";
    }
    if (act.includes("STATUS")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    if (act.includes("PAYMENT")) {
      return "bg-[#FED800]/20 text-[#FED800] border-[#FED800]/40";
    }
    return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  };

  const getRoleBadge = (role) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN") return "bg-red-500/20 text-red-300 border-red-500/30";
    if (r === "THEATREMANAGER") return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (r === "ORGANIZER") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (r === "SYSTEM") return "bg-[#FED800]/20 text-[#FED800] border-[#FED800]/30";
    return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Security & Audit Trail
            </span>
            <span className="text-xs text-slate-400">Total: {totalLogs} Immutable Events</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">System Audit & Compliance Log</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic tracking of administrative operations, catalog modifications, user role adjustments, and payment verifications.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="bg-[#1b1b28] hover:bg-[#252538] text-white px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-semibold transition-all self-start sm:self-auto hover:border-[#FED800]/40"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FED800]" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Logged Entries
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{totalLogs.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Persisted in audit_logs table</div>
          </div>
        </div>

        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Automated Auditing
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">ACTIVE</div>
            <div className="text-[10px] text-slate-500">Auto-captures user, role, IP & timestamp</div>
          </div>
        </div>

        <div className="bg-[#14141e] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3 bg-[#FED800]/10 text-[#FED800] rounded-2xl border border-[#FED800]/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Compliance Standard
            </div>
            <div className="text-2xl font-black text-white mt-0.5">ISO / SOC-2 Ready</div>
            <div className="text-[10px] text-slate-500">Non-repudiable audit recording</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#14141e]/60 p-4 rounded-xl border border-white/5">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user email, entity ID, action, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchLogs();
            }}
            className="w-full bg-[#1b1b28] border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE / ADD</option>
            <option value="UPDATE">UPDATE / EDIT</option>
            <option value="DELETE">DELETE / REMOVE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="PAYMENT_CONFIRM">PAYMENT_CONFIRM</option>
            <option value="CANCEL">CANCEL</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
          >
            <option value="ALL">All Entities</option>
            <option value="ACTOR">Actor</option>
            <option value="DRAMA">Drama</option>
            <option value="SHOW">Show</option>
            <option value="USER">User</option>
            <option value="BOOKING">Booking</option>
            <option value="THEATRE">Theatre</option>
            <option value="PAYOUT">Payout</option>
          </select>
        </div>
      </div>

      {/* Audit Trail Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Querying audit logs...</p>
        </div>
      ) : (
        <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Performed By</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Audit Details</th>
                  <th className="py-3.5 px-4 font-semibold">Client IP</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-xs">{log.performedBy || "SYSTEM"}</div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider border ${getRoleBadge(
                            log.userRole
                          )}`}
                        >
                          {log.userRole || "SYSTEM"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-200 text-xs">{log.entityType}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {log.entityId}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-slate-300 text-[11px] line-clamp-2">{log.details}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {log.ipAddress || "127.0.0.1"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }`}
                        >
                          {log.status || "SUCCESS"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      No audit events recorded matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 bg-[#171722] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Showing page <span className="text-white font-semibold">{page + 1}</span> of{" "}
                <span className="text-white font-semibold">{totalPages}</span> •{" "}
                <span>{totalLogs} Total Audit Records</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1 border border-white/10 ${
                    page === 0
                      ? "bg-white/5 text-slate-600 cursor-not-allowed"
                      : "bg-[#1b1b28] text-slate-300 hover:text-white hover:border-[#FED800]/40"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1 border border-white/10 ${
                    page >= totalPages - 1
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
    </div>
  );
};

export default AuditLogsContent;
