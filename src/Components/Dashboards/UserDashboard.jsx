// components/dashboard/UserDashboard.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, LogOut, User } from 'lucide-react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const UserDashboard = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600 mb-4">Manage your bookings and profile</p>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <nav className="flex">
              <NavLink
                to="bookings"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <Calendar className="w-5 h-5" />
                My Bookings
              </NavLink>
              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <User className="w-5 h-5" />
                Profile
              </NavLink>
              <NavLink
                to="../logout"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <LogOut className="w-5 h-5" />
                Logout
              </NavLink>
            </nav>
          </div>

          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
