import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setFormError('Username and password are required');
      return;
    }
    
    try {
      await login(username, password);
      // No need to redirect, the Auth context will update the user
      // which will trigger a redirect in App.tsx
    } catch (err) {
      // Error handling is done in the auth context
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="flex" style={{ minHeight: '100vh', alignItems: 'center' }}>
          <div className="auth-container" style={{ flex: 1 }}>
            <div className="form-container">
              <h1 className="text-center">Login</h1>
              
              {(error || formError) && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {formError || error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                
                <p className="text-center">
                  Don't have an account? <Link to="/register">Register here</Link>
                </p>
              </form>
            </div>
          </div>
          
          <div className="auth-hero" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2>Welcome to Medical Appointment System</h2>
            <p>
              Login to schedule appointments with doctors or manage your patient appointments.
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
              <li>Easy appointment scheduling</li>
              <li>Track appointment history</li>
              <li>Manage availability (for doctors)</li>
              <li>Get reminders for upcoming appointments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;