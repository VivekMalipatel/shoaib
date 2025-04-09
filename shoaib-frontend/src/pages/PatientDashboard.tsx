import React, { useState, useEffect } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import axios from 'axios';

// Define the API URL from environment variable or use a default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Appointment {
  id: number;
  date: string;
  time: string;
  doctor_id: number;
  doctor_name: string;
  status: string;
  appointment_type: string;
  notes?: string;
}

interface Doctor {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch patient's appointments
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/patient`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAppointments(appointmentsResponse.data);
        
        // Fetch available doctors
        const doctorsResponse = await axios.get(`${API_URL}/api/doctors`);
        setDoctors(doctorsResponse.data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Main dashboard overview
  const Dashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-container grid" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>Total Appointments</h3>
          <p className="stat">{appointments.length}</p>
        </div>
        
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <p className="stat">
            {appointments.filter(app => app.status === 'scheduled').length}
          </p>
        </div>
        
        <div className="card">
          <h3>Available Doctors</h3>
          <p className="stat">{doctors.length}</p>
        </div>
      </div>
      
      <div className="recent-appointments" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center">
          <h3>Recent Appointments</h3>
          <Link to="/patient-dashboard/appointments" className="btn">View All</Link>
        </div>
        
        <div className="appointments-list" style={{ marginTop: '1rem' }}>
          {loading ? (
            <p>Loading appointments...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : appointments.length === 0 ? (
            <p>No appointments found. <Link to="/patient-dashboard/book">Book an appointment</Link> with a doctor.</p>
          ) : (
            appointments.slice(0, 5).map(appointment => (
              <div key={appointment.id} className="card" style={{ marginBottom: '1rem' }}>
                <div className="flex justify-between">
                  <div>
                    <h4>Dr. {appointment.doctor_name}</h4>
                    <p>
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                    <p>Type: {appointment.appointment_type}</p>
                  </div>
                  <div>
                    <span className={`status status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Appointments list page
  const Appointments = () => (
    <div className="appointments-page">
      <h2>My Appointments</h2>
      
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found. <Link to="/patient-dashboard/book">Book an appointment</Link> with a doctor.</p>
      ) : (
        <div className="appointments-list" style={{ marginTop: '1.5rem' }}>
          {appointments.map(appointment => (
            <div key={appointment.id} className="card" style={{ marginBottom: '1rem' }}>
              <div className="flex justify-between">
                <div>
                  <h4>Dr. {appointment.doctor_name}</h4>
                  <p>
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                  <p>Type: {appointment.appointment_type}</p>
                  {appointment.notes && <p>Notes: {appointment.notes}</p>}
                </div>
                <div className="flex flex-column" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={`status status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                  
                  {appointment.status === 'scheduled' && (
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Reschedule
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Book appointment page
  const BookAppointment = () => (
    <div className="book-appointment-page">
      <h2>Book a New Appointment</h2>
      
      <p style={{ marginTop: '1rem' }}>
        Select a doctor and check their availability to book your appointment.
      </p>
      
      {loading ? (
        <p>Loading doctors...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : doctors.length === 0 ? (
        <p>No doctors available at the moment.</p>
      ) : (
        <div className="doctors-list grid" style={{ marginTop: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {doctors.map(doctor => (
            <div key={doctor.id} className="card">
              <div className="doctor-card">
                <div className="avatar" style={{ 
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {doctor.first_name?.charAt(0) || doctor.username.charAt(0)}
                </div>
                <h4 style={{ textAlign: 'center' }}>Dr. {doctor.first_name} {doctor.last_name}</h4>
                <p style={{ textAlign: 'center', marginBottom: '1rem' }}>{doctor.email}</p>
                <button className="btn" style={{ width: '100%' }}>
                  Check Availability
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="booking-form" style={{ marginTop: '2rem' }}>
        <p>The complete booking form is not implemented in this basic version.</p>
      </div>
    </div>
  );

  return (
    <div className="patient-dashboard">
      <Header />
      
      <main className="dashboard-content">
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Sidebar Navigation */}
            <div className="sidebar">
              <div className="card">
                <div className="patient-info" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div className="avatar" style={{ 
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                  </div>
                  <h3>{user?.first_name} {user?.last_name}</h3>
                  <p>Patient</p>
                </div>
                
                <nav className="dashboard-nav">
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/patient-dashboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        Dashboard
                      </Link>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/patient-dashboard/appointments" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        My Appointments
                      </Link>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/patient-dashboard/book" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        Book Appointment
                      </Link>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/patient-dashboard/profile" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        Profile
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="main-content card">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/book" element={<BookAppointment />} />
                <Route path="/profile" element={<h2>Profile Page (Not Implemented)</h2>} />
              </Routes>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;