import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import ActionButton from "./ActionButton";
import TableRow from "./TableRow";
import { getShowsAdmin, updateShowStatus } from "../../services/ShowService.js";

const ShowsContent = ({ setAddType, setShowAddModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;
  const BACKEND_IMAGE_URL = "http://localhost:8080/uploads/shows/";

  useEffect(() => {
    fetchShows();
  }, [currentPage, statusFilter]);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getShowsAdmin({
        page: currentPage,
        size: pageSize,
        status: statusFilter,
      });

      setShows(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching shows", err);
      setError("Failed to load shows. Please try again later.");
      toast.error("Failed to update show status.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAction = async (showId, action) => {
    try {
      await updateShowStatus({ id: showId, status: action });

      // Optimistic UI update
      setShows(
        shows.map((show) =>
          show.showId === showId ? { ...show, status: action } : show
        )
      );

      toast.success(`Show ${action} successfully!`);
    } catch (err) {
      console.error("Error updating show status", err);
      setError("Failed to update show status");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleView = (showId) => {
    window.open(`/show/${showId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shows...</p>
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
            onClick={fetchShows}
            className="mt-2 px-4 py-2 bg-[#661F19] text-white rounded hover:bg-[#541612]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredShows = shows.filter(
    (show) =>
      show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (show.user?.fname + " " + show.user?.lname)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      show.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Show Management</h2>
        <button
          onClick={() => {
            setAddType("show");
            setShowAddModal(true);
          }}
          className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Show</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search shows by title, organizer, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-0 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Show
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShows.length > 0 ? (
                filteredShows.map((show) => (
                  <TableRow key={show.showId}>
                    <td className="px-2 py-4">
                      <div className="flex items-center">
                        <img
                          src={
                            show.image
                              ? `${BACKEND_IMAGE_URL}${show.image}`
                              : "/images/default.png"
                          }
                          alt={show.title}
                          className="w-30 h-25 object-cover rounded mr-3"
                        />
                      </div>
                    </td>
                    <td className="px-0 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {show.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {show.user?.fname} {show.user?.lname}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {show.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {new Date(show.showDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {show.showTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {show.location}
                          </div>
                          <div className="text-xs text-gray-500">
                            {show.city.cityName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {show.drama?.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          show.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : show.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {show.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <ActionButton
                          icon={Eye}
                          onClick={() => handleView(show.showId)}
                          color="text-blue-600"
                        />
                        <ActionButton icon={Edit} color="text-gray-600" />
                        {show.status === "pending" && (
                          <>
                            <ActionButton
                              icon={CheckCircle}
                              onClick={() =>
                                handleShowAction(show.showId, "approved")
                              }
                              color="text-green-600"
                            />
                            <ActionButton
                              icon={XCircle}
                              onClick={() =>
                                handleShowAction(show.showId, "rejected")
                              }
                              color="text-red-600"
                            />
                          </>
                        )}
                        {/* <ActionButton 
                          icon={Trash2} 
                          color="text-red-600" 
                          onClick={() => handleShowAction(show.showId, 'deleted')}
                        /> */}
                      </div>
                    </td>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No shows found matching your criteria
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
              shows
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

export default ShowsContent;
