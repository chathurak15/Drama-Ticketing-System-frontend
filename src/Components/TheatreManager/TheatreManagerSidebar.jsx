import React from 'react';
import { 
  Users, 
  Calendar, 
  Theater, 
  UserCheck, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Plus
} from 'lucide-react';

const sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'shows', label: 'Shows', icon: Calendar },
  { key: 'theatres', label: 'Theatres', icon: Theater },
  { key: 'add-theatre', label: 'Add theatre', icon: Plus},
  { key: 'Bookings', label: 'Bookings', icon: CreditCard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'Log Out', label: 'LogOut', icon: Settings },
];

const TheatreManagerSideBar = ({ activeTab, setActiveTab }) => (
  <div className="fixed left-0 top-0 h-full w-64 booking-btn shadow-lg z-40">
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
              onClick={() => setActiveTab(item.key)}
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
);

export default TheatreManagerSideBar;