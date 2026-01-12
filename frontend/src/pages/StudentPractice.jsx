import React, { useState, useEffect } from 'react';
import { 
  MdLightbulb,
  MdCheckCircle,
  MdTimer,
  MdTrendingUp,
  MdPlayArrow,
  MdAutoAwesome,
  MdSpeed,
  MdSchool,
  MdHistory,
  MdRefresh,
  MdFlashOn,
  MdEmojiEvents
} from 'react-icons/md';
import { FaBrain, FaFire, FaChartLine } from 'react-icons/fa';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';
import './StudentPractice.css';

const StudentPractice = () => {
  const [practiceData, setPracticeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState('recommended');

  useEffect(() => {
    fetchPracticeData();
  }, []);

  const fetchPracticeData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/practice', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPracticeData(data);
        setLoading(false);
      } else {
        setError('Failed to load practice data');
        setLoading(false);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const generatePracticeTasks = (recommendations, challenges) => {
    const tasks = [];

    // From API recommendations (weak areas & AI)
    if (recommendations && recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        const isAI = rec.type === 'ai_recommended';
        tasks.push({
          id: `${rec.type}-${index}`,
          subject: rec.subject,
          topic: rec.topic,
          difficulty: isAI ? 'Custom' : 'Medium',
          reason: rec.reason,
          estimatedTime: isAI ? '10-15 min' : '15-20 min',
          type: rec.type || 'improvement',
          priority: isAI ? 'critical' : 'high',
          icon: isAI ? MdAutoAwesome : MdTrendingUp,
          current_mastery: rec.current_mastery
        });
      });
    }

    // From API challenges (strong subjects)
    if (challenges && challenges.length > 0) {
      challenges.forEach((challenge, index) => {
        tasks.push({
          id: `challenge-${index}`,
          subject: challenge.subject,
          topic: challenge.topic,
          difficulty: 'Advanced',
          reason: challenge.reason,
          estimatedTime: '20-25 min',
          type: challenge.type || 'challenge',
          priority: 'medium',
          icon: MdEmojiEvents,
          current_mastery: challenge.current_mastery
        });
      });
    }

    return tasks;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getReadinessScore = (mastery, engagement) => {
    const score = (mastery.overall * 0.6) + (engagement.score * 0.4);
    return Math.round(score);
  };

  const getReadinessMessage = (score) => {
    if (score >= 80) {
      return {
        text: "You're in peak learning mode! Tackle challenging concepts now.",
        emoji: "🚀",
        color: "#10b981"
      };
    } else if (score >= 60) {
      return {
        text: "Good momentum! Focus on recommended tasks to build mastery.",
        emoji: "💪",
        color: "#6366f1"
      };
    } else {
      return {
        text: "Let's build momentum with some quick wins. Start with easier tasks.",
        emoji: "🌱",
        color: "#f59e0b"
      };
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const handleStartPractice = (task) => {
    // In production, this would navigate to practice session
    alert(`Starting practice: ${task.subject} - ${task.topic}`);
  };

  if (loading) {
    return (
      <div className="practice-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading practice recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchPracticeData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!practiceData) return null;

  const { profile, mastery, recommendations, challenges, practice_history, streak_days } = practiceData;
  const practiceTasks = generatePracticeTasks(recommendations, challenges);
  const practiceHistory = (practice_history || []).map(p => ({
    id: p.timestamp,
    subject: p.subject,
    topic: p.topic,
    completedAt: formatTimestamp(p.timestamp),
    score: p.score,
    questionsAttempted: 10,
    status: p.score > 0 ? 'completed' : 'incomplete',
    difficulty: p.difficulty
  }));
  const readinessScore = mastery?.overall || 0;
  const readinessInfo = getReadinessMessage(readinessScore);

  // Filter tasks by mode
  const filteredTasks = activeMode === 'recommended' 
    ? practiceTasks.filter(t => t.type === 'improvement' || t.type === 'ai_recommended')
    : activeMode === 'challenge'
    ? practiceTasks.filter(t => t.type === 'challenge')
    : practiceTasks.filter(t => t.type === 'revision');

  return (
    <div className="dashboard-container">
      <StudentSidebar activeNav="practice" />
      <div className="main-content">
        <StudentNavbar profileName={profile?.name} />
        <div className="practice-container">
          <div className="practice-header">
        <h1 className="practice-title">
          <MdLightbulb /> Adaptive Practice
        </h1>
        <p className="practice-subtitle">
          AI-powered recommendations for your next learning action
        </p>
      </div>

      {/* Adaptive Practice Overview */}
      <section className="practice-overview">
        <div className="readiness-card">
          <div className="readiness-header">
            <FaBrain className="readiness-icon" />
            <div className="readiness-content">
              <h3>Your Learning Readiness</h3>
              <p className="readiness-message" style={{ color: readinessInfo.color }}>
                {readinessInfo.emoji} {readinessInfo.text}
              </p>
            </div>
          </div>
          <div className="readiness-meter">
            <div className="meter-label">Readiness Score</div>
            <div className="meter-bar">
              <div 
                className="meter-fill"
                style={{ 
                  width: `${readinessScore}%`,
                  background: `linear-gradient(90deg, ${readinessInfo.color}, ${readinessInfo.color}dd)`
                }}
              >
                <span className="meter-value">{readinessScore}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <MdSchool className="stat-icon" />
            <div className="stat-value">{mastery.overall}%</div>
            <div className="stat-label">Overall Mastery</div>
          </div>
          <div className="stat-card">
            <FaFire className="stat-icon fire" />
            <div className="stat-value">{streak_days || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <MdAutoAwesome className="stat-icon" />
            <div className="stat-value">{practiceTasks.length}</div>
            <div className="stat-label">Tasks Ready</div>
          </div>
        </div>
      </section>

      {/* Skill-Building Mode Selector */}
      <section className="mode-selector">
        <button 
          className={`mode-btn ${activeMode === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveMode('recommended')}
        >
          <MdTrendingUp />
          <span>Recommended</span>
          <span className="mode-count">{practiceTasks.filter(t => t.type === 'improvement' || t.type === 'ai_recommended').length}</span>
        </button>
        <button 
          className={`mode-btn ${activeMode === 'revision' ? 'active' : ''}`}
          onClick={() => setActiveMode('revision')}
        >
          <MdRefresh />
          <span>Quick Revision</span>
          <span className="mode-count">{practiceTasks.filter(t => t.type === 'revision').length}</span>
        </button>
        <button 
          className={`mode-btn ${activeMode === 'challenge' ? 'active' : ''}`}
          onClick={() => setActiveMode('challenge')}
        >
          <MdEmojiEvents />
          <span>Challenge Mode</span>
          <span className="mode-count">{practiceTasks.filter(t => t.type === 'challenge').length}</span>
        </button>
      </section>

      {/* Recommended Practice Tasks */}
      <section className="practice-tasks-section">
        <h2 className="section-title">
          {activeMode === 'recommended' && '🎯 Focus on These Concepts'}
          {activeMode === 'revision' && '📚 Quick Revision Tasks'}
          {activeMode === 'challenge' && '🏆 Challenge Yourself'}
        </h2>

        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <MdCheckCircle />
            <p>No tasks available in this mode</p>
            <p className="no-tasks-hint">Try switching to another mode or check back later!</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => {
              const TaskIcon = task.icon;
              return (
                <div key={task.id} className={`task-card priority-${task.priority} type-${task.type}`}>
                  <div className="task-header">
                    <div className="task-icon-wrapper">
                      <TaskIcon />
                    </div>
                    <span 
                      className="difficulty-badge"
                      style={{ background: `${getDifficultyColor(task.difficulty)}22`, color: getDifficultyColor(task.difficulty) }}
                    >
                      {task.difficulty}
                    </span>
                  </div>

                  <div className="task-content">
                    <div className="task-subject">{task.subject}</div>
                    <h4 className="task-topic">{task.topic}</h4>
                    <p className="task-reason">
                      <MdLightbulb className="reason-icon" />
                      {task.reason}
                    </p>
                  </div>

                  <div className="task-footer">
                    <div className="task-time">
                      <MdTimer />
                      <span>{task.estimatedTime}</span>
                    </div>
                    <button 
                      className="start-btn"
                      onClick={() => handleStartPractice(task)}
                    >
                      <MdPlayArrow />
                      Start Practice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Practice History */}
      <section className="practice-history-section">
        <h2 className="section-title">
          <MdHistory /> Recent Practice Sessions
        </h2>

        <div className="history-list">
          {practiceHistory.map((session) => (
            <div key={session.id} className={`history-item ${session.status}`}>
              <div className="history-left">
                <div className={`history-status ${session.status}`}>
                  {session.status === 'completed' ? <MdCheckCircle /> : <MdTimer />}
                </div>
                <div className="history-info">
                  <h4 className="history-subject">{session.subject}</h4>
                  <p className="history-topic">{session.topic}</p>
                  <span className="history-time">{session.completedAt}</span>
                </div>
              </div>

              <div className="history-right">
                {session.status === 'completed' ? (
                  <>
                    <div className="history-score">
                      <div className="score-value">{session.score}%</div>
                      <div className="score-label">Score</div>
                    </div>
                    <div className="history-questions">
                      <div className="questions-value">{session.questionsAttempted}</div>
                      <div className="questions-label">Questions</div>
                    </div>
                  </>
                ) : (
                  <button className="resume-btn">
                    <MdPlayArrow />
                    Resume
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};

export default StudentPractice;
