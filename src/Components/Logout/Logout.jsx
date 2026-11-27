"use client";

import React, { useState } from "react";
import { useNavigate } from "../../utils/useNavigateCompat";
import { useAuth } from "../../utils/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import notify from "../../utils/notify";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      notify.success("Logged out successfully. See you soon!");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      notify.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false);
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to sign out of your Naataka LK account?"
        confirmText="Yes, Log Out"
        cancelText="Stay Signed In"
        confirmVariant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
      <div className="text-slate-400 text-sm">Signing out...</div>
    </div>
  );
};

export default Logout;
