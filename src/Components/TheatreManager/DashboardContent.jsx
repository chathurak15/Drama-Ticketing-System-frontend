// DashboardContent.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { getShowsByUser } from "../../services/ShowService";
import StatCard from "../Admin/StatCard";
import AddTheatre from "./AddTheatre";
import { useAuth } from "../../utils/AuthContext";

const DashboardContent = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTheatre, setShowAddTheatre] = useState(false);
  const user = useAuth().user;

  const stats = {
    totalUsers: 1250,
    activeEvents: 15,
    pendingApprovals: 8,
    totalRevenue: 45000,
    monthlyGrowth: 12.5,
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getShowsByUser({ page: 0, size: 10, userId: user?.id });
      setShows(response.data.content || []);
    } catch (err) {
      console.error("Error fetching shows", err);
      setError("Failed to load shows. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTheatreAddSuccess = () => {
    setShowAddTheatre(false);
    fetchShows();
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

  return (
    <div className="space-y-6">
      {showAddTheatre ? (
        <AddTheatre onSuccess={handleTheatreAddSuccess} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Booking"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              trend={stats.monthlyGrowth}
            />
            <StatCard
              title="Active Shows"
              value={stats.activeEvents}
              icon={Calendar}
              color="text-blue-600"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={Clock}
              color="text-orange-600"
            />
            <StatCard
              title="Total Revenue"
              value={`LKR ${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="text-green-600"
              trend={15.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Events
              </h3>
              <div className="space-y-0">
                {shows.slice(0, 5).map((show,index) => (
                  <div
                    key={show.id|| index}
                    className="flex items-center justify-between p-1 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-sm text-gray-800">{show.title}</p>
                      <p className="text-sm text-gray-600">{show.organizer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{show.showDate}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        show.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : show.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {show.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowAddTheatre(true)}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" /> Add Theatre
              </button>

              <button
              onClick={() => {
                setAddType("Show");
                setShowAddModal(true);
              }}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            ><Plus className="w-4 h-4" />Add Show</button>
              
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardContent;
