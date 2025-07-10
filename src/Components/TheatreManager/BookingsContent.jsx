import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  QrCode,
  Calendar,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ActionButton from "../Admin/ActionButton";
import TableRow from "../Admin/TableRow";
import { useAuth } from "../../utils/AuthContext";
import { getShowsByUser } from "../../services/ShowService";
import { getBookingsByShow, updateStatus } from "../../services/BookingService";

const BookingsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState();
  const [bookings, setBookings] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSearch, setShowSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const userId = useAuth().user?.id;

  const sampleShows = [
    { id: 35, title: "test", date: "2025-07-16", time: "18:21" },
    { id: 42, title: "Romeo and Juliet", date: "2025-07-18", time: "19:30" },
    { id: 50, title: "Hamlet", date: "2025-07-20", time: "20:00" },
  ];

  useEffect(() => {
    fetchBookings();
    fetchShows();
  }, [statusFilter, showFilter, currentPage, pageSize]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBookingsByShow(
        userId,
        currentPage,
        pageSize,
        showFilter,
        searchTerm
      );
      const data = response.data;

      setBookings(data.content || []);
      setTotalElements(data.totalItems || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    // try {
    //   const response = await getShowsByUser(userId);
    //  if (!response || !response.data) {
    //     alert("No shows found for you.");
    //  }
    setShows(sampleShows);
    // } catch (err) {
    //   console.error("Error fetching shows", err);
    // }
  };

  const handleQRScan = (result) => {
    if (result) {
      setSearchTerm(result);
      setShowQRScanner(false);
      toast.success("QR Code scanned successfully!");
    }
  };

  const handleStatusChange = async (bookingId, newStatus = "Complete") => {
    if (window.confirm("Are you sure you want to delete this show?")) {
      try {
        const response = await updateStatus(bookingId, newStatus);
        alert(response.data);
        fetchBookings();
      } catch (err) {
        console.error("Error updating status", err);
        toast.error("Failed updating status.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page when searching
    fetchBookings();
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "complete":
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "canceled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesShowSearch =
      showSearch === "" ||
      booking.showTitle.toLowerCase().includes(showSearch.toLowerCase());

    return matchesShowSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 bg-[#661F19] text-white rounded hover:bg-[#541612]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Ticket className="w-8 h-8 text-[#661F19] mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBookings.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  filteredBookings.filter(
                    (b) =>
                      b.status.toLowerCase() === "confirmed" ||
                      b.status.toLowerCase() === "complete"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Canceled</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  filteredBookings.filter(
                    (b) => b.status.toLowerCase() === "canceled"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR{" "}
                {filteredBookings
                  .reduce((sum, booking) => sum + booking.totalAmount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowQRScanner(!showQRScanner)}
            className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>QR Scanner</span>
          </button>
        </div>
      </div>

      {/* QR Scanner Section */}
      {showQRScanner && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">QR Code Scanner</h3>
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              QR Code scanner would be implemented here using a camera library
            </p>
            <button
              onClick={() => handleQRScan("THE-035-NOMALE7-21DCA")}
              className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612]"
            >
              Simulate QR Scan
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by Ticket ID */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Complete">Complete</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Canceled">Canceled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Show Filter */}
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] appearance-none bg-white"
                value={showFilter}
                onChange={(e) => setShowFilter(e.target.value)}
              >
                <option value="">All Shows</option>
                {shows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.title} - {show.date}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Show Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#661F19] flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.ticketId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.theatreName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.showTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {booking.showDate} at {booking.showTime}
                        </div>
                        {booking.location && (
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.location}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium">
                            {booking.seatCount} seats - LKR{" "}
                            {booking.totalAmount}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {booking.seats.map((seat, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 flex justify-between"
                            >
                              <span>{seat.seatIdentifier}</span>
                              <span>LKR {seat.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(booking.status)}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(booking.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* <ActionButton
                          icon={Eye}
                          color="text-blue-600"
                          onClick={() => handleViewDetails(booking.id)}
                          title="View Details"
                        /> */}
                        {booking.status.toLowerCase() !== "complete" && booking.status.toLowerCase() !== "canceled" && (
                          <ActionButton
                            icon={CheckCircle}
                            color="text-green-600"
                            onClick={() =>
                              handleStatusChange(booking.id, "Complete")
                            }
                            title="Mark as Complete"
                          />
                        )}
                      </div>
                    </td>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No bookings found matching your criteria
                  </td>
                </TableRow>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing page {currentPage + 1} of {totalPages} • {shows.length}{" "}
              Bookings
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 border rounded-lg flex items-center ${
                  currentPage === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 border rounded-lg flex items-center ${
                  currentPage === totalPages - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsContent;
