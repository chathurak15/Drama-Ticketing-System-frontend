// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userRole = localStorage.getItem('userRole');
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If specific roles are required, check if user has permission
  if (allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => 
      role.toLowerCase() === userRole?.toLowerCase()
    );
    
    if (!hasPermission) {
      // Redirect to appropriate dashboard based on their actual role
      const userDashboard = getDashboardRoute(userRole);
      return <Navigate to={userDashboard} replace />;
    }
  }
  
  return children;
};

// Helper function to get dashboard route (same as in Login component)
const getDashboardRoute = (userRole) => {
  switch (userRole?.toLowerCase()) {
    case 'admin':
      return '/admin-dashboard';
    case 'theatre manager':
    case 'theare_manager':
    case 'theatremanager':
      return '/theater-manager-dashboard';
    case 'organizer':
      return '/organizer-dashboard';
    case 'user':
    default:
      return '/user-dashboard';
  }
};

export default ProtectedRoute;