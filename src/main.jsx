import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./utils/AuthContext.jsx";

// Pages & Layout
import Layout from "./Components/Chatbot/Layout.jsx";
import AboutUs from "./Components/Pages/AboutUs.jsx";
import Term from "./Components/Pages/Term.jsx";
import Contact from "./Components/Pages/Contact.jsx";
import Dramas from "./Components/Pages/Dramas.jsx";
import Login from "./Components/Pages/Login.jsx";
import Register from "./Components/Pages/Register.jsx";
import Shows from "./Components/Pages/Shows.jsx";
import Home from "./Components/Pages/Home.jsx";
import DramaDetails from "./Components/Drama/DramaDetails.jsx";
import ShowsDetails from "./Components/Pages/ShowDetails.jsx";
import Booking from "./Components/Pages/Booking.jsx";
import TicketView from "./Components/Pages/TicketView.jsx";
import Bookings from "./Components/Customer/Bookings.jsx";
import Profile from "./Components/Customer/Profile.jsx";

// Dashboards
import AdminDashboard from "./Components/Dashboards/AdminDashboard.jsx";
import TheaterManagerDashboard from "./Components/Dashboards/TheatreManagerDashboard.jsx";
import OrganizerDashboard from "./Components/Dashboards/OrganizerDashboard.jsx";
import UserDashboard from "./Components/Dashboards/UserDashboard.jsx";

// Utils
import ProtectedRoute from "./Components/ProtectRoute/ProtectedRoute.jsx";
import Logout from "./Components/Logout/Logout.jsx";
import TheatresContent from "./Components/TheatreManager/TheatresContent.jsx";
import { useAuth } from "./utils/AuthContext.jsx";

// RedirectToDashboard Component
const RedirectToDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();

  const getDashboardRoute = (role) => {
    switch (role) {
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

  return <Navigate to={getDashboardRoute(userRole)} replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <AboutUs /> },
      { path: "terms", element: <Term /> },
      { path: "contact", element: <Contact /> },
      { path: "dramas", element: <Dramas /> },
      { path: "shows", element: <Shows /> },
      { path: "drama/:id", element: <DramaDetails /> },
      { path: "show/:id", element: <ShowsDetails /> },
      { path: "shows/:id", element: <Shows /> },
      { path: "booking", element: <Booking /> },
      { path: "booking/ticket/:id", element: <TicketView /> },

      // Protected Dashboard Routes
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "theatre-manager-dashboard",
        element: (
          <ProtectedRoute
            allowedRoles={[
              "theatre manager",
              "theatre_manager",
              "theatremanager",
            ]}
          >
            <TheaterManagerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "organizer-dashboard",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-dashboard",
        element: (
          <ProtectedRoute allowedRoles={["customer"]}>
            <UserDashboard />
          </ProtectedRoute>
        ),
        children: [
          { path: "bookings", element: <Bookings /> },
          { path: "profile", element: <Profile /> },
          { index: true, element: <Navigate to="bookings" replace /> }, // Optional: default tab
        ],
      },

      {
        path: "dashboard",
        element: <RedirectToDashboard />,
      },
      {
        path: "/logout",
        element: <Logout />,
      },
      {
        path: "/view-theatres",
        element: <TheatresContent />,
      },
    ],
  },
  // Login and Register (outside layout)
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

// Render App
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
