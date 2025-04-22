/**
 * API Configuration File
 * 
 * This file contains the backend API configuration settings.
 * Change this file to update the API URL throughout the application.
 */

// Use relative URLs for API endpoints to work with Vite's proxy
// This will automatically use the same origin as the frontend
const API_BASE_URL = '';

// Set default timezone to Chicago (US Central Time)
const DEFAULT_TIMEZONE = 'America/Chicago';

// API Endpoints
const API_ENDPOINTS = {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    user: `${API_BASE_URL}/api/user`,
    logout: `${API_BASE_URL}/api/logout`,
    doctors: `${API_BASE_URL}/api/doctors`,
    doctorAvailability: (doctorId) => `${API_BASE_URL}/api/doctors/${doctorId}/availability`,
    patientAppointments: `${API_BASE_URL}/api/appointments/patient`,
    doctorAppointments: `${API_BASE_URL}/api/appointments/doctor`,
    createAppointment: `${API_BASE_URL}/api/appointments`,
    updateAppointment: (appointmentId) => `${API_BASE_URL}/api/appointments/${appointmentId}`,
    profile: `${API_BASE_URL}/api/profile`
};

// Helper function to format dates in Chicago timezone
function formatInChicagoTimezone(date, options = {}) {
    return new Date(date).toLocaleString('en-US', {
        ...options,
        timeZone: DEFAULT_TIMEZONE
    });
}

// Helper function to get a Date object in Chicago timezone
function getChicagoDate(date = new Date()) {
    const chicagoTime = new Date(formatInChicagoTimezone(date, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    }));
    return chicagoTime;
}