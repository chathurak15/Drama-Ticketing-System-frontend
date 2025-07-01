import React from 'react';

const ActionButton = ({ icon: Icon, onClick, color = "text-gray-600", className = "", size = "w-4 h-4" }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${color} ${className}`}
  >
    <Icon className={`${size}`} />
  </button>
);

export default ActionButton;