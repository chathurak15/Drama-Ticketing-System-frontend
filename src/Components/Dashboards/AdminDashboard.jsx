import React, { useState } from 'react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminHeader from '../Admin/AdminHeader';
import AddModal from '../Admin/AddModel';
import DashboardContent from '../Admin/DashboardContent';
import ShowsContent from '../Admin/ShowsContent';
import DramasContent from '../Admin/DramasContent';
import ActorsContent from '../Admin/Actors/ActorsContent';
import UsersContent from '../Admin/UsersContent';
import AnalyticsContent from '../Admin/AnalyticsContent';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
      case 'shows': return <ShowsContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
      case 'dramas': return <DramasContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
      case 'actors': return <ActorsContent setAddType={setAddType} setShowAddModal={setShowAddModal} />;
      case 'users': return <UsersContent />;
      case 'analytics': return <AnalyticsContent />;
      case 'payments': return (
        <div className="text-center py-20">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Payment Management</h3>
          <p className="text-gray-500">Connect your Spring Boot API to manage payments and transactions</p>
        </div>
      );
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
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 min-h-screen">
        <AdminHeader />
        
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

export default AdminDashboard;