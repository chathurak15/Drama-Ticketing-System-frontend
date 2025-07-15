import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Search, Edit, Trash2, Clock, Star } from "lucide-react";
import ActionButton from "./ActionButton";
import TableRow from "./TableRow";
import { getDramas, deleteDrama } from "../../services/dramaService";

const DramasContent = ({ setAddType, setShowAddModal, setEditData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;
  
  const BACKEND_IMAGE_URL = "http://localhost:8080/uploads/dramas/";

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
    } catch (err) {
      console.error("Error fetching dramas", err);
      setError("Failed to load dramas. Please try again later.");
      toast.error("Failed to load dramas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dramaId) => {
    if (window.confirm("Are you sure you want to delete this drama?")) {
      try {
        const response = await deleteDrama(dramaId);
        alert(response.data);
        fetchDramas();
      } catch (err) {
        console.error("Error deleting drama", err);
        toast.error("Failed to delete drama.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dramas...</p>
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
            onClick={fetchDramas}
            className="mt-2 px-4 py-2 bg-[#661F19] text-white rounded hover:bg-[#541612]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredDramas = dramas.filter(
    (drama) =>
      drama.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drama.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Drama Management</h2>
        <button
          onClick={() => {
            setAddType("drama");
            setShowAddModal(true);
          }}
          className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Drama</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search dramas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-m font-semibold text-gray-900 uppercase tracking-wider">
                  Drama Title
                </th>
                <th className="px-6 py-3 text-left text-m font-semibold text-gray-900 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-m font-semibold text-gray-900 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-m font-semibold text-gray-900 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-m font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDramas.length > 0 ? (
                filteredDramas.map((drama) => (
                  <TableRow key={drama.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={
                            drama.image
                              ? `${BACKEND_IMAGE_URL}${drama.image}`
                              : "/images/default.png"
                          }
                          alt={drama.title}
                          className="w-30 h-20 object-cover rounded mr-4"
                        />

                        <div>
                          <div className="text-m font-semibold text-black-900">
                            {drama.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {drama.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-brown-800 mr-1" />
                        <span className="text-m font-semibold text-gray-900">
                          {Math.floor(drama.duration / 60)}h {drama.duration % 60}m
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-m font-semibold text-gray-900">
                          {drama.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={drama.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Watch Trailer
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-m font-medium">
                      <div className="flex space-x-2">
                        <ActionButton
                          icon={Edit}
                          color="text-gray-600"
                          onClick={() => {
                            setEditData(drama);
                            setAddType("drama");
                            setShowAddModal(true);
                          }}
                          tooltip="Edit drama"
                        />
                        <ActionButton
                          icon={Trash2}
                          color="text-red-600"
                          onClick={() => handleDelete(drama.id)}
                          tooltip="Delete drama"
                        />
                      </div>
                    </td>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No dramas found matching your criteria
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
              Showing page {currentPage + 1} of {totalPages} • {dramas.length} dramas
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

export default DramasContent;
