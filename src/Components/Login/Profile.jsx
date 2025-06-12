import React from 'react';
import './Login.css'; // Import the CSS file

const Profile = ({ user }) => {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="avatar-section">
          <img
            src="https://via.placeholder.com/80"
            alt="User Avatar"
            className="avatar"
          />
          <div className="user-name">{user.firstName} {user.lastName}</div>
          <div className="user-email">{user.email}</div>
          <div className="user-phone">{user.mobileNumber}</div>
        </div>
        <ul className="sidebar-menu">
          <li>My Profile</li>
          <li>My Tickets</li>
          <li>Wishlist</li>
          <li>Booking History</li>
          <li className="logout">Log out</li>
        </ul>
      </div>

      <div className="profile-main">
        <h2>Profile</h2>
        <div className="profile-info-grid">
          <div className="info-item">
            <label>Full Name</label>
            <p>{user.firstName} {user.lastName}</p>
          </div>
          <div className="info-item">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className="info-item">
            <label>Phone Number</label>
            <p>{user.mobileNumber}</p>
          </div>
          <div className="info-item">
            <label>Role</label>
            <p>{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;