"use client";

import React from 'react';
import Link from "next/link";
import { Calendar, User } from 'lucide-react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import LogoutButton from '../Logout/LogoutButton';

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
            <nav className="flex items-center">
              <Link href="/user-dashboard" className="flex items-center gap-2 px-6 py-4 font-medium transition-colors text-blue-600 border-b-2 border-blue-600">
                <Calendar className="w-5 h-5" />
                My Bookings
              </Link>
              <Link href="/user-dashboard" className="flex items-center gap-2 px-6 py-4 font-medium transition-colors text-gray-600 hover:text-gray-900">
                <User className="w-5 h-5" />
                Profile
              </Link>
              <div className="ml-auto px-4">
                <LogoutButton
                  variant="button"
                  title="Logout"
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                />
              </div>
            </nav>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-gray-500">Manage your active bookings and account details from the modern dashboard.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
