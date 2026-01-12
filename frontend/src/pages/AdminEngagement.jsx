import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import './ComingSoon.css';

const AdminEngagement = ({ onNavigate }) => {
  return (
    <div className="coming-soon-container">
      <button className="back-btn" onClick={() => onNavigate('overview')}>
        <MdArrowBack /> Back to Dashboard
      </button>
      
      <div className="coming-soon-content">
        <div className="coming-soon-icon">👥</div>
        <h1>Engagement</h1>
        <p>Monitor institutional engagement metrics</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
};

export default AdminEngagement;
