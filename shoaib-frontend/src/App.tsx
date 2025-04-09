import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={
          user ? (
            <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />
          ) : (
            <LoginPage />
          )
        } />
        
        <Route path="/register" element={
          user ? (
            <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />
          ) : (
            <RegisterPage />
          )
        } />
        
        <Route 
          path="/doctor-dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/patient-dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={
          user ? (
            <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;