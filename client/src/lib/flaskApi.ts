/**
 * Flask API client for making requests to the Flask backend
 */

// Base URL for the Flask API
// Use the public URL from Replit with the correct port for Flask
const FLASK_API_BASE_URL = window.location.protocol + '//' + window.location.hostname + ':5001/api';

export async function apiRequestFlask<T>(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<T> {
  const url = `${FLASK_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
  }

  // For non-GET requests with no content, just return undefined
  if (method !== 'GET' && response.status === 204) {
    return undefined as T;
  }

  return await response.json() as T;
}

// Authentication functions
export async function loginWithFlask(username: string, password: string) {
  return apiRequestFlask<any>('POST', '/login', { username, password });
}

export async function registerWithFlask(userData: any) {
  return apiRequestFlask<any>('POST', '/register', userData);
}

export async function logoutFromFlask() {
  return apiRequestFlask<void>('POST', '/logout');
}

export async function getCurrentUser() {
  try {
    return await apiRequestFlask<any>('GET', '/user');
  } catch (error) {
    return null;
  }
}

// Doctor-related functions
export async function getDoctors() {
  return apiRequestFlask<any[]>('GET', '/doctors');
}

export async function getDoctorAvailability(doctorId: number) {
  return apiRequestFlask<any[]>('GET', `/doctors/${doctorId}/availability`);
}

export async function setDoctorAvailability(doctorId: number, data: any) {
  return apiRequestFlask<any>('POST', `/doctors/${doctorId}/availability`, data);
}

// Appointment-related functions
export async function createAppointment(data: any) {
  return apiRequestFlask<any>('POST', '/appointments', data);
}

export async function getDoctorAppointments() {
  return apiRequestFlask<any[]>('GET', '/appointments/doctor');
}

export async function getPatientAppointments() {
  return apiRequestFlask<any[]>('GET', '/appointments/patient');
}

export async function updateAppointment(appointmentId: number, data: any) {
  return apiRequestFlask<any>('PUT', `/appointments/${appointmentId}`, data);
}