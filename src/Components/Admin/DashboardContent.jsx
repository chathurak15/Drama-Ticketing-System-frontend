import React, { useState, useEffect } from "react";
import {Plus,Theater,UserCheck,BarChart3,Users,Calendar,Clock,DollarSign,
} from "lucide-react";
import { getShowsAdmin } from "../../services/ShowService";
import StatCard from "./StatCard";
import { getAdminDashboardStats } from "../../services/DashboardService";

const DashboardContent = ({ setAddType, setShowAddModal }) => {
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
        size: 10,
        status: "",
      });

      setShows(response.data.content || []);
    } catch (err) {
      console.error("Error fetching shows", err);
      setError("Failed to load shows. Please try again later.");
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
  }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats && (
          <>
            <StatCard
              title="Total Customers"
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
              trend={stats.monthlyGrowth}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Events
          </h3>
          <div className="space-y-0">
            {shows.slice(0, 5).map((show) => (
              <div
                key={show.id}
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
            {/* <button
              onClick={() => { setAddType('event'); setShowAddModal(true); }}
              className="p-4 bg-[#661F19] text-white rounded-lg hover:bg-[#541612] transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button> */}
            <button
              onClick={() => {
                setAddType("drama");
                setShowAddModal(true);
              }}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Theater className="w-5 h-5" />
              <span>Add Drama</span>
            </button>
            <button
              onClick={() => {
                setAddType("actor");
                setShowAddModal(true);
              }}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Add Actor</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
