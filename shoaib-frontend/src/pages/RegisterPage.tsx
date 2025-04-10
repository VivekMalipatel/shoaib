import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    first_name: '',
    last_name: ''
  });
  
  const [formError, setFormError] = useState('');
  const { register, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.username.trim()) return 'Username is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.first_name.trim()) return 'First name is required';
    if (!formData.last_name.trim()) return 'Last name is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    try {
      await register(formData);
      // No need to redirect, the Auth context will update the user
      // which will trigger a redirect in App.tsx
    } catch (err) {
      // Error handling is done in the auth context
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="flex" style={{ minHeight: '100vh', alignItems: 'center' }}>
          <div className="auth-container" style={{ flex: 1 }}>
            <div className="form-container">
              <h1 className="text-center">Register</h1>
              
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
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="form-input"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="form-input"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role" className="form-label">I am a</label>
                  <select
                    id="role"
                    name="role"
                    className="form-input"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="btn"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>
                
                <p className="text-center">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </form>
            </div>
          </div>
          
          <div className="auth-hero" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2>Join Our Medical Appointment System</h2>
            <p>
              Create an account to access our appointment scheduling platform designed for both patients and healthcare providers.
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
              <li>Patients can easily book appointments with preferred doctors</li>
              <li>Doctors can manage their schedule and patient appointments</li>
              <li>Real-time availability updates</li>
              <li>Appointment reminders and notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;