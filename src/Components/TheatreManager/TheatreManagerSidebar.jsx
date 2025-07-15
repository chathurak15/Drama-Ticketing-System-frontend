import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Theater, 
  UserCheck, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Plus, 
  Menu, 
  X 
} from 'lucide-react';

const sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'shows', label: 'Shows', icon: Calendar },
  { key: 'theatres', label: 'Theatres', icon: Theater },
  { key: 'add-theatre', label: 'Add theatre', icon: Plus},
  { key: 'bookings', label: 'Bookings', icon: CreditCard },
  { key: 'logout', label: 'LogOut', icon: Settings },
];

const TheatreManagerSideBar = ({ activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#FED800] p-2 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
      </button>

      {/* Overlay on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 booking-btn shadow-lg z-50 bg-[#222] transition-transform transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:block`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div>
              <img src='/public/images/logo nataka white.png' alt="Nataka Logo" />
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false); // close sidebar on mobile after click
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.key
                      ? 'bg-[#FED800] text-black'
                      : 'text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default TheatreManagerSideBar;
