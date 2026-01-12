import React, { useState } from 'react';
import { 
  MdDashboard, 
  MdClass, 
  MdPeople, 
  MdTrackChanges, 
  MdAssessment, 
  MdSettings,
  MdSearch,
  MdNotifications,
  MdArrowDropDown,
  MdTrendingUp,
  MdTrendingDown,
  MdWarning,
  MdPlayArrow,
  MdAssignment,
  MdCreate,
  MdLogout
} from 'react-icons/md';
import { FaChalkboardTeacher, FaLightbulb } from 'react-icons/fa';
import TeacherClasses from './TeacherClasses';
import TeacherEngagement from './TeacherEngagement';
import TeacherPBL from './TeacherPBL';
import TeacherReports from './TeacherReports';
import TeacherSettings from './TeacherSettings';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedClass, setSelectedClass] = useState('Grade 10 - Section A');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const teacherData = {
    name: 'Dr. Sarah Mitchell',
    subject: 'Mathematics',
    notifications: 5
  };

  const kpiData = {
    avgClassMastery: 76,
    masteryTrend: 3.5,
    engagementIndex: 68,
    engagementTrend: -2.1,
    studentsAtRisk: 8,
    riskTrend: -1
  };

  const classes = [
    'Grade 10 - Section A',
    'Grade 10 - Section B',
    'Grade 11 - Section A',
    'Grade 9 - Advanced Math'
  ];

  const navItems = [
    { id: 'dashboard', icon: MdDashboard, label: 'Dashboard' },
    { id: 'classes', icon: MdClass, label: 'Classes' },
    { id: 'engagement', icon: MdPeople, label: 'Engagement' },
    { id: 'pbl', icon: MdTrackChanges, label: 'PBL' },
    { id: 'reports', icon: MdAssessment, label: 'Reports' },
    { id: 'settings', icon: MdSettings, label: 'Settings' }
  ];

  const topicMastery = [
    { topic: 'Algebra Fundamentals', mastery: 85, status: 'high' },
    { topic: 'Quadratic Equations', mastery: 72, status: 'medium' },
    { topic: 'Trigonometry', mastery: 58, status: 'low' },
    { topic: 'Calculus Basics', mastery: 68, status: 'medium' },
    { topic: 'Statistics', mastery: 91, status: 'high' },
    { topic: 'Geometry', mastery: 45, status: 'low' }
  ];

  const engagementDistribution = [
    { level: 'High', count: 18, percentage: 45, color: '#10b981' },
    { level: 'Medium', count: 14, percentage: 35, color: '#f59e0b' },
    { level: 'Low', count: 8, percentage: 20, color: '#ef4444' }
  ];

  const atRiskStudents = [
    { id: 1, name: 'Alex Thompson', mastery: 42, engagement: 'Low', weakTopic: 'Trigonometry', priority: 'high' },
    { id: 2, name: 'Jamie Chen', mastery: 55, engagement: 'Medium', weakTopic: 'Calculus Basics', priority: 'medium' },
    { id: 3, name: 'Taylor Rodriguez', mastery: 38, engagement: 'Low', weakTopic: 'Geometry', priority: 'high' },
    { id: 4, name: 'Morgan Lee', mastery: 51, engagement: 'Low', weakTopic: 'Quadratic Equations', priority: 'high' },
    { id: 5, name: 'Casey Brown', mastery: 60, engagement: 'Medium', weakTopic: 'Trigonometry', priority: 'medium' }
  ];

  const aiInsights = [
    {
      id: 1,
      type: 'warning',
      message: 'Class engagement dropped by 15% during Trigonometry lessons',
      action: 'Consider more interactive learning methods'
    },
    {
      id: 2,
      type: 'info',
      message: 'Students with low engagement also show 40% lower mastery in Geometry',
      action: 'Target engagement first to improve mastery'
    },
    {
      id: 3,
      type: 'success',
      message: '5 students improved their mastery by 20+ points this week',
      action: 'Recognize their achievement'
    }
  ];

  const getMasteryColor = (mastery) => {
    if (mastery >= 75) return '#10b981';
    if (mastery >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getMasteryStatus = (mastery) => {
    if (mastery >= 75) return 'high';
    if (mastery >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="teacher-dashboard-container">
      {/* Left Sidebar */}
      <aside className="teacher-sidebar">
        <div className="sidebar-header">
          <h2 className="logo"><FaChalkboardTeacher /> SmartEd</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="teacher-main-content">
        {/* Top Bar */}
        <header className="teacher-top-bar">
          <div className="top-bar-left">
            <div className="class-selector">
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="class-dropdown"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <MdArrowDropDown className="dropdown-icon" />
            </div>
            <div className="search-container">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search students or topics…"
                className="search-input"
              />
            </div>
          </div>
          <div className="top-bar-actions">
            <button className="notification-btn">
              <MdNotifications />
              {teacherData.notifications > 0 && (
                <span className="notification-badge">{teacherData.notifications}</span>
              )}
            </button>
            <div className="profile-section">
              <button 
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-info">
                  <span className="profile-name">{teacherData.name}</span>
                  <span className="profile-role">{teacherData.subject}</span>
                </div>
                <div className="profile-avatar"><FaChalkboardTeacher /></div>
                <MdArrowDropDown className={`dropdown-icon ${showProfileMenu ? 'rotated' : ''}`} />
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <MdLogout />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="teacher-dashboard-content">
          {activeNav === 'dashboard' && (
            <>
          {/* Top KPI Cards */}
          <section className="kpi-section">
            <div className="kpi-card">
              <div className="kpi-header">
                <h3 className="kpi-title">Avg Class Mastery</h3>
                <span className={`kpi-trend ${kpiData.masteryTrend >= 0 ? 'positive' : 'negative'}`}>
                  {kpiData.masteryTrend >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                  {Math.abs(kpiData.masteryTrend)}%
                </span>
              </div>
              <div className="kpi-value" style={{ color: getMasteryColor(kpiData.avgClassMastery) }}>
                {kpiData.avgClassMastery}%
              </div>
              <p className="kpi-description">Overall performance across all topics</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3 className="kpi-title">Engagement Index</h3>
                <span className={`kpi-trend ${kpiData.engagementTrend >= 0 ? 'positive' : 'negative'}`}>
                  {kpiData.engagementTrend >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                  {Math.abs(kpiData.engagementTrend)}%
                </span>
              </div>
              <div className="kpi-value" style={{ color: getMasteryColor(kpiData.engagementIndex) }}>
                {kpiData.engagementIndex}%
              </div>
              <p className="kpi-description">Student activity and participation rate</p>
            </div>

            <div className="kpi-card risk-card">
              <div className="kpi-header">
                <h3 className="kpi-title">Students at Risk</h3>
                <span className={`kpi-trend ${kpiData.riskTrend <= 0 ? 'positive' : 'negative'}`}>
                  {kpiData.riskTrend <= 0 ? <MdTrendingDown /> : <MdTrendingUp />}
                  {Math.abs(kpiData.riskTrend)}
                </span>
              </div>
              <div className="kpi-value risk-value">
                <MdWarning /> {kpiData.studentsAtRisk}
              </div>
              <p className="kpi-description">Require immediate attention</p>
            </div>
          </section>

          {/* Class Diagnostics Section */}
          <section className="diagnostics-section">
            <div className="diagnostics-left">
              <div className="section-card">
                <h3 className="section-title">Topic-wise Mastery Heatmap</h3>
                <div className="heatmap-container">
                  {topicMastery.map((item) => (
                    <div key={item.topic} className="heatmap-row">
                      <div className="topic-label">{item.topic}</div>
                      <div className="mastery-bar-container">
                        <div 
                          className={`mastery-bar mastery-${item.status}`}
                          style={{ width: `${item.mastery}%` }}
                        >
                          <span className="mastery-value">{item.mastery}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="diagnostics-right">
              <div className="section-card">
                <h3 className="section-title">Engagement Distribution</h3>
                <div className="engagement-chart">
                  {engagementDistribution.map((item) => (
                    <div key={item.level} className="engagement-item">
                      <div className="engagement-bar-wrapper">
                        <div 
                          className="engagement-bar"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color 
                          }}
                        ></div>
                      </div>
                      <div className="engagement-info">
                        <span className="engagement-label">{item.level}</span>
                        <span className="engagement-stats">
                          {item.count} students ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="engagement-donut">
                  <svg viewBox="0 0 200 200" className="donut-chart">
                    {engagementDistribution.map((item, index) => {
                      const total = engagementDistribution.reduce((sum, i) => sum + i.percentage, 0);
                      const previousPercentage = engagementDistribution
                        .slice(0, index)
                        .reduce((sum, i) => sum + i.percentage, 0);
                      const offset = (previousPercentage / total) * 314;
                      const dashArray = (item.percentage / total) * 314;
                      
                      return (
                        <circle
                          key={item.level}
                          cx="100"
                          cy="100"
                          r="50"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="30"
                          strokeDasharray={`${dashArray} 314`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 100 100)"
                        />
                      );
                    })}
                  </svg>
                  <div className="donut-center">40 Students</div>
                </div>
              </div>
            </div>
          </section>

          {/* Student Intervention List */}
          <section className="intervention-section">
            <div className="section-card">
              <h3 className="section-title">Students Requiring Intervention</h3>
              <div className="intervention-table">
                <div className="table-header">
                  <div className="table-col">Student Name</div>
                  <div className="table-col">Mastery</div>
                  <div className="table-col">Engagement</div>
                  <div className="table-col">Weak Topic</div>
                  <div className="table-col">Action</div>
                </div>
                {atRiskStudents.map((student) => (
                  <div key={student.id} className="table-row">
                    <div className="table-col student-name">
                      <span className={`priority-indicator priority-${student.priority}`}></span>
                      {student.name}
                    </div>
                    <div className="table-col">
                      <span 
                        className="mastery-badge"
                        style={{ color: getMasteryColor(student.mastery) }}
                      >
                        {student.mastery}%
                      </span>
                    </div>
                    <div className="table-col">
                      <span className={`engagement-badge engagement-${student.engagement.toLowerCase()}`}>
                        {student.engagement}
                      </span>
                    </div>
                    <div className="table-col weak-topic">{student.weakTopic}</div>
                    <div className="table-col">
                      <button className="action-btn">Assist</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Actions and AI Insights */}
          <section className="bottom-section">
            <div className="quick-actions-panel">
              <h3 className="section-title">Quick Actions</h3>
              <div className="action-buttons">
                <button className="quick-action-btn primary">
                  <MdPlayArrow />
                  Launch Engagement Poll
                </button>
                <button className="quick-action-btn secondary">
                  <MdAssignment />
                  Assign Adaptive Practice
                </button>
                <button className="quick-action-btn tertiary">
                  <MdCreate />
                  Create PBL Project
                </button>
              </div>
            </div>

            <div className="ai-insights-panel">
              <h3 className="section-title">
                <FaLightbulb /> AI Insights
              </h3>
              <div className="insights-list">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className={`insight-card insight-${insight.type}`}>
                    <p className="insight-message">{insight.message}</p>
                    <p className="insight-action">→ {insight.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
            </>
          )}
          {activeNav === 'classes' && <TeacherClasses onNavigate={setActiveNav} />}
          {activeNav === 'engagement' && <TeacherEngagement onNavigate={setActiveNav} />}
          {activeNav === 'pbl' && <TeacherPBL onNavigate={setActiveNav} />}
          {activeNav === 'reports' && <TeacherReports onNavigate={setActiveNav} />}
          {activeNav === 'settings' && <TeacherSettings onNavigate={setActiveNav} />}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
