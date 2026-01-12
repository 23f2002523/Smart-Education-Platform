import React, { useState } from 'react';
import { 
  MdDashboard, 
  MdSchool, 
  MdPeople, 
  MdGroup, 
  MdAssessment, 
  MdSettings,
  MdSearch,
  MdNotifications,
  MdFileDownload,
  MdDateRange,
  MdTrendingUp,
  MdTrendingDown,
  MdCheckCircle,
  MdWarning,
  MdInfo,
  MdArrowDropDown,
  MdLogout
} from 'react-icons/md';
import { FaUserTie, FaChartLine, FaBrain, FaShieldAlt } from 'react-icons/fa';
import AdminAcademics from './AdminAcademics';
import AdminEngagement from './AdminEngagement';
import AdminTeachers from './AdminTeachers';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState('overview');
  const [selectedInstitution, setSelectedInstitution] = useState('Springfield High School');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const adminData = {
    name: 'John Anderson',
    role: 'Principal',
    notifications: 3
  };

  const institutions = [
    'Springfield High School',
    'Lincoln Academy',
    'Washington Prep',
    'Jefferson College'
  ];

  const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'This Year'];

  const navItems = [
    { id: 'overview', icon: MdDashboard, label: 'Overview' },
    { id: 'academics', icon: MdSchool, label: 'Academics' },
    { id: 'engagement', icon: MdPeople, label: 'Engagement' },
    { id: 'teachers', icon: MdGroup, label: 'Teachers' },
    { id: 'reports', icon: MdAssessment, label: 'Reports' },
    { id: 'settings', icon: MdSettings, label: 'Settings' }
  ];

  const kpiData = {
    overallMastery: 74,
    masteryTrend: 4.2,
    avgEngagement: 71,
    engagementTrend: 2.8,
    teacherAdoption: 86,
    adoptionTrend: 8.5,
    activeStudents: 842,
    totalStudents: 950,
    studentTrend: 3.1
  };

  const masteryTrendData = [
    { month: 'Sep', value: 65 },
    { month: 'Oct', value: 68 },
    { month: 'Nov', value: 70 },
    { month: 'Dec', value: 72 },
    { month: 'Jan', value: 74 }
  ];

  const subjectMastery = [
    { subject: 'Mathematics', mastery: 78, trend: 5.2, status: 'high' },
    { subject: 'Science', mastery: 82, trend: 3.8, status: 'high' },
    { subject: 'English', mastery: 71, trend: -1.5, status: 'medium' },
    { subject: 'History', mastery: 76, trend: 4.1, status: 'high' },
    { subject: 'Languages', mastery: 58, trend: -3.2, status: 'low' },
    { subject: 'Arts', mastery: 85, trend: 6.5, status: 'high' }
  ];

  const teacherUsage = [
    { level: 'High Usage', count: 32, percentage: 64, color: '#10b981' },
    { level: 'Medium Usage', count: 11, percentage: 22, color: '#f59e0b' },
    { level: 'Low Usage', count: 7, percentage: 14, color: '#ef4444' }
  ];

  const engagementDistribution = {
    high: 45,
    medium: 38,
    low: 17,
    coverage: 89
  };

  const confidenceScore = {
    score: 82,
    level: 'High',
    factors: [
      { name: 'Mastery Trends', score: 85, status: 'positive' },
      { name: 'Engagement Consistency', score: 78, status: 'positive' },
      { name: 'Teacher Adoption', score: 86, status: 'positive' },
      { name: 'Data Coverage', score: 79, status: 'positive' }
    ]
  };

  const reportsData = [
    { name: 'Academic Performance Report', type: 'PDF', date: '2026-01-10', status: 'Ready' },
    { name: 'Engagement Analytics', type: 'CSV', date: '2026-01-10', status: 'Ready' },
    { name: 'Teacher Utilization', type: 'PDF', date: '2026-01-09', status: 'Ready' },
    { name: 'Student Progress Summary', type: 'CSV', date: '2026-01-08', status: 'Ready' }
  ];

  const alerts = [
    { type: 'warning', message: 'Language department mastery below target', action: 'Review curriculum' },
    { type: 'info', message: '7 teachers pending onboarding completion', action: 'Send reminder' },
    { type: 'success', message: 'Overall engagement up 2.8% this month', action: 'Share with faculty' }
  ];

  const renderMasteryTrendChart = () => {
    const maxValue = Math.max(...masteryTrendData.map(d => d.value));
    return (
      <div className="trend-chart">
        {masteryTrendData.map((data, index) => {
          const height = (data.value / maxValue) * 100;
          return (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{ height: `${height}%` }}
                title={`${data.month}: ${data.value}%`}
              >
                <span className="bar-value">{data.value}%</span>
              </div>
              <span className="chart-label">{data.month}</span>
            </div>
          );
        })}
        <div className="chart-trend-line">
          <svg viewBox="0 0 400 120" className="trend-line-svg">
            <polyline
              points={masteryTrendData.map((d, i) => 
                `${(i * 100) + 50},${120 - (d.value / maxValue * 100)}`
              ).join(' ')}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    );
  };

  const getConfidenceColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLevel = (score) => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div className="admin-dashboard-container">
      {/* Left Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="logo"><FaUserTie /> SmartEd Admin</h2>
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
      <main className="admin-main-content">
        {/* Top Bar */}
        <header className="admin-top-bar">
          <div className="top-bar-left">
            <div className="institution-selector">
              <select 
                value={selectedInstitution} 
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="institution-dropdown"
              >
                {institutions.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
              <MdArrowDropDown className="dropdown-icon" />
            </div>
            <div className="date-range-selector">
              <MdDateRange className="range-icon" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="date-dropdown"
              >
                {dateRanges.map((range) => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="top-bar-actions">
            <button className="export-btn">
              <MdFileDownload />
              Export Reports
            </button>
            <button className="notification-btn">
              <MdNotifications />
              {adminData.notifications > 0 && (
                <span className="notification-badge">{adminData.notifications}</span>
              )}
            </button>
            <div className="profile-section">
              <button 
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-info">
                  <span className="profile-name">{adminData.name}</span>
                  <span className="profile-role">{adminData.role}</span>
                </div>
                <div className="profile-avatar"><FaUserTie /></div>
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
        <div className="admin-dashboard-content">
          {activeNav === 'overview' && (
            <>
          {/* Key Institutional KPIs */}
          <section className="admin-kpi-section">
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrapper mastery">
                <MdSchool />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-label">Overall Mastery Rate</h3>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{kpiData.overallMastery}%</span>
                  <span className="kpi-trend positive">
                    <MdTrendingUp /> {kpiData.masteryTrend}%
                  </span>
                </div>
                <p className="kpi-subtitle">Institutional average across all subjects</p>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrapper engagement">
                <MdPeople />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-label">Avg Student Engagement</h3>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{kpiData.avgEngagement}%</span>
                  <span className="kpi-trend positive">
                    <MdTrendingUp /> {kpiData.engagementTrend}%
                  </span>
                </div>
                <p className="kpi-subtitle">Platform activity and participation</p>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrapper adoption">
                <MdGroup />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-label">Teacher Adoption Rate</h3>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{kpiData.teacherAdoption}%</span>
                  <span className="kpi-trend positive">
                    <MdTrendingUp /> {kpiData.adoptionTrend}%
                  </span>
                </div>
                <p className="kpi-subtitle">Active platform utilization by faculty</p>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrapper students">
                <MdCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-label">Active Students</h3>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{kpiData.activeStudents}/{kpiData.totalStudents}</span>
                  <span className="kpi-trend positive">
                    <MdTrendingUp /> {kpiData.studentTrend}%
                  </span>
                </div>
                <p className="kpi-subtitle">Enrolled students with activity data</p>
              </div>
            </div>
          </section>

          {/* Academic Performance Overview */}
          <section className="academic-section">
            <div className="section-card large-card">
              <div className="card-header">
                <h3 className="section-title">
                  <FaChartLine /> Academic Performance Trends
                </h3>
                <span className="trend-indicator positive">↑ Improving</span>
              </div>
              {renderMasteryTrendChart()}
            </div>

            <div className="section-card">
              <h3 className="section-title">Subject-wise Performance</h3>
              <div className="subject-grid">
                {subjectMastery.map((subject) => (
                  <div key={subject.subject} className={`subject-card subject-${subject.status}`}>
                    <div className="subject-header">
                      <span className="subject-name">{subject.subject}</span>
                      <span className={`subject-trend ${subject.trend >= 0 ? 'positive' : 'negative'}`}>
                        {subject.trend >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                        {Math.abs(subject.trend)}%
                      </span>
                    </div>
                    <div className="subject-mastery">{subject.mastery}%</div>
                    {subject.status === 'low' && (
                      <div className="attention-badge">
                        <MdWarning /> Needs Attention
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Teacher Adoption & Engagement */}
          <section className="adoption-engagement-section">
            <div className="section-card">
              <h3 className="section-title">Teacher Platform Usage</h3>
              <div className="usage-stats">
                <div className="usage-summary">
                  <span className="usage-percentage">{kpiData.teacherAdoption}%</span>
                  <span className="usage-label">Overall Adoption</span>
                </div>
                <div className="usage-breakdown">
                  {teacherUsage.map((usage) => (
                    <div key={usage.level} className="usage-item">
                      <div className="usage-bar-wrapper">
                        <div 
                          className="usage-bar"
                          style={{ 
                            width: `${usage.percentage}%`,
                            backgroundColor: usage.color 
                          }}
                        ></div>
                      </div>
                      <div className="usage-info">
                        <span className="usage-level">{usage.level}</span>
                        <span className="usage-count">{usage.count} teachers ({usage.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title">Institutional Engagement</h3>
              <div className="engagement-overview">
                <div className="engagement-circle">
                  <svg viewBox="0 0 200 200" className="circle-chart">
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#2a2a40" strokeWidth="20"/>
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="70" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="20"
                      strokeDasharray={`${(engagementDistribution.high / 100) * 440} 440`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="70" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="20"
                      strokeDasharray={`${(engagementDistribution.medium / 100) * 440} 440`}
                      strokeDashoffset={-((engagementDistribution.high / 100) * 440)}
                      transform="rotate(-90 100 100)"
                    />
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="70" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="20"
                      strokeDasharray={`${(engagementDistribution.low / 100) * 440} 440`}
                      strokeDashoffset={-(((engagementDistribution.high + engagementDistribution.medium) / 100) * 440)}
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="circle-center">
                    <span className="center-value">{engagementDistribution.coverage}%</span>
                    <span className="center-label">Coverage</span>
                  </div>
                </div>
                <div className="engagement-legend">
                  <div className="legend-item">
                    <span className="legend-color high"></span>
                    <span className="legend-text">High ({engagementDistribution.high}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color medium"></span>
                    <span className="legend-text">Medium ({engagementDistribution.medium}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color low"></span>
                    <span className="legend-text">Low ({engagementDistribution.low}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Confidence Score */}
          <section className="confidence-section">
            <div className="section-card confidence-card">
              <div className="card-header">
                <h3 className="section-title">
                  <FaBrain /> AI-Generated Confidence Score
                </h3>
                <FaShieldAlt className="shield-icon" />
              </div>
              <div className="confidence-main">
                <div className="confidence-gauge">
                  <div className="gauge-value" style={{ color: getConfidenceColor(confidenceScore.score) }}>
                    {confidenceScore.score}
                  </div>
                  <div className="gauge-label">{getConfidenceLevel(confidenceScore.score)} Confidence</div>
                </div>
                <p className="confidence-description">
                  Based on mastery trends, engagement consistency, and teacher adoption metrics
                </p>
              </div>
              <div className="confidence-factors">
                {confidenceScore.factors.map((factor) => (
                  <div key={factor.name} className="factor-item">
                    <div className="factor-header">
                      <span className="factor-name">{factor.name}</span>
                      <span className="factor-score">{factor.score}%</span>
                    </div>
                    <div className="factor-bar">
                      <div 
                        className="factor-progress"
                        style={{ 
                          width: `${factor.score}%`,
                          backgroundColor: getConfidenceColor(factor.score)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card alerts-card">
              <h3 className="section-title">
                <MdInfo /> System Alerts
              </h3>
              <div className="alerts-list">
                {alerts.map((alert, index) => (
                  <div key={index} className={`alert-item alert-${alert.type}`}>
                    <div className="alert-icon">
                      {alert.type === 'warning' && <MdWarning />}
                      {alert.type === 'info' && <MdInfo />}
                      {alert.type === 'success' && <MdCheckCircle />}
                    </div>
                    <div className="alert-content">
                      <p className="alert-message">{alert.message}</p>
                      <p className="alert-action">→ {alert.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reports & Governance */}
          <section className="reports-section">
            <div className="section-card">
              <div className="card-header">
                <h3 className="section-title">
                  <MdAssessment /> Exportable Reports
                </h3>
                <button className="download-all-btn">
                  <MdFileDownload /> Download All
                </button>
              </div>
              <div className="reports-table">
                {reportsData.map((report, index) => (
                  <div key={index} className="report-row">
                    <div className="report-info">
                      <span className="report-name">{report.name}</span>
                      <span className="report-meta">{report.type} • {report.date}</span>
                    </div>
                    <div className="report-actions">
                      <span className="report-status">{report.status}</span>
                      <button className="download-btn">
                        <MdFileDownload />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card governance-card">
              <h3 className="section-title">
                <FaShieldAlt /> Data Governance
              </h3>
              <div className="governance-items">
                <div className="governance-item">
                  <MdCheckCircle className="check-icon" />
                  <div className="governance-text">
                    <span className="governance-label">Academic Audit Readiness</span>
                    <span className="governance-value">100% Compliant</span>
                  </div>
                </div>
                <div className="governance-item">
                  <MdCheckCircle className="check-icon" />
                  <div className="governance-text">
                    <span className="governance-label">Data Privacy Standards</span>
                    <span className="governance-value">FERPA Compliant</span>
                  </div>
                </div>
                <div className="governance-item">
                  <MdCheckCircle className="check-icon" />
                  <div className="governance-text">
                    <span className="governance-label">AI Transparency</span>
                    <span className="governance-value">Full Disclosure</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
            </>
          )}
          {activeNav === 'academics' && <AdminAcademics onNavigate={setActiveNav} />}
          {activeNav === 'engagement' && <AdminEngagement onNavigate={setActiveNav} />}
          {activeNav === 'teachers' && <AdminTeachers onNavigate={setActiveNav} />}
          {activeNav === 'reports' && <AdminReports onNavigate={setActiveNav} />}
          {activeNav === 'settings' && <AdminSettings onNavigate={setActiveNav} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
