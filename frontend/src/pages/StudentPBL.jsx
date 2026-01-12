import React, { useState, useEffect } from 'react';
import { 
  MdGroups,
  MdAssignment,
  MdCheckCircle,
  MdAccessTime,
  MdTrendingUp,
  MdStar,
  MdEdit,
  MdExpandMore,
  MdExpandLess,
  MdLightbulb,
  MdAutoAwesome,
  MdPeople,
  MdFlag,
  MdCalendarToday
} from 'react-icons/md';
import { FaUserFriends, FaBrain, FaAward, FaHandshake } from 'react-icons/fa';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';
import './StudentPBL.css';

const StudentPBL = () => {
  const [pblData, setPblData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    fetchPBLData();
  }, []);

  const fetchPBLData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPblData(data);
        setLoading(false);
      } else {
        setError('Failed to load PBL data');
        setLoading(false);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { text: 'Overdue', color: '#ef4444', urgent: true };
    } else if (daysRemaining <= 3) {
      return { text: `${daysRemaining} days left`, color: '#f59e0b', urgent: true };
    } else if (daysRemaining <= 7) {
      return { text: `${daysRemaining} days left`, color: '#fbbf24', urgent: false };
    } else {
      return { text: `${daysRemaining} days left`, color: '#10b981', urgent: false };
    }
  };

  const generateAIReflection = (project) => {
    const isCompleted = project.completion >= 100;
    const projectTitle = `Project #${project.id.substring(0, 8)}`;
    
    if (isCompleted) {
      return `Outstanding work on ${projectTitle}! This project significantly strengthened your ${project.collaboration >= 4 ? 'collaboration' : 'leadership'} skills. Your consistent effort resulted in a perfect completion rate. Key growth: Practical application of concepts in your role as ${project.role}.`;
    } else if (project.completion >= 60) {
      return `Great progress on ${projectTitle}! You're demonstrating strong momentum in your role as ${project.role}. Keep up the steady contribution—your current peer score of ${project.peer_score?.toFixed(1) || 'N/A'} shows you're a valuable team player.`;
    } else {
      return `${projectTitle} is off to a solid start! Focus on hitting your core milestones to increase your ${project.completion}% completion rate. Your contribution as ${project.role} is essential for the team's success.`;
    }
  };

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <MdStar 
            key={i} 
            className={i < fullStars ? 'star filled' : i === fullStars && hasHalfStar ? 'star half' : 'star empty'}
          />
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pbl-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pbl-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchPBLData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!pblData) return null;

  const { profile, projects } = pblData;
  
  // If no projects from API, show empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="dashboard-container">
        <StudentSidebar activeNav="pbl" />
        <div className="main-content">
          <StudentNavbar profileName={profile?.name} />
          <div className="pbl-container">
            <div className="pbl-header">
              <h1 className="pbl-title">
                <MdGroups /> Project-Based Learning
              </h1>
              <p className="pbl-subtitle">
                Collaborate, create, and showcase real-world projects
              </p>
            </div>
            <div className="empty-state">
              <MdAssignment style={{ fontSize: '64px', color: '#6366f1', marginBottom: '16px' }} />
              <h3>No Active Projects</h3>
              <p>You haven't joined any projects yet. Contact your teacher to get started with collaborative learning!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // API returns: id, role, tasks_completed, peer_score, collaboration, completion, created_at
  const activeProjects = projects.filter(p => p.completion < 100);
  const completedProjects = projects.filter(p => p.completion >= 100);

  return (
    <div className="dashboard-container">
      <StudentSidebar activeNav="pbl" />
      <div className="main-content">
        <StudentNavbar profileName={profile?.name} />
        <div className="pbl-container">
          <div className="pbl-header">
        <h1 className="pbl-title">
          <MdGroups /> Project-Based Learning
        </h1>
        <p className="pbl-subtitle">
          Collaborate, create, and apply knowledge to real-world challenges
        </p>
      </div>

      {/* Stats Overview */}
      <section className="pbl-stats">
        <div className="stat-box">
          <FaUserFriends className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{activeProjects.length}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>
        <div className="stat-box">
          <FaAward className="stat-icon gold" />
          <div className="stat-content">
            <div className="stat-value">{completedProjects.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-box">
          <FaHandshake className="stat-icon green" />
          <div className="stat-content">
            <div className="stat-value">
              {projects.reduce((sum, p) => sum + (p.tasks_completed || 0), 0)}
            </div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div>
        <div className="stat-box">
          <MdTrendingUp className="stat-icon purple" />
          <div className="stat-content">
            <div className="stat-value">
              {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.completion || 0), 0) / projects.length) : 0}%
            </div>
            <div className="stat-label">Avg Progress</div>
          </div>
        </div>
      </section>

      {/* Active Projects */}
      <section className="projects-section">
        <h2 className="section-title">
          <MdFlag /> Active Projects
        </h2>

        {activeProjects.length === 0 ? (
          <div className="no-projects">
            <MdAssignment />
            <p>No active projects</p>
            <p className="no-projects-hint">New projects will appear here when assigned</p>
          </div>
        ) : (
          <div className="projects-grid">
            {activeProjects.map((project) => {
              const isExpanded = selectedProject?.id === project.id;

              return (
                <div key={project.id} className={`project-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="project-header">
                    <div className="project-title-section">
                      <h3 className="project-title">Project #{project.id}</h3>
                      <div className="project-meta">
                        <span className="project-subject">Role: {project.role}</span>
                      </div>
                    </div>
                    <button 
                      className="expand-btn"
                      onClick={() => setSelectedProject(isExpanded ? null : project)}
                    >
                      {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                    </button>
                  </div>

                  <div className="project-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span className="progress-percent">{project.completion}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="project-stats" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '12px',
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
                        {project.tasks_completed}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Tasks Done</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                        {renderStarRating(project.peer_score || 0)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Peer Score</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                        {project.collaboration ? project.collaboration.toFixed(1) : 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Collaboration</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="project-details" style={{ 
                      marginTop: '16px', 
                      padding: '16px', 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      borderRadius: '12px',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#818cf8' }}>
                        <MdAutoAwesome />
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>AI Project Analysis</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '12px' }}>
                        {generateAIReflection(project)}
                      </p>
                      <div style={{ fontSize: '11px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                        <strong>Timeline:</strong> Started on {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <section className="completed-section">
          <h2 className="section-title">
            <MdCheckCircle /> Completed Projects
          </h2>
          <div className="completed-grid">
            {completedProjects.map((project) => (
              <div key={project.id} className="completed-card">
                <div className="completed-badge">
                  <MdCheckCircle /> Completed
                </div>
                <h4>Project #{project.id}</h4>
                <p className="completed-subject">Role: {project.role}</p>
                <div className="completed-stats">
                  <div className="completed-stat">
                    <span className="stat-label">Tasks</span>
                    <span className="stat-value">{project.tasks_completed}</span>
                  </div>
                  <div className="completed-stat">
                    <span className="stat-label">Peer Rating</span>
                    <span className="stat-value">
                      {project.peer_score ? project.peer_score.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
        </div>
      </div>
    </div>
  );
};

export default StudentPBL;
