import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdPeople, MdTrendingUp } from 'react-icons/md';
import './TeacherClasses.css';

const TeacherClasses = ({ onNavigate }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setClasses(data.classes || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(`Failed to load classes: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-classes-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('Session expired') || error.includes('token') || error.includes('log in');
    
    return (
      <div className="teacher-classes-container">
        <button className="back-btn" onClick={() => onNavigate('dashboard')}>
          <MdArrowBack /> Back to Dashboard
        </button>
        <div className="error-state">
          <p>{error}</p>
          {!isAuthError && <p style={{fontSize: '0.8rem', color: '#999'}}>Check console for more details.</p>}
          
          {isAuthError ? (
            <button className="retry-btn" onClick={() => window.location.href = '/login'}>
              Go to Login
            </button>
          ) : (
            <button className="retry-btn" onClick={fetchClasses}>Retry</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-classes-container">
      <div className="classes-header">
        <h1>My Classes</h1>
        <p>Manage and view performance for your assigned classes</p>
      </div>

      {classes.length === 0 ? (
        <div className="empty-state">
          <p>No classes assigned yet.</p>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map((cls, index) => (
            <div key={index} className="class-card">
              <div className="class-card-header">
                <span className="class-grade">Grade {cls.grade}</span>
                <span className="class-section">Section {cls.section}</span>
              </div>
              
              <div className="class-stats">
                <div className="stat-item">
                  <span className="stat-label">
                    <MdPeople size={14} style={{ marginRight: '4px' }} />
                    Students
                  </span>
                  <span className="stat-value">{cls.student_count}</span>
                </div>
                {cls.avg_mastery !== undefined && (
                  <div className="stat-item">
                    <span className="stat-label">
                      <MdTrendingUp size={14} style={{ marginRight: '4px' }} />
                      Avg Mastery
                    </span>
                    <span className="stat-value">{cls.avg_mastery}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
