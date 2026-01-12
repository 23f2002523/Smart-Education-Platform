import React, { useState } from 'react';
import { MdEmail, MdLock } from 'react-icons/md';
import './Login.css';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('Student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = ['Student', 'Teacher', 'Admin'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: selectedRole.toLowerCase()
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        const userRole = data.user.role;
        if (userRole === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else if (userRole === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot connect to server. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Please enter your details to sign in.</p>
        </div>

        <div className="role-tabs">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className={`role-tab ${selectedRole === role ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="/forgot-password" className="forgot-link">Forgot?</a>
            </div>
            <div className="input-wrapper">
              <MdLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="keep-logged-in">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                name="keepLoggedIn"
                checked={formData.keepLoggedIn}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              <span className="checkbox-label">Keep me logged in</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
