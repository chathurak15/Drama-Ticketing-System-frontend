"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../Admin/AdminSidebar";
import AdminHeader from "../Admin/AdminHeader";
import AddModal from "../Admin/AddModel";
import DashboardFooter from "../common/DashboardFooter";
import DashboardContent from "../Admin/DashboardContent";
import ShowsContent from "../Admin/ShowsContent";
import DramasContent from "../Admin/DramasContent";
import ActorsContent from "../Admin/Actors/ActorsContent";
import UsersContent from "../Admin/UsersContent";
import AnalyticsContent from "../Admin/AnalyticsContent";
import AdminTheatresContent from "../Admin/AdminTheatresContent";
import PayoutsManagementContent from "../Admin/PayoutsManagementContent";
import PaymentsFinanceContent from "../Admin/PaymentsFinanceContent";
import CommissionSettingsContent from "../Admin/CommissionSettingsContent";
import AuditLogsContent from "../Admin/AuditLogsContent";
import ProfileAndSecurityContent from "../common/ProfileAndSecurityContent";
import AdminAgreementVaultContent from "../Admin/AdminAgreementVaultContent";
import Logout from "../Logout/Logout";

const AdminDashboard = () => {
  const [activeTab, setActiveTabState] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState("");
  const [editData, setEditData] = useState(null);
  const [contentKey, setContentKey] = useState(0);

  // Sync activeTab with URL param ?tab= and localStorage so page reloads persist the current view
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTabState(tabParam);
      } else {
        const savedTab = localStorage.getItem("nataka_admin_tab");
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

  const setActiveTab = useCallback((newTab) => {
    setActiveTabState(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("nataka_admin_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.pushState({}, "", url.toString());
    }
  }, []);

  // Dedicated current tab / page reloader
  const handleReloadCurrentPage = useCallback(() => {
    setContentKey((k) => k + 1);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent key={contentKey} setAddType={setAddType} setShowAddModal={setShowAddModal} setActiveTab={setActiveTab} />;
      case "theatres":
        return <AdminTheatresContent key={contentKey} />;
      case "shows":
        return <ShowsContent key={contentKey} setAddType={setAddType} setShowAddModal={setShowAddModal} setEditData={setEditData} />;
      case "dramas":
        return <DramasContent key={contentKey} setAddType={setAddType} setShowAddModal={setShowAddModal} setEditData={setEditData} />;
      case "actors":
        return <ActorsContent key={contentKey} setAddType={setAddType} setShowAddModal={setShowAddModal} setEditData={setEditData} />;
      case "users":
        return <UsersContent key={contentKey} />;
      case "payments":
        return <PaymentsFinanceContent key={contentKey} />;
      case "commission":
        return <CommissionSettingsContent key={contentKey} />;
      case "analytics":
        return <AnalyticsContent key={contentKey} />;
      case "payouts":
        return <PayoutsManagementContent key={contentKey} setActiveTab={setActiveTab} />;
      case "agreements":
        return <AdminAgreementVaultContent key={contentKey} />;
      case "audit":
        return <AuditLogsContent key={contentKey} />;
      case "profile":
        return <ProfileAndSecurityContent key={contentKey} embedded={true} />;
      case "logout":
        return <Logout />;
      default:
        return <DashboardContent key={contentKey} setAddType={setAddType} setShowAddModal={setShowAddModal} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a10] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200" suppressHydrationWarning>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64 overflow-x-hidden" suppressHydrationWarning>
        <AdminHeader activeTab={activeTab} onReload={handleReloadCurrentPage} />
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

export default AdminDashboard;
