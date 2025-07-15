import React, { useState, useEffect } from "react";
import { Users, TheaterIcon, Calendar, Settings } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import LogoutButton from "../Logout/LogoutButton";
import TheatreManagerSideBar from "../TheatreManager/TheatreManagerSidebar";
import TheatreManagerHeader from "../TheatreManager/TheatreManagerHeader";
import DashboardContent from "../TheatreManager/DashboardContent";
import AddModal from "../Admin/AddModel";
import ShowsContent from "../TheatreManager/ShowsContent";
import AddTheatre from "../TheatreManager/AddTheatre";
import TheatresContent from "../TheatreManager/TheatresContent";
import BookingsContent from "../TheatreManager/BookingsContent";
import { useNavigate } from "react-router-dom";

const TheaterManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState("");
  const navigate = useNavigate();
  const user = useAuth().user?.status;
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    
    if (user !== "approved") {
      alert("Your account is pending. Please contact us - 0112345678");
      navigate("/");
    }
  }, [navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardContent
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
          />
        );
      case "shows":
        return (
          <ShowsContent
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
            setEditData={setEditData}
          />
        );
      case "dramas":
        return (
          <DramasContent
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
          />
        );
      case "theatres":
        return (
          <TheatresContent
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
          />
        );
      case "add-theatre":
        return <AddTheatre />;
      case "analytics":
        return <AnalyticsContent />;
      case "bookings":
        return <BookingsContent />;
      case "logout":
        return (
          navigate("/logout")
        );
      default:
        return (
          <DashboardContent
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
          />
        );
    }
  };

 return (
  <div
    className="min-h-screen bg-gray-100"
    style={{ fontFamily: "Poppins, sans-serif" }}
  >
    <TheatreManagerSideBar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />

    <div className="transition-all duration-300 md:ml-64">
      <TheatreManagerHeader />
      <main className="p-6">{renderContent()}</main>
    </div>

    <AddModal
      show={showAddModal}
      onClose={() => setShowAddModal(false)}
      type={addType}
      editData={editData}
    />
  </div>
);

};

export default TheaterManagerDashboard;
