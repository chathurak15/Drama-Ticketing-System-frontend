import React, { useState, useEffect } from "react";
import { User, Edit, Trash2, Eye, Calendar, Search, Plus } from "lucide-react";
import ActionButton from "../ActionButton";
import TableRow from "../TableRow";
import { deleteActor, getActors } from "../../../services/ActorService";
import { toast } from "react-toastify";

const ActorsContent = ({ setAddType, setShowAddModal}) => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    fetchActors();
  }, [currentPage, genderFilter]);

  const fetchActors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getActors({
        page: currentPage,
        size: pageSize,
        name: searchTerm,
        // gender: genderFilter === "All" ? null : genderFilter,
      });

      setActors(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching actors", err);
      setError("Failed to load actors. Please try again later.");
      toast.error("Failed to load actors.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (actorId) => {
    if (window.confirm("Are you sure you want to delete this Actor?")) {
    try {
      const response = await deleteActor(actorId);
      alert(response.data);
      await fetchActors();
    } catch (err) {
      console.error("Error deleting actor:", err);
      alert();
    }
  }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredActors = actors.filter((actor) => {
    const name = actor.name?.toLowerCase() || "";
    const genderMatch = genderFilter === "All" || actor.gender === genderFilter;
    return name.includes(searchTerm.toLowerCase()) && genderMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading actors...</p>
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
            onClick={fetchActors}
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Actor Management</h2>
        <button
          onClick={() => {
            setAddType("actor");
            setShowAddModal(true);
          }}
          className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Actor</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search actors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={() => {
                   fetchActors();
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19]"
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19]"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birthday
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActors.length > 0 ? (
                filteredActors.map((actor) => (
                  <TableRow key={actor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`/images/upload/actor/${actor.photo}`}
                          alt={actor.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {actor.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          actor.gender === "Male"
                            ? "bg-blue-100 text-blue-800"
                            : actor.gender === "Female"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {actor.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {new Date(actor.birthday).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* <ActionButton icon={Eye} color="text-blue-600" /> */}
                        <ActionButton icon={Edit} color="text-gray-600" />
                        <ActionButton
                          icon={Trash2}
                          color="text-red-600"
                          onClick={() => handleDelete(actor.id)}
                        />
                      </div>
                    </td>
                  </TableRow>
                ))
              ) : (
                <TableRow hover={false}>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No actors found
                  </td>
                </TableRow>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing page {currentPage + 1} of {totalPages} • {actors.length}{" "}
              actors
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 border rounded-lg ${
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
                className={`px-4 py-2 border rounded-lg ${
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

export default ActorsContent;
