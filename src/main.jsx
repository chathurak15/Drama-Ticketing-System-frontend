import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import Layout component
import Layout from './Components/Chatbot/Layout.jsx'
import AboutUs from './Components/Pages/AboutUs.jsx'
import Term from './Components/Pages/Term.jsx';
import Contact from './Components/Pages/Contact.jsx';
import Dramas from './Components/Pages/Dramas.jsx';
import Login from './Components/Pages/Login.jsx';
import Register from './Components/Pages/Register.jsx';
import Shows from './Components/Pages/Shows.jsx';
import Home from './Components/Pages/Home.jsx';
import DramaDetails from './Components/Drama/DramaDetails.jsx';
import ShowsDetails from './Components/Pages/ShowDetails.jsx';

import AdminDashboard from './Components/Dashboards/AdminDashboard.jsx';
import TheaterManagerDashboard from './Components/Dashboards/TheatreManagerDashboard.jsx';
import OrganizerDashboard from './Components/Dashboards/OrganizerDashboard.jsx';
import UserDashboard from './Components/Dashboards/UserDashboard.jsx';

import ProtectedRoute from './Components/ProtectRoute/ProtectedRoute.jsx'
import Logout from "./Components/Logout/Logout.jsx";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Helper component to redirect to appropriate dashboard based on user role
const RedirectToDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userRole = localStorage.getItem('userRole');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate dashboard
  const getDashboardRoute = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return '/admin-dashboard';
      case 'theatre manager':
      case 'theatre_manager':
      case 'theatremanager':
        return '/theater-manager-dashboard';
      case 'organizer':
        return '/organizer-dashboard';
      case 'user':
      default:
        return '/user-dashboard';
    }
  };
  
  return <Navigate to={getDashboardRoute(userRole)} replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      {
        index: true, // This makes it the default route for "/"
        element: <Home />,
      },
      {
        path: "about",
        element: <AboutUs />,
      },
      {
        path: "terms",
        element: <Term />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "dramas",
        element: <Dramas />,
      },
      {
        path: "shows",
        element: <Shows />,
      },
      {
        path: "drama/:id",
        element: <DramaDetails />,
      },
      {
        path: "show/:id",
        element: <ShowsDetails />,
      },
      
      // Protected Dashboard Routes
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "theatre-manager-dashboard",
        element: (
          <ProtectedRoute allowedRoles={['theatre manager', 'theatre_manager', 'theatremanager']}>
            <TheaterManagerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "organizer-dashboard",
        element: (
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-dashboard",
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: <RedirectToDashboard />,
      },
      {
        path : "/logout",
        element: <Logout />,
      },
    ]
  },
  // Login and Register outside of Layout (no chatbot)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)