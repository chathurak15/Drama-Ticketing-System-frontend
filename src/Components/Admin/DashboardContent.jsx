import React from 'react';
import { 
  Plus,
  Theater,
  UserCheck,
  BarChart3,
  Users,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import StatCard from './StatCard';

const DashboardContent = ({ setAddType, setShowAddModal }) => {
  // Sample data - replace with API calls
  const stats = {
    totalUsers: 1250,
    activeEvents: 15,
    pendingApprovals: 8,
    totalRevenue: 45000,
    monthlyGrowth: 12.5
  };

  const events = [
    // Sample events data
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={stats.monthlyGrowth}
        />
        <StatCard
          title="Active Events"
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
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-600"
          trend={15.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.organizer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'approved' ? 'bg-green-100 text-green-800' :
                  event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setAddType('event'); setShowAddModal(true); }}
              className="p-4 bg-[#661F19] text-white rounded-lg hover:bg-[#541612] transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
            <button
              onClick={() => { setAddType('drama'); setShowAddModal(true); }}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Theater className="w-5 h-5" />
              <span>Add Drama</span>
            </button>
            <button
              onClick={() => { setAddType('actor'); setShowAddModal(true); }}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Add Actor</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
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