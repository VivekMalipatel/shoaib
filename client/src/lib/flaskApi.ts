/**
 * Flask API client for making requests to the Flask backend
 */

// Base URL for the Flask API
// This configuration works whether Flask is running locally or via host URL
const FLASK_API_BASE_URL = 'http://127.0.0.1:5001/api';

function getCsrfToken() {
  const csrfCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_access_token='));

  if (!csrfCookie) {
    console.warn('CSRF token not found in cookies. Ensure the server is setting the csrf_access_token cookie.');
    return null;
  }

  const token = csrfCookie.split('=')[1];
  console.log('Extracted CSRF Token:', token);
  return token;
}

export async function apiRequestFlask<T>(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<T> {
  const url = `${FLASK_API_BASE_URL}${endpoint}`;
  const csrfToken = getCsrfToken();
  const accessToken = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    ...(data ? { 'Content-Type': 'application/json' } : {}),
    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
  };

  const response = await fetch(url, {
    method,
    headers,
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