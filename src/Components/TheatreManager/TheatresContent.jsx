import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, MapPin, Users, Calendar, Sofa ,Theater} from 'lucide-react';
import ActionButton from '../Admin/ActionButton';
import TableRow from '../Admin/TableRow';
import AddTheatre from "./AddTheatre";
import { getTheatresByUserId, deleteTheatre } from "../../services/TheatreService";
import { useAuth } from "../../utils/AuthContext";

const TheatersContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useAuth().user?.id;
  const [showAddTheatre, setShowAddTheatre] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);

  useEffect(() => {
    fetchTheaters();
  }, [statusFilter]);

  const fetchTheaters = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (statusFilter === "") {
        response = await getTheatresByUserId(userId);
      } else {
        response = await getTheatresByUserId(userId);
      }
      setTheaters(response.data || []);
    } catch (err) {
      if (err.response) {
        console.error("Error fetching theaters", err);
        const status = err.response.status;
        const message =
          err.response.data?.message || "Failed to fetch theaters";

        if (status === 401) {
          setError("Unauthorized access");
        } else if (status === 404) {
          setError("No theaters found");
        } else if (status === 500) {
          setError("Server error. Please try again later");
        } else {
          setError(message);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (theaterId) => {
    if (window.confirm("Are you sure you want to delete this theater?")) {
      try {
        const response = await deleteTheatre(theaterId, userId);
        alert(response.data);
        fetchTheaters();
      } catch (err) {
        console.error("Error deleting theater", err);
        toast.error("Failed to delete theater.");
      }
    }
  };

  const handleEdit = (theaterId) => {
    const theatre = theaters.find((t) => t.id === theaterId);
    setEditingTheatre(theatre);
    setShowAddTheatre(true);
  };

  const calculateTotalCapacity = (seatTypes) => {
    return (
      seatTypes?.reduce((total, seatType) => total + seatType.totalSeats, 0) ||
      0
    );
  };

  const formatSeatTypes = (seatTypes) => {
    return (
      seatTypes
        ?.map((type) => `${type.typeName} (${type.totalSeats})`)
        .join(", ") || "No seat types"
    );
  };

  const handleTheatreAddSuccess = () => {
    setShowAddTheatre(false);
    fetchTheaters();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading theaters...</p>
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
            onClick={fetchTheaters}
            className="mt-2 px-4 py-2 bg-[#661F19] text-white rounded hover:bg-[#541612]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredTheaters = theaters.filter(
    (theater) =>
      theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theater.createdByUsername &&
        theater.createdByUsername
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {showAddTheatre ? (
        <AddTheatre
          theatreToEdit={editingTheatre}
          onSuccess={handleTheatreAddSuccess}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Theater Management
            </h2>
            <button
              onClick={() => setShowAddTheatre(true)}
              className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Theater</span>
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
                      placeholder="Search theaters by name, status, or creator..."
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
                  <option value="">All Status</option>
                  <option value="PERMANENT">Permanent</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Theater Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat Types
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTheaters.length > 0 ? (
                    filteredTheaters.map((theater) => (
                      <TableRow key={theater.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[#661F19] flex items-center justify-center">
                                <Theater className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {theater.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {theater.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              theater.status === "PERMANENT"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {theater.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {theater.totalCapacity ||
                                calculateTotalCapacity(theater.seatTypes)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <Sofa className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-900 max-w-xs">
                              {theater.seatTypes?.length > 0 ? (
                                <div className="space-y-1">
                                  {theater.seatTypes.map((seatType) => (
                                    <div
                                      key={seatType.id}
                                      className="flex justify-between"
                                    >
                                      <span className="font-medium">
                                        {seatType.typeName}:
                                      </span>
                                      <span>{seatType.totalSeats} seats</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">
                                  No seat types
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {new Date(theater.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {theater.createdByUsername && (
                            <div className="text-xs text-gray-500 mt-1">
                              by {theater.createdByUsername}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <ActionButton
                              icon={Edit}
                              color="text-gray-600"
                              onClick={() => handleEdit(theater.id)}
                              title="Edit Theater"
                            />
                            <ActionButton
                              icon={Trash2}
                              color="text-red-600"
                              onClick={() => handleDelete(theater.id)}
                              title="Delete Theater"
                            />
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
                        No theaters found matching your criteria
                      </td>
                    </TableRow>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TheatersContent;