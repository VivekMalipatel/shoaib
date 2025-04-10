import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the API URL from environment variable or use a default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'doctor' | 'patient';
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'doctor' | 'patient';
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/user`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setUser(response.data);
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const setupInterceptors = () => {
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refresh_token');
              
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }
              
              const response = await axios.post(`${API_URL}/api/refresh`, {}, {
                headers: {
                  Authorization: `Bearer ${refreshToken}`
                }
              });
              
              const { access_token } = response.data;
              localStorage.setItem('access_token', access_token);
              
              originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
              return axios(originalRequest);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              logout();
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
    };
    
    setupInterceptors();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post<LoginResponse>(`${API_URL}/api/login`, {
        username,
        password
      });
      
      const { user, access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setUser(user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...apiData } = userData;
      
      const response = await axios.post<LoginResponse>(`${API_URL}/api/register`, apiData);
      
      const { user, access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setUser(user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    
    // Optional: Call logout endpoint to invalidate tokens on server
    // This depends on how your backend is set up
    axios.post(`${API_URL}/api/logout`).catch(console.error);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};