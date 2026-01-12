import React, { useState, useEffect } from 'react';
import { 
  MdPerson,
  MdSchool,
  MdEmail,
  MdPhone,
  MdEdit,
  MdSave,
  MdCancel,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdDevices,
  MdNotifications,
  MdBrightness4,
  MdPalette,
  MdSpeed,
  MdShield,
  MdPrivacyTip,
  MdCheckCircle,
  MdInfo,
  MdLogout,
  MdCamera
} from 'react-icons/md';
import { FaBrain, FaChartLine, FaEye, FaLock } from 'react-icons/fa';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';
import './StudentSettings.css';

const StudentSettings = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    section: '',
    institution: ''
  });

  const [preferences, setPreferences] = useState({
    learningStyle: 'mixed',
    practiceIntensity: 'moderate',
    notificationFrequency: 'daily',
    theme: 'dark',
    dataSharing: {
      analytics: true,
      mlTraining: true,
      peerComparison: false,
      parentAccess: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
        setFormData({
          name: data.profile.name || '',
          email: data.profile.email || '',
          phone: '',
          grade: data.profile.grade || '',
          section: data.profile.section || '',
          institution: 'Smart Education Institute'
        });
        setPreferences(prev => ({
          ...prev,
          learningStyle: data.profile.learning_style || 'mixed',
          practiceIntensity: data.profile.learning_pace || 'moderate'
        }));
        setLoading(false);
      } else {
        setError('Failed to load settings data');
        setLoading(false);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDataSharingChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      dataSharing: {
        ...prev.dataSharing,
        [key]: !prev.dataSharing[key]
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email
        })
      });

      if (response.ok) {
        setEditMode(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save profile');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          learning_pace: preferences.practiceIntensity,
          preferred_learning_style: preferences.learningStyle
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save preferences');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    // In production, this would call the API
    console.log('Changing password');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: MdPerson },
    { id: 'preferences', label: 'Learning Preferences', icon: FaBrain },
    { id: 'security', label: 'Security', icon: MdLock },
    { id: 'privacy', label: 'Data & Privacy', icon: MdPrivacyTip }
  ];

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchSettingsData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <StudentSidebar activeNav="settings" />
      <div className="main-content">
        <StudentNavbar profileName={profileData?.name} />
        <div className="settings-container">
          <div className="settings-header">
        <h1 className="settings-title">
          <MdPerson /> Account Settings
        </h1>
        <p className="settings-subtitle">
          Manage your profile, preferences, and privacy controls
        </p>
      </div>

      {saveSuccess && (
        <div className="success-banner">
          <MdCheckCircle />
          <span>Changes saved successfully!</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Profile Information</h2>
              {!editMode ? (
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <MdEdit /> Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    <MdSave /> Save
                  </button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>
                    <MdCancel /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="profile-section">
              <div className="avatar-section">
                <div className="avatar-circle">
                  <MdPerson />
                </div>
                {editMode && (
                  <button className="change-avatar-btn">
                    <MdCamera /> Change Photo
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <MdPerson className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <MdEmail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <MdPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Grade</label>
                  <div className="input-wrapper">
                    <MdSchool className="input-icon" />
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="e.g., 10th"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <div className="input-wrapper">
                    <MdSchool className="input-icon" />
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="e.g., A"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Institution</label>
                  <div className="input-wrapper">
                    <MdSchool className="input-icon" />
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="Your school/college name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Learning Preferences</h2>
              <button className="save-btn" onClick={handleSavePreferences}>
                <MdSave /> Save Changes
              </button>
            </div>

            <div className="preferences-section">
              <div className="preference-group">
                <div className="preference-header">
                  <FaBrain className="pref-icon" />
                  <div>
                    <h3>Preferred Learning Style</h3>
                    <p>How you learn best - helps personalize content</p>
                  </div>
                </div>
                <div className="radio-group">
                  {[
                    { value: 'visual', label: 'Visual (Diagrams, Videos, Charts)' },
                    { value: 'textual', label: 'Textual (Reading, Writing, Notes)' },
                    { value: 'auditory', label: 'Auditory (Lectures, Discussions)' },
                    { value: 'kinesthetic', label: 'Kinesthetic (Hands-on, Practice)' },
                    { value: 'mixed', label: 'Mixed (Combination of styles)' }
                  ].map((option) => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="learningStyle"
                        value={option.value}
                        checked={preferences.learningStyle === option.value}
                        onChange={(e) => handlePreferenceChange('learningStyle', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <div className="preference-header">
                  <MdSpeed className="pref-icon" />
                  <div>
                    <h3>Practice Intensity</h3>
                    <p>How challenging you want practice tasks to be</p>
                  </div>
                </div>
                <div className="radio-group">
                  {[
                    { value: 'light', label: 'Light (Easier tasks, longer time)' },
                    { value: 'moderate', label: 'Moderate (Balanced difficulty)' },
                    { value: 'intense', label: 'Intense (Challenging tasks, faster pace)' }
                  ].map((option) => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="practiceIntensity"
                        value={option.value}
                        checked={preferences.practiceIntensity === option.value}
                        onChange={(e) => handlePreferenceChange('practiceIntensity', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <div className="preference-header">
                  <MdNotifications className="pref-icon" />
                  <div>
                    <h3>Notification Frequency</h3>
                    <p>How often you receive learning reminders</p>
                  </div>
                </div>
                <div className="radio-group">
                  {[
                    { value: 'realtime', label: 'Real-time (Instant updates)' },
                    { value: 'daily', label: 'Daily Digest (Once per day)' },
                    { value: 'weekly', label: 'Weekly Summary (Once per week)' },
                    { value: 'none', label: 'None (No notifications)' }
                  ].map((option) => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="notificationFrequency"
                        value={option.value}
                        checked={preferences.notificationFrequency === option.value}
                        onChange={(e) => handlePreferenceChange('notificationFrequency', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Account & Security</h2>
            </div>

            <div className="security-section">
              <div className="security-card">
                <div className="card-header">
                  <MdLock className="card-icon" />
                  <h3>Change Password</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                      <MdLock className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <button
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-wrapper">
                      <MdLock className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                      <MdLock className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>
                </div>
                <button className="primary-btn" onClick={handleChangePassword}>
                  <MdLock /> Update Password
                </button>
              </div>

              <div className="security-card">
                <div className="card-header">
                  <MdDevices className="card-icon" />
                  <h3>Active Sessions</h3>
                </div>
                <div className="sessions-list">
                  <div className="session-item current">
                    <div className="session-info">
                      <MdDevices className="session-icon" />
                      <div>
                        <div className="session-device">Windows PC - Chrome</div>
                        <div className="session-meta">Current session • Last active: Now</div>
                      </div>
                    </div>
                    <span className="current-badge">Current</span>
                  </div>
                  <div className="session-item">
                    <div className="session-info">
                      <MdDevices className="session-icon" />
                      <div>
                        <div className="session-device">Android Phone - Chrome</div>
                        <div className="session-meta">Last active: 2 hours ago</div>
                      </div>
                    </div>
                    <button className="revoke-btn">Revoke</button>
                  </div>
                </div>
              </div>

              <div className="danger-zone">
                <div className="card-header">
                  <MdLogout className="card-icon danger" />
                  <h3>Sign Out</h3>
                </div>
                <p>Sign out from this device</p>
                <button className="danger-btn" onClick={handleLogout}>
                  <MdLogout /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Data & Privacy</h2>
              <button className="save-btn" onClick={handleSavePreferences}>
                <MdSave /> Save Preferences
              </button>
            </div>

            <div className="privacy-section">
              <div className="privacy-info-card">
                <MdInfo className="info-icon" />
                <div>
                  <h3>How SmartEd Uses Your Data</h3>
                  <p>
                    We use your learning data to personalize your experience and improve our AI recommendations. 
                    Your data is encrypted, never sold to third parties, and you have full control over what gets shared.
                  </p>
                </div>
              </div>

              <div className="privacy-card">
                <div className="card-header">
                  <FaBrain className="card-icon" />
                  <h3>AI & Analytics</h3>
                </div>
                <p className="card-description">
                  Control how AI uses your learning data to generate insights and recommendations
                </p>

                <div className="toggle-list">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <FaChartLine className="toggle-icon" />
                      <div>
                        <div className="toggle-label">Performance Analytics</div>
                        <div className="toggle-description">
                          Allow AI to analyze your mastery, engagement, and generate personalized insights
                        </div>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.dataSharing.analytics}
                        onChange={() => handleDataSharingChange('analytics')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <FaBrain className="toggle-icon" />
                      <div>
                        <div className="toggle-label">ML Model Training</div>
                        <div className="toggle-description">
                          Use your anonymized data to improve AI recommendations for all students
                        </div>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.dataSharing.mlTraining}
                        onChange={() => handleDataSharingChange('mlTraining')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="privacy-card">
                <div className="card-header">
                  <FaEye className="card-icon" />
                  <h3>Data Visibility</h3>
                </div>
                <p className="card-description">
                  Choose who can see your learning progress and performance
                </p>

                <div className="toggle-list">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <MdPerson className="toggle-icon" />
                      <div>
                        <div className="toggle-label">Peer Comparison</div>
                        <div className="toggle-description">
                          Allow your anonymized data to appear in class averages and comparisons
                        </div>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.dataSharing.peerComparison}
                        onChange={() => handleDataSharingChange('peerComparison')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <MdPerson className="toggle-icon" />
                      <div>
                        <div className="toggle-label">Parent/Guardian Access</div>
                        <div className="toggle-description">
                          Allow parents to view your dashboard and progress reports
                        </div>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.dataSharing.parentAccess}
                        onChange={() => handleDataSharingChange('parentAccess')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="privacy-card trust-badge">
                <MdShield className="shield-icon" />
                <div>
                  <h3>Your Data is Protected</h3>
                  <ul className="trust-list">
                    <li><MdCheckCircle /> End-to-end encryption for all data</li>
                    <li><MdCheckCircle /> No data sold to third parties</li>
                    <li><MdCheckCircle /> GDPR & data protection compliant</li>
                    <li><MdCheckCircle /> You can export or delete your data anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
