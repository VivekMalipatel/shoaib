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
  patient_id: number;
  patient_name: string;
  status: string;
  appointment_type: string;
  notes?: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
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
        
        // Fetch doctor's appointments
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/doctor`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAppointments(appointmentsResponse.data);
        
        // Fetch doctor's availability
        const availabilityResponse = await axios.get(`${API_URL}/api/doctors/${user?.id}/availability`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Transform availability data to match our interface
        const transformedAvailability = availabilityResponse.data.map((item: any) => ({
          date: item.date,
          slots: item.time_slots.map((time: string) => ({
            time,
            isAvailable: true
          }))
        }));
        
        setAvailabilities(transformedAvailability);
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
          <h3>Available Time Slots</h3>
          <p className="stat">
            {availabilities.reduce((total, day) => total + day.slots.filter(slot => slot.isAvailable).length, 0)}
          </p>
        </div>
      </div>
      
      <div className="recent-appointments" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center">
          <h3>Recent Appointments</h3>
          <Link to="/doctor-dashboard/appointments" className="btn">View All</Link>
        </div>
        
        <div className="appointments-list" style={{ marginTop: '1rem' }}>
          {loading ? (
            <p>Loading appointments...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.slice(0, 5).map(appointment => (
              <div key={appointment.id} className="card" style={{ marginBottom: '1rem' }}>
                <div className="flex justify-between">
                  <div>
                    <h4>{appointment.patient_name}</h4>
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
      <h2>All Appointments</h2>
      
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list" style={{ marginTop: '1.5rem' }}>
          {appointments.map(appointment => (
            <div key={appointment.id} className="card" style={{ marginBottom: '1rem' }}>
              <div className="flex justify-between">
                <div>
                  <h4>{appointment.patient_name}</h4>
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
                  
                  <div className="flex" style={{ gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                      Complete
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Availability management page
  const Availability = () => (
    <div className="availability-page">
      <h2>Manage Availability</h2>
      
      <p style={{ marginTop: '1rem' }}>
        Set your available time slots for patients to book appointments.
      </p>
      
      {loading ? (
        <p>Loading availability...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="availability-manager" style={{ marginTop: '1.5rem' }}>
          <h3>Current Availability</h3>
          
          {availabilities.length === 0 ? (
            <p>No availability set. Add new time slots below.</p>
          ) : (
            availabilities.map((day, index) => (
              <div key={index} className="card" style={{ marginBottom: '1rem' }}>
                <h4>{new Date(day.date).toLocaleDateString()}</h4>
                <div className="time-slots" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {day.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="time-slot">
                      {slot.time}
                    </div>
                  ))}
                </div>
                <button 
                  className="btn" 
                  style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                >
                  Edit
                </button>
              </div>
            ))
          )}
          
          <div className="add-availability" style={{ marginTop: '2rem' }}>
            <h3>Add New Availability</h3>
            <p>This feature is not fully implemented in this basic version.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="doctor-dashboard">
      <Header />
      
      <main className="dashboard-content">
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Sidebar Navigation */}
            <div className="sidebar">
              <div className="card">
                <div className="doctor-info" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
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
                  <p>Doctor</p>
                </div>
                
                <nav className="dashboard-nav">
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/doctor-dashboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        Dashboard
                      </Link>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/doctor-dashboard/appointments" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        Appointments
                      </Link>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/doctor-dashboard/availability" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
                        Availability
                      </Link>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link to="/doctor-dashboard/profile" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--border-radius)' }}>
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
                <Route path="/availability" element={<Availability />} />
                <Route path="/profile" element={<h2>Profile Page (Not Implemented)</h2>} />
              </Routes>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;