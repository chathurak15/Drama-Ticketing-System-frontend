import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();

  if (allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      return <Navigate to={getDashboardRoute(userRole)} replace />;
    }
  }

  return children;
};

const getDashboardRoute = (userRole) => {
  switch (userRole) {
    case "admin":
      return "/admin-dashboard";
    case "theatre manager":
    case "theatre_manager":
    case "theatremanager":
      return "/theatre-manager-dashboard";
    case "organizer":
      return "/organizer-dashboard";
    case "customer":
      return "/user-dashboard";
    default:
      return "/user-dashboard";
  }
};

export default ProtectedRoute;
