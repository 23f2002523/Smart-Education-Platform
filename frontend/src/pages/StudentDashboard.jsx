import React, { useState, useEffect } from 'react';
import { 
  MdAccessTime,
  MdAutoAwesome,
  MdEdit,
  MdTrackChanges
} from 'react-icons/md';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
        setLoading(false);
      } else {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const renderMasteryBlocks = (mastery) => {
    const blocks = 10;
    const filledBlocks = Math.round((mastery / 100) * blocks);
    return (
      <div className="mastery-blocks">
        {[...Array(blocks)].map((_, i) => (
          <div
            key={i}
            className={`mastery-block ${i < filledBlocks ? 'filled' : ''}`}
          ></div>
        ))}
      </div>
    );
  };

  const renderPerformanceChart = (weeklyData) => {
    if (!weeklyData || weeklyData.length === 0) {
      return <div className="no-data">No performance data available</div>;
    }
    
    const scores = weeklyData.map(w => w.score);
    const maxValue = Math.max(...scores, 1);
    
    return (
      <div className="performance-chart">
        {weeklyData.map((data, index) => {
          const height = (data.score / maxValue) * 100;
          return (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ height: `${height}%` }}
                title={`Week ${data.week}: ${data.score}%`}
              ></div>
              <span className="chart-label">W{index + 1}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const getTaskIcon = (type) => {
    switch(type) {
      case 'practice': return MdEdit;
      case 'project': return MdTrackChanges;
      default: return MdAutoAwesome;
    }
  };

  const getTaskColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return <div className="dashboard-container"><p>No data available</p></div>;
  }

  const { profile, mastery, engagement, weekly_performance, recommendations } = studentData;
  const overallMastery = mastery.overall || 0;
  const engagementScore = engagement.score || 0;

  return (
    <div className="dashboard-container">
      <StudentSidebar activeNav="home" />
      <main className="main-content">
        <StudentNavbar profileName={profile.name} />
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Header Section */}
          <section className="welcome-section">
            <h1 className="welcome-title">Welcome back, {profile.name}!</h1>
            <p className="welcome-subtitle">
              Mastery Score: <strong>{overallMastery}%</strong> • {engagement.streak_days || 0} day streak 🔥
            </p>
            {profile.ai_insight && (
              <div className="ai-insight-box">
                <MdAutoAwesome className="ai-icon" />
                <p className="ai-insight-text">{profile.ai_insight}</p>
              </div>
            )}
          </section>

          {/* Key Metrics Cards */}
          <section className="metrics-section">
            {/* Mastery Score Card */}
            <div className="metric-card mastery-card">
              <h3 className="card-title">Mastery Score</h3>
              <div className="mastery-circle-container">
                <svg className="mastery-circle" viewBox="0 0 120 120">
                  <circle
                    className="circle-bg"
                    cx="60"
                    cy="60"
                    r="50"
                  ></circle>
                  <circle
                    className="circle-progress"
                    cx="60"
                    cy="60"
                    r="50"
                    style={{
                      strokeDasharray: `${(overallMastery / 100) * 314} 314`
                    }}
                  ></circle>
                  <text x="60" y="65" className="circle-text">
                    {overallMastery}%
                  </text>
                </svg>
              </div>
              <div className="metric-details">
                <p className="metric-description">
                  Across {mastery.subject_count} subjects
                </p>
              </div>
            </div>

            {/* Engagement Index Card */}
            <div className="metric-card engagement-card">
              <h3 className="card-title">Engagement Index</h3>
              <div className="engagement-value">
                <span className="large-number">{engagementScore}%</span>
                <span className={`engagement-level level-${engagementScore >= 75 ? 'high' : engagementScore >= 50 ? 'medium' : 'low'}`}>
                  {engagementScore >= 75 ? 'High' : engagementScore >= 50 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${engagementScore}%` }}
                ></div>
              </div>
              <p className="metric-description">
                {engagement.session_count} sessions • {engagement.total_time_hours}h total
              </p>
            </div>

            {/* Weekly Performance Chart */}
            <div className="metric-card performance-card">
              <h3 className="card-title">Weekly Performance</h3>
              {renderPerformanceChart(weekly_performance)}
              <p className="metric-description">
                Your performance trend over recent weeks
              </p>
            </div>
          </section>

          {/* Recommended Next Tasks */}
          <section className="tasks-section">
            <div className="section-header">
              <h2 className="section-title">Recommended Next Tasks</h2>
              <span className="ai-badge"><MdAutoAwesome /> AI Powered</span>
            </div>
            <div className="tasks-grid">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((task, index) => {
                  const IconComponent = getTaskIcon(task.type);
                  return (
                    <div key={index} className="task-card">
                      {task.priority === 'high' && <span className="urgent-badge">High Priority</span>}
                      <div className="task-header">
                        <span 
                          className="subject-tag"
                          style={{ backgroundColor: getTaskColor(task.priority) }}
                        >
                          {task.subject}
                        </span>
                        <IconComponent className="task-icon" />
                      </div>
                      <h4 className="task-title">{task.topic}</h4>
                      <p className="task-description">{task.description}</p>
                      <button className="task-action-btn">Start Practice</button>
                    </div>
                  );
                })
              ) : (
                <div className="no-tasks">
                  <p>Great job! No urgent tasks at the moment.</p>
                </div>
              )}
            </div>
          </section>

          {/* Concept Mastery Section */}
          <section className="mastery-section">
            <h2 className="section-title">Concept Mastery by Subject</h2>
            <div className="mastery-grid">
              {mastery.by_subject && mastery.by_subject.length > 0 ? (
                mastery.by_subject.map((subject) => (
                  <div key={subject.subject} className="mastery-subject-card">
                    <div className="subject-header">
                      <h4 className="subject-name">{subject.subject}</h4>
                    </div>
                    <div className="subject-mastery">
                      <span className="mastery-percentage">{subject.score}%</span>
                    </div>
                    {renderMasteryBlocks(subject.score)}
                    <p className="subject-topics">{subject.topics} topics covered</p>
                  </div>
                ))
              ) : (
                <p className="no-data">Start learning to see your mastery scores!</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
