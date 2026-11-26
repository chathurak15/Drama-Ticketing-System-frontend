"use client";

import React from "react";
import { PlatformConfigProvider } from "../hooks/usePlatformConfig";
import { AuthProvider } from "../utils/AuthContext";
import { TranslationProvider } from "../context/TranslationContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "../Components/Chatbot/chatbot";
import FloatingThemeSwitch from "../Components/common/FloatingThemeSwitch";
import AccessibilityWidget from "../Components/common/AccessibilityWidget";

function ToastWithTheme() {
  const { isDark } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? "dark" : "light"}
    />
  );
}

export default function Providers({ children }) {
  return (
    <PlatformConfigProvider>
      <AuthProvider>
        <ThemeProvider>
          <TranslationProvider>
            {children}
            <Chatbot />
            <FloatingThemeSwitch />
            <AccessibilityWidget />
            <ToastWithTheme />
          </TranslationProvider>
        </ThemeProvider>
      </AuthProvider>
    </PlatformConfigProvider>
  );
}
