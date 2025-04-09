import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="flex justify-between items-center" style={{ padding: '1rem 0' }}>
          <div className="logo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                MedicalApp
              </span>
            </Link>
          </div>
          
          <nav className="nav">
            {user ? (
              <div className="flex items-center" style={{ gap: '1.5rem' }}>
                <span>
                  Welcome, {user.first_name || user.username}
                </span>
                
                {user.role === 'doctor' && (
                  <Link to="/doctor-dashboard" className="nav-link">
                    Dashboard
                  </Link>
                )}
                
                {user.role === 'patient' && (
                  <Link to="/patient-dashboard" className="nav-link">
                    Dashboard
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="btn"
                  style={{ 
                    backgroundColor: 'transparent', 
                    color: 'var(--primary-color)',
                    padding: '0.5rem 1rem'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center" style={{ gap: '1rem' }}>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;