import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import './ComingSoon.css';

const TeacherPBL = ({ onNavigate }) => {
  return (
    <div className="coming-soon-container">
      <button className="back-btn" onClick={() => onNavigate('dashboard')}>
        <MdArrowBack /> Back to Dashboard
      </button>
      
      <div className="coming-soon-content">
        <div className="coming-soon-icon">🎯</div>
        <h1>Project-Based Learning</h1>
        <p>Create and manage PBL activities</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
};

export default TeacherPBL;
