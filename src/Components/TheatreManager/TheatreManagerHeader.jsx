import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TheatreManagerHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b px-6 py-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Welcome back, Theatre Manager</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-800">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-[#661F19] rounded-full flex items-center justify-center text-white font-medium">
            TM
          </div>
          <button
          onClick={() => navigate("/logout")}
          className="px-4 py-2 bg-[#661F19] text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
        </div>
      </div>
    </header>
  );
};

export default TheatreManagerHeader;