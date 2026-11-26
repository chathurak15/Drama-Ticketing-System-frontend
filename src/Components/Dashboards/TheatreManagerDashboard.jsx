"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import TheatreManagerSideBar from "../TheatreManager/TheatreManagerSidebar";
import TheatreManagerHeader from "../TheatreManager/TheatreManagerHeader";
import DashboardContent from "../TheatreManager/DashboardContent";
import AddModal from "../Admin/AddModel";
import ShowsContent from "../TheatreManager/ShowsContent";
import AddTheatre from "../TheatreManager/AddTheatre";
import TheatreCustomizerStudio from "../TheatreManager/TheatreCustomizerStudio";
import TheatresContent from "../TheatreManager/TheatresContent";
import BookingsContent from "../TheatreManager/BookingsContent";
import DramasContent from "../Admin/DramasContent";
import AnalyticsContent from "../Admin/AnalyticsContent";
import PayoutsContent from "../TheatreManager/PayoutsContent";
import OrganizerAgreementsVault from "../Organizer/OrganizerAgreementsVault";
import ProfileAndSecurityContent from "../common/ProfileAndSecurityContent";
import OrganizerKycDocuments from "../Organizer/OrganizerKycDocuments";
import Logout from "../Logout/Logout";
import DashboardFooter from "../common/DashboardFooter";
import { useNavigate } from "../../utils/useNavigateCompat";
import notify from "../../utils/notify";

const TheaterManagerDashboard = () => {
  const [activeTab, setActiveTabState] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();
  const userStatus = auth.user?.status;
  const [editData, setEditData] = useState(null);
  const [contentKey, setContentKey] = useState(0);

  // Sync activeTab with URL param ?tab= and localStorage so browser reload keeps the tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTabState(tabParam);
      } else {
        const savedTab = localStorage.getItem("nataka_theatre_tab");
        if (savedTab) {
          setActiveTabState(savedTab);
          const url = new URL(window.location.href);
          url.searchParams.set("tab", savedTab);
          window.history.replaceState({}, "", url.toString());
        }
      }

      const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        const t = p.get("tab") || "dashboard";
        setActiveTabState(t);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("nataka_theatre_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleReloadCurrentPage = () => {
    setContentKey((k) => k + 1);
  };

  useEffect(() => {
    if (userStatus && userStatus !== "approved") {
      notify.warn("Your account is pending administrator approval. Please contact administration.");
      navigate("/");
    }
  }, [userStatus, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardContent
            setActiveTab={setActiveTab}
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
            setEditData={setEditData}
          />
        );
      case "theatres":
        return (
          <TheatresContent
            onNavigateToBuilder={() => setActiveTab("theatre-builder")}
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
          />
        );
      case "theatre-builder":
      case "add-theatre":
        return (
          <TheatreCustomizerStudio
            onSuccess={() => setActiveTab("theatres")}
            onCancel={() => setActiveTab("theatres")}
          />
        );
      case "analytics":
        return <AnalyticsContent />;
      case "bookings":
        return <BookingsContent />;
      case "payouts":
        return <PayoutsContent setActiveTab={setActiveTab} />;
      case "agreements":
        return <OrganizerAgreementsVault onNavigateToKyc={() => setActiveTab("kyc")} />;
      case "kyc":
        return <OrganizerKycDocuments onNavigateToAgreements={() => setActiveTab("agreements")} />;
      case "profile":
        return <ProfileAndSecurityContent embedded={true} />;
      case "logout":
        return <Logout />;
      default:
        return (
          <DashboardContent
            setActiveTab={setActiveTab}
            setAddType={setAddType}
            setShowAddModal={setShowAddModal}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a10] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      <TheatreManagerSideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64 overflow-x-hidden">
        <TheatreManagerHeader
          activeTab={activeTab}
          onReload={handleReloadCurrentPage}
          onLaunchStudio={() => setActiveTab("theatre-builder")}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1720px] mx-auto">
          {renderContent()}
        </main>
        <DashboardFooter />
      </div>

      <AddModal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditData(null);
        }}
        type={addType}
        editData={editData}
      />
    </div>
  );
};

export default TheaterManagerDashboard;
