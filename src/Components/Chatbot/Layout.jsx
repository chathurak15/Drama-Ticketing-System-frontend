import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Chatbot from './chatbot';

const Layout = () => {
  const location = useLocation();
  
  // Pages where you don't want to show the chatbot
  const hideChatbotPages = ['/login', '/register'];
  const shouldShowChatbot = !hideChatbotPages.includes(location.pathname);

  return (
    <div className="app-layout">
      <Outlet />
      {/* {shouldShowChatbot && <Chatbot />} */}
    </div>
  );
};

export default Layout;