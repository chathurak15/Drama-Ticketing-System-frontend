"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Chatbot from "./chatbot";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const hideChatbotPages = ["/login", "/register"];
  const isSeatOrBookingPage = pathname?.includes("/seats") || pathname?.startsWith("/booking");
  const shouldShowChatbot = !hideChatbotPages.includes(pathname) && !isSeatOrBookingPage;

  return (
    <div className="app-layout">
      {children}
      {shouldShowChatbot && <Chatbot />}
    </div>
  );
};

export default Layout;
