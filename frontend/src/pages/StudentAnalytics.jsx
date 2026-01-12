import React, { useState, useEffect } from 'react';
import { 
  MdTrendingUp, 
  MdTrendingDown,
  MdExpandMore,
  MdExpandLess,
  MdLightbulb,
  MdShowChart,
  MdBarChart,
  MdTimeline,
  MdAutoAwesome
} from 'react-icons/md';
import { FaBrain, FaChartLine } from 'react-icons/fa';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';
import './StudentAnalytics.css';

const StudentAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        setLoading(false);
      } else {
        setError('Failed to load analytics data');
        setLoading(false);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const generateAIInsight = (mastery, engagement) => {
    if (engagement.score > 75 && mastery.overall > 70) {
      return "🎯 Excellent work! Your high engagement is directly reflected in your strong mastery scores.";
    } else if (engagement.score < 50 && mastery.overall < 60) {
      return "💡 Your mastery improves significantly when engagement is high. Try dedicating more focused study time.";
    } else if (engagement.score > 70 && mastery.overall < 60) {
      return "📚 You're putting in the time! Consider changing your study approach for better retention.";
    } else if (mastery.overall > 70 && engagement.score < 60) {
      return "⚡ You're efficient! Small amounts of focused effort yield great results for you.";
    }
    return "📈 Keep consistent engagement to maintain steady mastery growth.";
  };

  const getEngagementMasteryCorrelation = (weeklyPerf, engagement) => {
    if (!weeklyPerf || weeklyPerf.length < 3) return null;
    
    const avgScore = weeklyPerf.reduce((sum, w) => sum + w.score, 0) / weeklyPerf.length;
    const engScore = engagement.score;
    
    if (engScore > 70 && avgScore > 70) {
      return "High engagement weeks correlate with higher quiz scores (+15% average).";
    } else if (engScore < 50) {
      return "Low engagement weeks show 20% lower performance. Consistency is key!";
    }
    return "Your performance remains steady regardless of engagement fluctuations.";
  };

  const renderMasteryTimeline = (weeklyData) => {
    if (!weeklyData || weeklyData.length === 0) {
      return <div className="no-data">Not enough data for timeline</div>;
    }

    const maxValue = Math.max(...weeklyData.map(d => d.score), 100);
    const minValue = Math.min(...weeklyData.map(d => d.score), 0);
    const range = maxValue - minValue || 1;

    return (
      <div className="timeline-chart">
        <svg viewBox="0 0 600 200" className="timeline-svg">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value, i) => {
            const y = 180 - (value * 1.6);
            return (
              <g key={i}>
                <line 
                  x1="40" 
                  y1={y} 
                  x2="580" 
                  y2={y} 
                  stroke="rgba(99, 102, 241, 0.1)" 
                  strokeWidth="1"
                />
                <text 
                  x="25" 
                  y={y + 5} 
                  fill="#9ca3af" 
                  fontSize="12"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Line path */}
          <path
            d={weeklyData.map((point, i) => {
              const x = 60 + (i * (520 / Math.max(weeklyData.length - 1, 1)));
              const y = 180 - ((point.score / 100) * 160);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="url(#masteryGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {weeklyData.map((point, i) => {
            const x = 60 + (i * (520 / Math.max(weeklyData.length - 1, 1)));
            const y = 180 - ((point.score / 100) * 160);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#6366f1"
                  stroke="#1a1a2e"
                  strokeWidth="2"
                />
                <title>Week {i + 1}: {point.score}%</title>
              </g>
            );
          })}

          {/* X-axis labels */}
          {weeklyData.map((point, i) => {
            const x = 60 + (i * (520 / Math.max(weeklyData.length - 1, 1)));
            return (
              <text 
                key={i}
                x={x} 
                y="195" 
                fill="#9ca3af" 
                fontSize="11"
                textAnchor="middle"
              >
                W{i + 1}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderEngagementChart = (sessionCount, totalHours, score) => {
    const maxSessions = 50;
    const sessionPercentage = (sessionCount / maxSessions) * 100;
    const hoursPercentage = (totalHours / 40) * 100;

    return (
      <div className="engagement-bars">
        <div className="engagement-bar-item">
          <div className="bar-label">
            <span>Sessions</span>
            <span className="bar-value">{sessionCount}</span>
          </div>
          <div className="bar-track">
            <div 
              className="bar-fill sessions"
              style={{ width: `${Math.min(sessionPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="engagement-bar-item">
          <div className="bar-label">
            <span>Study Hours</span>
            <span className="bar-value">{totalHours}h</span>
          </div>
          <div className="bar-track">
            <div 
              className="bar-fill hours"
              style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="engagement-bar-item">
          <div className="bar-label">
            <span>Engagement Score</span>
            <span className="bar-value">{score}%</span>
          </div>
          <div className="bar-track">
            <div 
              className="bar-fill score"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchAnalyticsData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { profile, mastery, engagement, weekly_performance, recommendations } = analyticsData;
  const aiInsight = generateAIInsight(mastery, engagement);
  const correlation = getEngagementMasteryCorrelation(weekly_performance, engagement);

  return (
    <div className="dashboard-container">
      <StudentSidebar activeNav="analytics" />
      <div className="main-content">
        <StudentNavbar profileName={profile?.name} />
        <div className="analytics-container">
          <div className="analytics-header">
        <h1 className="analytics-title">
          <MdShowChart /> Your Learning Analytics
        </h1>
        <p className="analytics-subtitle">
          Track your progress, identify strengths, and discover growth opportunities
        </p>
      </div>

      {/* Overall Performance Summary */}
      <section className="performance-summary">
        <div className="summary-card mastery-summary">
          <div className="summary-icon">
            <FaBrain />
          </div>
          <div className="summary-content">
            <h3>Overall Mastery</h3>
            <div className="summary-value">{mastery.overall}%</div>
            <p className="summary-text">Across {mastery.subject_count} subjects</p>
          </div>
          <div className="summary-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="8"/>
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="8"
                strokeDasharray={`${(mastery.overall / 100) * 251.2} 251.2`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>

        <div className="summary-card engagement-summary">
          <div className="summary-icon">
            <FaChartLine />
          </div>
          <div className="summary-content">
            <h3>Engagement Index</h3>
            <div className="summary-value">{engagement.score}%</div>
            <p className="summary-text">{engagement.streak_days} day streak 🔥</p>
          </div>
          <div className="summary-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="8"/>
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="8"
                strokeDasharray={`${(engagement.score / 100) * 251.2} 251.2`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>

        <div className="ai-insight-card">
          <div className="insight-icon">
            <MdAutoAwesome />
          </div>
          <p className="insight-text">{aiInsight}</p>
        </div>
      </section>

      {/* Subject-wise Analytics */}
      <section className="subject-analytics">
        <h2 className="section-title">
          <MdBarChart /> Subject Performance
        </h2>
        <div className="subjects-grid">
          {mastery.by_subject && mastery.by_subject.map((subject) => {
            const isExpanded = expandedSubject === subject.subject;
            const trend = subject.score >= 70 ? 'up' : subject.score >= 50 ? 'stable' : 'down';

            return (
              <div key={subject.subject} className={`subject-card ${isExpanded ? 'expanded' : ''}`}>
                <div 
                  className="subject-header"
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.subject)}
                >
                  <div className="subject-info">
                    <h4>{subject.subject}</h4>
                    <span className="topic-count">{subject.topics?.length || 0} topics</span>
                  </div>
                  <div className="subject-metrics">
                    <span className="subject-score">{subject.score}%</span>
                    <div className={`trend-badge trend-${trend}`}>
                      {trend === 'up' ? <MdTrendingUp /> : trend === 'down' ? <MdTrendingDown /> : '—'}
                    </div>
                    {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                  </div>
                </div>

                <div className="subject-progress-bar">
                  <div 
                    className={`progress-fill ${trend}`}
                    style={{ width: `${subject.score}%` }}
                  ></div>
                </div>

                {isExpanded && (
                  <div className="subject-details">
                    <p className="detail-label">Performance Level</p>
                    <p className="detail-value">
                      {subject.score >= 75 ? '🌟 Advanced' : subject.score >= 50 ? '📈 Developing' : '🎯 Needs Focus'}
                    </p>
                    <p className="detail-hint">
                      {subject.score >= 75 
                        ? 'Excellent understanding! Keep challenging yourself.' 
                        : subject.score >= 50 
                        ? 'Good progress! Practice more to reach mastery.'
                        : 'Focus on fundamentals. Break topics into smaller chunks.'}
                    </p>
                    
                    {subject.topics && subject.topics.length > 0 && (
                      <div className="topic-breakdown">
                        <p className="detail-label" style={{ marginTop: '16px' }}>Topic Breakdown</p>
                        {subject.topics.slice(0, 5).map((topic, idx) => (
                          <div key={idx} className="topic-item" style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: '8px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{topic.topic}</span>
                              <span style={{ 
                                fontSize: '13px', 
                                fontWeight: '600',
                                color: topic.mastery >= 70 ? '#10b981' : topic.mastery >= 50 ? '#f59e0b' : '#ef4444'
                              }}>
                                {topic.mastery}%
                              </span>
                            </div>
                            {topic.predicted_score && (
                              <div style={{ fontSize: '11px', color: '#818cf8', marginTop: '2px', fontStyle: 'italic' }}>
                                Predicted next: {topic.predicted_score}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mastery Over Time */}
      <section className="mastery-timeline-section">
        <h2 className="section-title">
          <MdTimeline /> Mastery Progression
        </h2>
        <div className="timeline-card">
          {renderMasteryTimeline(weekly_performance)}
          <p className="timeline-caption">
            Weekly performance trend • {weekly_performance && weekly_performance.length} weeks of data
          </p>
        </div>
      </section>

      {/* Engagement Analytics */}
      <section className="engagement-analytics">
        <h2 className="section-title">
          <FaChartLine /> Engagement Breakdown
        </h2>
        <div className="engagement-card">
          {renderEngagementChart(
            engagement.session_count,
            engagement.total_time_hours,
            engagement.score
          )}
          {profile.predicted_engagement && (
            <div className="predicted-engagement-box">
              <div className="predicted-engagement-label">
                <MdAutoAwesome /> AI Forecasted Engagement
              </div>
              <div className="predicted-engagement-value">
                {profile.predicted_engagement}<span>%</span>
              </div>
              <div className="predicted-engagement-note">
                Predicted engagement for your next session based on current patterns.
              </div>
            </div>
          )}
        </div>
        {correlation && (
          <div className="correlation-insight">
            <MdLightbulb />
            <p>{correlation}</p>
          </div>
        )}
      </section>

      {/* AI Insights Panel */}
      <section className="ai-insights-section">
        <h2 className="section-title">
          <FaBrain /> AI-Powered Insights
        </h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-badge strength">Strength</div>
            <h4>Your Learning Style</h4>
            <p>
              {profile.learning_style === 'visual' 
                ? '👁️ You learn best through visual content. Use diagrams and charts more often!'
                : profile.learning_style === 'textual'
                ? '📖 Reading and writing reinforce your learning. Take detailed notes!'
                : '🎨 Mixed learning works for you. Combine videos, reading, and practice!'}
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-badge opportunity">Opportunity</div>
            <h4>Growth Area</h4>
            <p>
              {mastery.by_subject && mastery.by_subject.length > 0
                ? `Focus on ${mastery.by_subject.sort((a, b) => a.score - b.score)[0].subject} to boost overall mastery.`
                : 'Keep practicing across all subjects for balanced growth.'}
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-badge pattern">Pattern</div>
            <h4>Study Pattern</h4>
            <p>
              {engagement.streak_days > 5
                ? `🔥 ${engagement.streak_days} day streak! Consistency is your superpower.`
                : 'Build a daily study habit. Even 15 minutes helps maintain momentum!'}
            </p>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
