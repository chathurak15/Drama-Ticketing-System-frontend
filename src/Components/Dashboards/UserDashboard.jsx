import React, { useState } from 'react';
import '../../assets/css/MyProfile.css';
import { Users, TheaterIcon, Calendar, Settings } from 'lucide-react';
import { authUtils } from '../../utils/authUtils';
import LogoutButton from '../Logout/LogoutButton';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const UserDashboard = () => {
  const user = authUtils.getCurrentUser();
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-content">
            <h2>Profile</h2>
            <p><strong>Full Name:   </strong>   {user.fname} {user.lname}</p>
            <p><strong>Email:   </strong>   {user.email}</p>
            <p><strong>Phone Number:   </strong>   {user.contact}</p>
          </div>
        );
      case 'tickets':
        return <div className="profile-content">My Tickets</div>;
      case 'wishlist':
        return <div className="profile-content">My Wishlist</div>;
      case 'history':
        return <div className="profile-content">My Booking History</div>;
      case 'logout':
        return <div className="profile-content text-red-500">You have been logged out.</div>;
      default:
        return null;
    }
  };

  return (
    <>
    <Header/>
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <img src="" alt="Profile" className="profile-image" />
          <div className="profile-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
            <p>{user.mobileNumber}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-sidebar">
            <button onClick={() => setActiveTab('profile')}>My Profile</button>
            <button onClick={() => setActiveTab('tickets')}>My Tickets</button>
            <button onClick={() => setActiveTab('wishlist')}>Wishlist</button>
            <button onClick={() => setActiveTab('history')}>Booking History</button>
            <button onClick={() => setActiveTab('logout')} className="logout-btn">Log out</button>
          </div>
          <div className="profile-main">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default UserDashboard;