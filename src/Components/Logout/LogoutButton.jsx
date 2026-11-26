"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "../../utils/useNavigateCompat";
import { useAuth } from "../../utils/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import notify from "../../utils/notify";

const LogoutButton = ({
  className = "",
  variant = "button", // "button" | "icon" | "text"
  title = "Sign Out",
  showText,
  iconSize = "w-4 h-4",
  confirm = true,
  confirmTitle = "Confirm Sign Out",
  confirmMessage = "Are you sure you want to sign out of your Nataka LK account?",
  redirectTo = "/login",
  children,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const shouldShowText = showText !== undefined ? showText : variant !== "icon";

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      notify.success("Logged out successfully. See you soon!");
      navigate(redirectTo);
    } catch (err) {
      console.error("Logout failed:", err);
      notify.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsModalOpen(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm) {
      setIsModalOpen(true);
    } else {
      performLogout();
    }
  };

  const getDefaultClasses = () => {
    if (variant === "icon") {
      return "p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center";
    }
    if (variant === "text") {
      return "text-xs font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer inline-flex items-center gap-1.5";
    }
    return "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all cursor-pointer";
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoggingOut}
        className={className || getDefaultClasses()}
        title={title}
        aria-label={title}
      >
        {children ? (
          children
        ) : (
          <>
            {isLoggingOut ? (
              <Loader2 className={`${iconSize} animate-spin`} />
            ) : (
              <LogOut className={iconSize} />
            )}
            {shouldShowText && <span>{title}</span>}
          </>
        )}
      </button>

      {confirm && (
        <ConfirmModal
          isOpen={isModalOpen}
          title={confirmTitle}
          message={confirmMessage}
          confirmText="Yes, Log Out"
          cancelText="Stay Signed In"
          confirmVariant="danger"
          isLoading={isLoggingOut}
          onConfirm={performLogout}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default LogoutButton;
