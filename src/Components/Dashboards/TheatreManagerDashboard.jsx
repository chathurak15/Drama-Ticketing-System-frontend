import React from 'react';
import { Users, TheaterIcon, Calendar, Settings } from 'lucide-react';
import { authUtils } from '../../utils/authUtils';
import LogoutButton from '../Logout/LogoutButton';

const TheaterManagerDashboard = () => {
  const user = authUtils.getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Theater Manager Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.fname} {user?.lname}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Theater Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <h3 className="font-medium text-gray-900">Manage Shows</h3>
                <p className="text-sm text-gray-600">Schedule and manage theater shows</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <h3 className="font-medium text-gray-900">Theater Settings</h3>
                <p className="text-sm text-gray-600">Update theater information</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


export default TheaterManagerDashboard;