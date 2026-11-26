"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  ShieldCheck,
  Filter,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Mail,
  Phone,
  Ticket,
  Calendar,
  CreditCard,
  MapPin,
  Sparkles,
  Download,
  ExternalLink,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Building2,
  FileCheck,
  Loader2,
} from "lucide-react";
import { getUsers, deleteUser, updateStatus, getUserFullDetails } from "../../services/UserService";
import {
  getOrganizerKycOverview,
  verifyKycDocument,
  rejectKycDocument,
  verifyAllOrganizerKyc,
  rejectAllOrganizerKyc,
} from "../../services/KycService";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";

const UsersContent = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Detailed User Information View state
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  // KYC Tab State for Organizer verification
  const [modalTab, setModalTab] = useState("overview"); // "overview" | "kyc"
  const [kycData, setKycData] = useState(null);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDocModal, setShowRejectDocModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    loading: false,
  });

  const pageSize = 25;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers({ page: currentPage, size: pageSize });
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users", err);
      setError("Failed to load users. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKycDetails = async (userId) => {
    try {
      setLoadingKyc(true);
      const data = await getOrganizerKycOverview(userId);
      setKycData(data);
    } catch (e) {
      console.debug("Could not fetch KYC details for user:", e);
      setKycData(null);
    } finally {
      setLoadingKyc(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setModalTab(user.role === "Organizer" ? "kyc" : "overview");

    if (user.role === "Organizer" || user.role === "TheatreManager") {
      fetchKycDetails(user.id);
    } else {
      setKycData(null);
    }

    try {
      const res = await getUserFullDetails(user.id);
      setDetailsData(res.data);
    } catch (err) {
      console.error("Error fetching user details", err);
      // Fallback with basic user info
      setDetailsData({
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        phoneNumber: user.phoneNumber || "Not provided",
        role: user.role,
        status: user.status,
        image: user.image,
        totalBookings: 0,
        totalSpent: 0,
        bookings: [],
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleVerifyKycDoc = async (docId) => {
    try {
      await verifyKycDocument(docId);
      toast.success("Document verified successfully!");
      if (selectedUser?.id) {
        fetchKycDetails(selectedUser.id);
      }
    } catch (e) {
      toast.error(e?.message || "Failed to verify document");
    }
  };

  const handleConfirmRejectKycDoc = async () => {
    if (!rejectingDocId) return;
    try {
      await rejectKycDocument(
        rejectingDocId,
        rejectReason || "Document is blurry or illegible. Please re-upload a clear copy."
      );
      toast.success("Document rejected and organizer notified with reason.");
      setShowRejectDocModal(false);
      setRejectReason("");
      setRejectingDocId(null);
      if (selectedUser?.id) {
        fetchKycDetails(selectedUser.id);
      }
    } catch (e) {
      toast.error(e?.message || "Failed to reject document");
    }
  };

  const handleVerifyAllKyc = async () => {
    if (!selectedUser?.id) return;
    try {
      await verifyAllOrganizerKyc(selectedUser.id);
      toast.success("All KYC documents marked as VERIFIED!");
      fetchKycDetails(selectedUser.id);
      fetchUsers();
    } catch (e) {
      toast.error(e?.message || "Failed to verify all documents");
    }
  };

  const handleRejectAllKyc = async () => {
    if (!selectedUser?.id) return;
    const reason = prompt("Enter rejection reason for all documents:", "Uploaded documents do not meet compliance standards. Please re-upload.");
    if (!reason) return;
    try {
      await rejectAllOrganizerKyc(selectedUser.id, reason);
      toast.success("All KYC documents marked as REJECTED.");
      fetchKycDetails(selectedUser.id);
      fetchUsers();
    } catch (e) {
      toast.error(e?.message || "Failed to reject all documents");
    }
  };

  const requestDelete = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName: userName || `User #${userId}`,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userId) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const response = await deleteUser(deleteModal.userId);
      toast.success(response?.data || `User "${deleteModal.userName}" removed successfully.`);
      if (selectedUser && selectedUser.id === deleteModal.userId) {
        setSelectedUser(null);
      }
      setDeleteModal({ isOpen: false, userId: null, userName: "", loading: false });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
      toast.error(err?.response?.data?.message || "Failed to delete user. Check if active bookings exist.");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await updateStatus(userId, newStatus);
      toast.success(response.data || `Status updated to ${newStatus}`);
      fetchUsers();
      if (detailsData && detailsData.id === userId) {
        setDetailsData((prev) => ({ ...prev, status: newStatus }));
      }
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Error updating user status.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    const matchesStatus = statusFilter === "" || user.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      `${user.fname} ${user.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#14141e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
              Identity & Access Management
            </span>
            <span className="text-xs text-slate-400">Total: {users.length} Users</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Users & Approvals Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View each user&apos;s complete profile, ticket purchase activity, verify organizers, and regulate roles.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#14141e]/60 p-4 rounded-xl border border-white/5">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1b28] border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
          >
            <option value="">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="TheatreManager">Theatre Manager</option>
            <option value="Organizer">Event Organizer</option>
            <option value="Admin">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1b1b28] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FED800]"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FED800] mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading users list...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="bg-[#14141e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1b1b28] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User Details</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Account Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#661F19] text-[#FED800] font-bold text-xs flex items-center justify-center border border-[#FED800]/30 shadow">
                            {user.fname ? user.fname.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {user.fname} {user.lname}
                            </div>
                            <div className="text-[10px] text-slate-500">ID #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">{user.email}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            user.role === "TheatreManager"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : user.role === "Organizer"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : user.role === "Admin"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={user.status || "pending"}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                            user.status === "approved"
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                              : user.status === "pending"
                              ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                              : "bg-red-950/40 text-red-300 border-red-500/40"
                          }`}
                        >
                          <option value="approved" className="bg-[#181824] text-white">
                            Approved
                          </option>
                          <option value="pending" className="bg-[#181824] text-white">
                            Pending Review
                          </option>
                          <option value="inactive" className="bg-[#181824] text-white">
                            Inactive / Suspended
                          </option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1.5 bg-[#FED800]/10 hover:bg-[#FED800]/20 text-[#FED800] rounded-lg border border-[#FED800]/20 transition-all flex items-center gap-1 text-[11px] font-semibold px-2"
                            title="View full user information"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {user.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(user.id, "approved")}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-semibold border border-emerald-500/30"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => requestDelete(user.id, `${user.fname} ${user.lname}`)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No users match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <div>
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Information View Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14141e] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181826] to-[#14141e]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#661F19] text-[#FED800] font-black text-xl flex items-center justify-center border border-[#FED800]/40 shadow-lg">
                  {selectedUser.fname ? selectedUser.fname.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {selectedUser.fname} {selectedUser.lname}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedUser.role === "TheatreManager"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : selectedUser.role === "Organizer"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : selectedUser.role === "Admin"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>User Account #{selectedUser.id}</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        (detailsData?.status || selectedUser.status) === "approved"
                          ? "text-emerald-400"
                          : (detailsData?.status || selectedUser.status) === "pending"
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      Status: {((detailsData?.status || selectedUser.status) || "pending").toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setDetailsData(null);
                  setKycData(null);
                }}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-navigation Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-white/10 bg-[#161622] pt-2">
              <button
                type="button"
                onClick={() => setModalTab("overview")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  modalTab === "overview"
                    ? "bg-white/5 text-[#FED800] border-[#FED800]"
                    : "text-slate-400 hover:text-white border-transparent"
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Account & Bookings</span>
              </button>

              {(selectedUser.role === "Organizer" || selectedUser.role === "TheatreManager") && (
                <button
                  type="button"
                  onClick={() => setModalTab("kyc")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                    modalTab === "kyc"
                      ? "bg-white/5 text-[#FED800] border-[#FED800]"
                      : "text-slate-400 hover:text-white border-transparent"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>KYC & Verification Documents</span>
                  {kycData && (
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-extrabold uppercase tracking-wider ${
                        kycData.overallStatus === "Verified"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : kycData.overallStatus === "Action Required"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {kycData.overallStatus}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetails ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FED800] mx-auto mb-3" />
                  <p className="text-slate-400 text-xs">Retrieving detailed account history & bookings...</p>
                </div>
              ) : modalTab === "kyc" ? (
                <div className="space-y-6">
                  {/* Overall Status & Batch Controls */}
                  <div className="p-5 rounded-2xl bg-[#1b1b28] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">
                          KYC Audit Status:{" "}
                          <span
                            className={
                              kycData?.overallStatus === "Verified"
                                ? "text-emerald-400"
                                : kycData?.overallStatus === "Action Required"
                                ? "text-rose-400"
                                : "text-amber-400"
                            }
                          >
                            {kycData?.overallStatus || "Pending Review"}
                          </span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        NIC Number: <span className="font-mono text-white font-bold">{kycData?.nicNumber || "Not recorded"}</span>
                        {kycData?.brNumber && (
                          <>
                            {" "}• BR Number: <span className="font-mono text-white font-bold">{kycData.brNumber}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleVerifyAllKyc}
                        className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify All</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectAllKyc}
                        className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject All</span>
                      </button>
                    </div>
                  </div>

                  {/* Documents List */}
                  {loadingKyc ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#FED800] mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Loading organizer verification documents...</p>
                    </div>
                  ) : !kycData?.documents || kycData.documents.length === 0 ? (
                    <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl text-slate-400 text-xs">
                      No verification documents uploaded yet by this organizer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Submitted Verification Documents ({kycData.documents.length})
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {kycData.documents.map((doc) => {
                          const isDocPdf = doc.fileUrl?.toLowerCase().includes(".pdf") || doc.fileName?.toLowerCase().endsWith(".pdf");
                          return (
                            <div
                              key={doc.id}
                              className="p-4 rounded-2xl bg-[#181826] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                  {isDocPdf ? (
                                    <FileText className="w-6 h-6 text-rose-400" />
                                  ) : (
                                    <img
                                      src={doc.fileUrl}
                                      alt={doc.fileName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "";
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-white">
                                      {doc.customLabel || doc.documentType?.replace(/_/g, " ")}
                                    </p>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                        doc.status === "VERIFIED"
                                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                          : doc.status === "REJECTED"
                                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      }`}
                                    >
                                      {doc.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5" title={doc.fileName}>
                                    {doc.fileName} • Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                                  </p>
                                  {doc.rejectionReason && (
                                    <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded mt-1.5 border border-rose-500/20">
                                      <strong>Rejection Feedback:</strong> {doc.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Document Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="View Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </a>
                                <a
                                  href={doc.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="Download Document"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </a>

                                {doc.status !== "VERIFIED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyKycDoc(doc.id)}
                                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verify KYC</span>
                                  </button>
                                )}

                                {doc.status !== "REJECTED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectingDocId(doc.id);
                                      setShowRejectDocModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject KYC</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Contact & Profile Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#1b1b28] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Email Address
                        </div>
                        <div className="text-xs font-semibold text-white truncate">
                          {selectedUser.email || "No email available"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1b1b28] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Phone Number
                        </div>
                        <div className="text-xs font-semibold text-white">
                          {detailsData?.phoneNumber || selectedUser.phoneNumber || "Not registered"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Booking Summary KPI Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-[#1b1b28] to-[#151522] p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Bookings</span>
                        <Ticket className="w-4 h-4 text-[#FED800]" />
                      </div>
                      <div className="text-xl font-black text-white">
                        {detailsData?.totalBookings ?? detailsData?.bookings?.length ?? 0}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tickets purchased</div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1b1b28] to-[#151522] p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Spent</span>
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xl font-black text-emerald-400">
                        LKR {(detailsData?.totalSpent || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Lifetime platform value</div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1b1b28] to-[#151522] p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Account Role</span>
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-base font-bold text-white truncate">
                        {selectedUser.role}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Privilege level</div>
                    </div>
                  </div>

                  {/* Bookings & Ticket Purchases History Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-[#FED800]" />
                        <span>Ticket & Booking History</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {detailsData?.bookings?.length || 0} Records
                      </span>
                    </div>

                    <div className="bg-[#1b1b28]/60 border border-white/5 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] text-slate-300">
                          <thead className="bg-[#1b1b28] text-slate-400 uppercase text-[9px] tracking-wider border-b border-white/5">
                            <tr>
                              <th className="py-2.5 px-3 font-semibold">Ticket ID</th>
                              <th className="py-2.5 px-3 font-semibold">Show / Drama</th>
                              <th className="py-2.5 px-3 font-semibold">Venue</th>
                              <th className="py-2.5 px-3 font-semibold">Seats</th>
                              <th className="py-2.5 px-3 font-semibold">Amount</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {detailsData?.bookings && detailsData.bookings.length > 0 ? (
                              detailsData.bookings.map((b) => (
                                <tr key={b.id || b.ticketId} className="hover:bg-white/[0.02]">
                                  <td className="py-2.5 px-3 font-mono font-semibold text-[#FED800]">
                                    {b.ticketId}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-white max-w-[140px] truncate">
                                    {b.showTitle || "General Show"}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-400 max-w-[120px] truncate">
                                    {b.theatreName || b.location || "Main Hall"}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                                      {b.seatCount || (b.seats ? b.seats.length : 1)} seats
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-emerald-400 whitespace-nowrap">
                                    LKR {Number(b.totalAmount || 0).toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                        b.status === "Confirmed" || b.status === "Admitted"
                                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                          : b.status === "Canceled" || b.status === "Cancelled"
                                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      }`}
                                    >
                                      {b.status || "Pending"}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-500">
                                  No tickets booked yet by this user.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-white/10 bg-[#161622] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Quick Status:</span>
                <button
                  onClick={() => handleStatusChange(selectedUser.id, "approved")}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 transition-all"
                >
                  Approve User
                </button>
                <button
                  onClick={() => handleStatusChange(selectedUser.id, "inactive")}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/30 transition-all"
                >
                  Suspend Account
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => requestDelete(selectedUser.id, `${selectedUser.fname} ${selectedUser.lname}`)}
                  className="px-3.5 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-xl text-xs font-semibold border border-red-500/30 transition-all cursor-pointer"
                >
                  Delete User
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setDetailsData(null);
                  }}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently remove "${deleteModal.userName}"? All associated data and permissions will be revoked.`}
        confirmText="Delete User"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          !deleteModal.loading &&
          setDeleteModal({ isOpen: false, userId: null, userName: "", loading: false })
        }
      />

      {/* Reject KYC Document Reason Modal */}
      {showRejectDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Reject KYC Document</span>
              </h3>
              <button
                onClick={() => {
                  setShowRejectDocModal(false);
                  setRejectingDocId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide specific feedback explaining why this document cannot be verified (e.g. blurry image, expired ID, name mismatch). The organizer will see this feedback in their KYC portal.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Rejection Reason / Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. The uploaded NIC front is too blurry and the identification number cannot be read. Please upload a clear photo or scan."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectDocModal(false);
                  setRejectingDocId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectKycDoc}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersContent;
