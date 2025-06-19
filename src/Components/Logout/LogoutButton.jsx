// components/Logout/LogoutButton.js
import React from 'react';
import { LogOut } from 'lucide-react';
import { authUtils } from '../../utils/authUtils';

const LogoutButton = ({ className = "" }) => {
  const handleLogout = () => {
    // You can add a confirmation dialog here if needed
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      authUtils.logout();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;

// Example Dashboard Component showing how to use everything together
export const ExampleDashboard = () => {
  const user = authUtils.getCurrentUser();
  const userRole = authUtils.getUserRole();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with user info and logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userRole} Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, {user?.fname} {user?.lname}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                {userRole} Dashboard Content
              </h2>
              <p className="text-gray-500 mt-2">
                Add your {userRole.toLowerCase()} specific content here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};