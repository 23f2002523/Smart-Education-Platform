import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdPerson,
  MdLogout,
  MdExpandMore
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';
import './StudentNavbar.css';

const StudentNavbar = ({ profileName }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="top-bar">
      <div className="search-container">
        <MdSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search courses, tasks, or concepts…"
          className="search-input"
        />
      </div>
      <div className="top-bar-actions">
        <div className="profile-section">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              <FaUserGraduate />
            </div>
            <span className="profile-name">{profileName || 'Student'}</span>
            <MdExpandMore className={`expand-icon ${showProfileMenu ? 'rotated' : ''}`} />
          </button>
          
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button className="dropdown-item" onClick={() => window.location.href = '/student/settings'}>
                <MdPerson />
                <span>My Profile</span>
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <MdLogout />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
