import React from 'react';
import { Users, TheaterIcon, Calendar, Settings } from 'lucide-react';
import { authUtils } from '../../utils/authUtils';
import LogoutButton from '../Logout/LogoutButton';

const AdminDashboard = () => {
  const user = authUtils.getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.fname} {user?.lname}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TheaterIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Theaters</p>
                  <p className="text-2xl font-bold text-gray-900">56</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Shows</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">Add, edit, or remove users</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <h3 className="font-medium text-gray-900">Theater Management</h3>
                <p className="text-sm text-gray-600">Manage theater settings</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <h3 className="font-medium text-gray-900">System Settings</h3>
                <p className="text-sm text-gray-600">Configure system preferences</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;