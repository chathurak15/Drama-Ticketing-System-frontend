import React, { useState } from 'react';
import { Users, TheaterIcon, Calendar, Settings } from 'lucide-react';
// import { authUtils } from '../../utils/authUtils';
import LogoutButton from '../Logout/LogoutButton';
import TheatreManagerSideBar from '../TheatreManager/TheatreManagerSidebar';
import TheatreManagerHeader from '../TheatreManager/TheatreManagerHeader';
import DashboardContent from '../TheatreManager/DashboardContent';
import AddModal from '../Admin/AddModel';
import ShowsContent from '../TheatreManager/ShowsContent';
import AddTheatre from '../TheatreManager/AddTheatre'
import TheatresContent from '../TheatreManager/TheatresContent';
import BookingsContent from '../TheatreManager/BookingsContent';

const TheaterManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState('');
  
    const renderContent = () => {
      switch(activeTab) {
        case 'dashboard': return <DashboardContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
        case 'shows': return <ShowsContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
        case 'dramas': return <DramasContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
        case 'theatres': return <TheatresContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
        case 'add-theatre': return <AddTheatre />;
        case 'analytics': return <AnalyticsContent />;
        case 'bookings': return <BookingsContent />;
        // case 'payments': return (
        //   <div className="text-center py-20">
        //     <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        //     <h3 className="text-lg font-semibold text-gray-600 mb-2">Payment Management</h3>
        //     <p className="text-gray-500">Connect your Spring Boot API to manage payments and transactions</p>
        //   </div>
        // );
        case 'settings': return (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">System Settings</h3>
            <p className="text-gray-500">Configure your platform settings and preferences</p>
          </div>
        );
        default: return <DashboardContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <TheatreManagerSideBar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="ml-64 min-h-screen">
          <TheatreManagerHeader />
          
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
  
        <AddModal 
          show={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          type={addType}
        />
      </div>
    );
  };


export default TheaterManagerDashboard;