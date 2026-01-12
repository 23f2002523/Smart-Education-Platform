import React from 'react';
import { 
  MdHome, 
  MdBarChart, 
  MdEdit, 
  MdTrackChanges, 
  MdSettings,
  MdSchool
} from 'react-icons/md';
import './StudentSidebar.css';

const StudentSidebar = ({ activeNav }) => {
  const navItems = [
    { id: 'home', icon: MdHome, label: 'Home', path: '/student/dashboard' },
    { id: 'analytics', icon: MdBarChart, label: 'Analytics', path: '/student/analytics' },
    { id: 'practice', icon: MdEdit, label: 'Practice', path: '/student/practice' },
    { id: 'pbl', icon: MdTrackChanges, label: 'PBL', path: '/student/pbl' },
    { id: 'settings', icon: MdSettings, label: 'Settings', path: '/student/settings' }
  ];

  const handleNavClick = (item) => {
    if (item.path && item.path !== '#') {
      window.location.href = item.path;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo"><MdSchool /> SmartEd</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <IconComponent className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default StudentSidebar;
