import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import './ComingSoon.css';

const TeacherReports = ({ onNavigate }) => {
  return (
    <div className="coming-soon-container">
      <button className="back-btn" onClick={() => onNavigate('dashboard')}>
        <MdArrowBack /> Back to Dashboard
      </button>
      
      <div className="coming-soon-content">
        <div className="coming-soon-icon">📊</div>
        <h1>Reports</h1>
        <p>Generate and view performance reports</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
};

export default TeacherReports;
